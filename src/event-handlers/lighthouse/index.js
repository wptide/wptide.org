require('../../global');
const lighthouse = require('../../audits/lighthouse');
const { publish, messageTypes } = require('../../integrations/pubsub');

const runAudit = async (themeName) => {
    const url = `https://wp-themes.com/${themeName.replace(/[^\w.-]+/g, '')}/`;
    const audit = await lighthouse(url);
    return audit;
};

const notifyAuditResults = async (id, audit) => {
    const message = {
        id,
        type: 'lighthouse',
        audit,
    };

    await publish(message, messageTypes.MESSAGE_TYPE_AUDIT_RESPONSE);
};

exports.lighthouseAudit = async (data, context) => {
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));
    if (!!message.id && !!message.slug) {
        const audit = await runAudit(message.slug);
        await notifyAuditResults(message.id, audit);
    }
};
