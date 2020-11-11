const { PubSub } = require('@google-cloud/pubsub');
const invariant = require('invariant');

const TOPIC_NAME = 'audits';
const SUBSCRIPTION_NAME = 'tide';

const MESSAGE_TYPE_LIGHTHOUSE_REQUEST = 'MESSAGE_TYPE_LIGHTHOUSE_REQUEST';
const MESSAGE_TYPE_LIGHTHOUSE_RESPONSE = 'MESSAGE_TYPE_LIGHTHOUSE_RESPONSE';
const MESSAGE_TYPE_CODE_SNIFFER_REQUEST = 'MESSAGE_TYPE_CODE_SNIFFER_REQUEST';
const MESSAGE_TYPE_CODE_SNIFFER_RESPONSE = 'MESSAGE_TYPE_CODE_SNIFFER_RESPONSE';

const messageTypes = {
    MESSAGE_TYPE_LIGHTHOUSE_REQUEST,
    MESSAGE_TYPE_LIGHTHOUSE_RESPONSE,
    MESSAGE_TYPE_CODE_SNIFFER_REQUEST,
    MESSAGE_TYPE_CODE_SNIFFER_RESPONSE,
};

let pubsubInstance;
const topic = TOPIC_NAME;

const getPubsub = async () => {
    if (!pubsubInstance) {
        pubsubInstance = new PubSub({ apiEndpoint: 'localhost:8085' });
        await pubsubInstance.topic(topic).get({ autoCreate: true });
    }
    return pubsubInstance;
};

const publish = async (message) => {
    const buffer = Buffer.from(JSON.stringify(message));
    const pubsub = await getPubsub();
    const messageId = await pubsub.topic(topic).publish(buffer);
    console.debug(`Message ${messageId} published to ${topic} with ${JSON.stringify(message)}`); // eslint-disable-line no-console
};

const getMessage = (messageType, messageBody) => {
    invariant(messageTypes[messageType], `MessageType must be one of ${Object.keys(messageTypes).join()}`);

    return {
        type: messageType,
        body: messageBody,
    };
};

const subscribe = () => SUBSCRIPTION_NAME;

module.exports = {
    messageTypes,
    subscribe,
    publish,
    getMessage,
};
