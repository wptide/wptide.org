const { messageTypes, subscribe } = require('../integrations/pubsub');

const {
    MESSAGE_TYPE_AUDIT_RESPONSE,
    MESSAGE_TYPE_CODE_SNIFFER_REQUEST,
    MESSAGE_TYPE_LIGHTHOUSE_REQUEST,
} = messageTypes;

const main = async () => {
    await subscribe(MESSAGE_TYPE_CODE_SNIFFER_REQUEST, {
        pushEndpoint: 'http://localhost:8110',
    });
    await subscribe(MESSAGE_TYPE_LIGHTHOUSE_REQUEST, {
        pushEndpoint: 'http://localhost:8090',
    });
    await subscribe(MESSAGE_TYPE_AUDIT_RESPONSE, {
        pushEndpoint: 'http://localhost:8100',
    });

    // Keep our process running indefinitely
    setInterval(() => {}, 1 << 30); // eslint-disable-line no-bitwise
};

main();
