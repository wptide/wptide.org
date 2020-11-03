const { messageTypes, subscribe } = require('../../integrations/pubsub');

const { MESSAGE_TYPE_LIGHTHOUSE_REQUEST } = messageTypes;

const main = async () => {
    await subscribe(MESSAGE_TYPE_LIGHTHOUSE_REQUEST, {
        pushEndpoint: 'http://localhost:8090',
    });

    // Keep our process running indefinitely
    setInterval(() => {}, 1 << 30); // eslint-disable-line no-bitwise
};

main();
