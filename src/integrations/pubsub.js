const { PubSub } = require('@google-cloud/pubsub');
const invariant = require('invariant');

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

const getPubsub = async () => {
    if (!pubsubInstance) {
        pubsubInstance = new PubSub({ apiEndpoint: 'localhost:8085' });
        Object.keys(messageTypes).forEach(async (topicName) => {
            const topic = await pubsubInstance.topic(topicName);
            const [topicExists] = await topic.exists();
            if (!topicExists) {
                await topic.create();
            }
        });
        /*
        for (const [topic_name] of Object.entries(messageTypes)) {
            const topic = await pubsubInstance.topic(topic_name);
            const [topicExists] = await topic.exists();
            if (!topicExists) {
                await topic.create();
            }
        }
         */
    }
    return pubsubInstance;
};

const publish = async (message, topicName) => {
    const buffer = Buffer.from(JSON.stringify(message));
    const pubsub = await getPubsub();
    const messageId = await pubsub.topic(topicName).publish(buffer);
    console.debug(`Message ${messageId} published to ${topicName} with ${JSON.stringify(message)}`); // eslint-disable-line no-console
};

const getMessage = (messageType, messageBody) => {
    invariant(messageTypes[messageType], `MessageType must be one of ${Object.keys(messageTypes).join()}`);

    return {
        type: messageType,
        body: messageBody,
    };
};

const subscribe = async (subscriptionName, options) => {
    const pubsub = await getPubsub();
    const topic = await pubsub.topic(subscriptionName);
    let subscription = await topic.subscription(subscriptionName);
    if (subscription) {
        try {
            await subscription.delete();
            // eslint-disable-next-line no-console
            console.debug(
                `Subscription ${subscriptionName} successfully deleted`,
            );
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
                `Subscription ${subscriptionName} could not be deleted: `,
                error.details,
            );
        }
    }
    subscription = await topic.createSubscription(subscriptionName, options);

    return subscription;
};

module.exports = {
    messageTypes,
    subscribe,
    publish,
    getMessage,
};
