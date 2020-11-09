const { messageTypes, subscribe } = require('../../integrations/pubsub');

const { MESSAGE_TYPE_CODE_SNIFFER_REQUEST } = messageTypes;

const main = async () => {
    await subscribe(MESSAGE_TYPE_CODE_SNIFFER_REQUEST, {
        pushEndpoint: 'http://localhost:8110',
    });

    // Keep our process running indefinitely
    setInterval(() => {}, 1 << 30); // eslint-disable-line no-bitwise
};

main();
