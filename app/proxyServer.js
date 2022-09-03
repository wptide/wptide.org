/**
 * Internal Dependencies.
 */
const { messageTypes, subscribe } = require('./src/integrations/pubsub');

/**
 * Proxy PubSub messages to their respective HTTP endpoints.
 * Used for local environment only.
 */
const main = async () => {
    await subscribe(messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST, {
        pushEndpoint: 'http://localhost:5010',
        ackDeadlineSeconds: 180,
    });
    await subscribe(messageTypes.MESSAGE_TYPE_PHPCS_REQUEST, {
        pushEndpoint: 'http://localhost:5011',
        ackDeadlineSeconds: 180,
    });
    await subscribe(messageTypes.MESSAGE_TYPE_SYNC_REQUEST, {
        pushEndpoint: 'http://localhost:5012',
        ackDeadlineSeconds: 180,
    });
};

main();
