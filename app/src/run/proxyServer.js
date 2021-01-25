/**
 * Internal Dependencies.
 */
const { messageTypes, subscribe } = require('../integrations/pubsub');

/**
 * Proxy PubSub messages to their respective HTTP endpoints.
 * Used for local environment only.
 */
const main = async () => {
    await subscribe(messageTypes.MESSAGE_TYPE_PHPCS_REQUEST, {
        pushEndpoint: 'http://localhost:8110',
        ackDeadlineSeconds: 300,
    });
    await subscribe(messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST, {
        pushEndpoint: 'http://localhost:8090',
        ackDeadlineSeconds: 300,
    });
    await subscribe(messageTypes.MESSAGE_TYPE_SYNC_REQUEST, {
        pushEndpoint: 'http://localhost:8100',
        ackDeadlineSeconds: 30,
    });
};

main();
