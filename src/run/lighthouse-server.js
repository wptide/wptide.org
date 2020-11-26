/**
 * Internal Dependencies.
 */
const lighthouseAudit = require('../audits/lighthouse');
const { messageTypes, getPubsub } = require('../integrations/pubsub');
const { getAuditDoc, setAuditDoc } = require('../integrations/datastore');

exports.lighthouseServer = async (data, context) => {
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));
    const existingAuditData = await getAuditDoc(message.id);
    let updatedAudit = { ...existingAuditData };

    if (updatedAudit.reports.lighthouse === 'processing') {
        console.debug(`Already processing Lighthouse audit for ${message.slug} v${message.version}`);
        return;
    }

    if (!!message.id && !!message.slug) {
        const url = `https://wp-themes.com/${message.slug.replace(/[^\w.-]+/g, '')}/`; // @todo maybe move to lighthouseAudit.

        console.debug(`Running Lighthouse audit for ${message.slug} v${message.version}`);
        updatedAudit.reports.lighthouse = 'processing';
        await setAuditDoc(message.id, updatedAudit);

        message.type = 'lighthouse';
        message.audit = await lighthouseAudit(url); // @todo handle error and set back 'failed'.

        const topic = messageTypes.MESSAGE_TYPE_AUDIT_RESPONSE;
        const buffer = Buffer.from(JSON.stringify(message));
        const pubsub = await getPubsub();

        // @todo handle error and set to 'failed'.
        const messageId = await pubsub.topic(topic).publish(buffer);

        if (messageId) {
            console.debug(`Publishing Lighthouse audit for ${message.slug} v${message.version}`);
            return;
        }

        // Set status to 'failed' after 10 seconds.
        setTimeout(async () => {
            updatedAudit = await getAuditDoc(message.id);

            if (updatedAudit.reports.lighthouse === 'processing') {
                updatedAudit.reports.lighthouse = 'failed';
                console.debug(`Could not publish Lighthouse audit for ${message.slug} v${message.version}`);
                await setAuditDoc(message.id, updatedAudit);
            }
        }, 10000);
    } else {
        console.debug('Could not perform Lighthouse audit:', message);
    }
};
