/**
 * Internal Dependencies.
 */
const phpcsAudit = require('./src/audits/phpcs');
const { publish, messageTypes } = require('./src/integrations/pubsub');

exports.phpcsAudit = async (data, context) => {
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));

    if (!!message.id && !!message.slug) {
        message.type = 'phpcs';
        message.audit = await phpcsAudit(message);

        await publish(message, messageTypes.MESSAGE_TYPE_AUDIT_RESPONSE);
    }
};
