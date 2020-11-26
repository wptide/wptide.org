/**
 * Internal Dependencies.
 */
const phpcsAudit = require('../audits/phpcs');
const { messageTypes, getPubsub } = require('../integrations/pubsub');
const { getAuditDoc, setAuditDoc } = require('../integrations/datastore');

exports.phpcsServer = async (data, context) => {
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));
    let updatedAudit = await getAuditDoc(message.id);

    if (updatedAudit.reports.phpcs_phpcompatibilitywp === 'processing') {
        console.debug(`Already processing PHPCS audit for ${message.slug} v${message.version}`);
        return;
    }

    if (!!message.id && !!message.slug) {
        console.debug(`Running PHPCS audit for ${message.slug} v${message.version}`);
        updatedAudit.reports.phpcs_phpcompatibilitywp = 'processing';
        await setAuditDoc(message.id, updatedAudit);

        message.type = 'phpcs_phpcompatibilitywp';
        message.audit = await phpcsAudit(message); // @todo handle error and set to 'failed'.

        const topic = messageTypes.MESSAGE_TYPE_AUDIT_RESPONSE;
        const buffer = Buffer.from(JSON.stringify(message));
        const pubsub = await getPubsub();

        // @todo handle error and set to 'failed'.
        const messageId = await pubsub.topic(topic).publish(buffer);

        if (messageId) {
            console.debug(`Publishing PHPCS audit for ${message.slug} v${message.version}`);
            return;
        }

        // Set status to 'failed' after 10 seconds.
        setTimeout(async () => {
            updatedAudit = await getAuditDoc(message.id);

            if (updatedAudit.reports.phpcs_phpcompatibilitywp === 'processing') {
                updatedAudit.reports.phpcs_phpcompatibilitywp = 'failed';
                console.debug(`Could not publish PHPCS audit for ${message.slug} v${message.version}`);
                await setAuditDoc(message.id, updatedAudit);
            }
        }, 10000);
    } else {
        console.debug('Could not perform PHPCS audit:', message);
    }
};
