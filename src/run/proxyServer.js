/**
 * Internal Dependencies.
 */
const { messageTypes, subscribe } = require('../integrations/pubsub');

const main = async () => {
    await subscribe(messageTypes.MESSAGE_TYPE_PHPCS_REQUEST, {
        pushEndpoint: 'http://localhost:8110',
    });
    await subscribe(messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST, {
        pushEndpoint: 'http://localhost:8090',
    });
};

main();
