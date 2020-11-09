const phpcsAudit = require('../../audits/phpcs');
const { publish, messageTypes } = require('../../integrations/pubsub');

const runAudit = async (settings) => {
    const audit = await phpcsAudit(settings);
    return audit;
};

const notifyAuditResults = async (id, audit) => {
    const message = {
        id,
        type: 'phpcs',
        audit,
    };

    await publish(message, messageTypes.MESSAGE_TYPE_AUDIT_RESPONSE);
};

exports.phpcsAudit = async (data, context) => {
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));
    if (!!message.id && !!message.slug) {
        console.log(message);
        const audit = runAudit(message);
        await notifyAuditResults(message.id, audit);
    }
};
