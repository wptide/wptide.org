/**
 * Internal Dependencies.
 */
const { messageTypes, subscribe } = require('../integrations/pubsub');

const main = async () => {
    await subscribe(messageTypes.MESSAGE_TYPE_PHPCS_REQUEST, {
        pushEndpoint: 'http://localhost:8110',
        ackDeadlineSeconds: 300,
    });
    await subscribe(messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST, {
        pushEndpoint: 'http://localhost:8090',
        ackDeadlineSeconds: 300,
    });
    await subscribe(messageTypes.MESSAGE_TYPE_SYNC, {
        pushEndpoint: 'http://localhost:8120',
        ackDeadlineSeconds: 30,
    });
};

main();
