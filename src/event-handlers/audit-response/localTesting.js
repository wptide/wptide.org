const { messageTypes, subscribe } = require('../../integrations/pubsub');

const { MESSAGE_TYPE_AUDIT_RESPONSE } = messageTypes;

const main = async () => {
    await subscribe(MESSAGE_TYPE_AUDIT_RESPONSE, {
        pushEndpoint: 'http://localhost:8100',
    });

    // Keep our process running indefinitely
    setInterval(() => {}, 1 << 30); // eslint-disable-line no-bitwise
};

main();
