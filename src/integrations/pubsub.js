const { PubSub } = require('@google-cloud/pubsub');

const MESSAGE_TYPE_LIGHTHOUSE_REQUEST = 'MESSAGE_TYPE_LIGHTHOUSE_REQUEST';
const MESSAGE_TYPE_CODE_SNIFFER_REQUEST = 'MESSAGE_TYPE_CODE_SNIFFER_REQUEST';
const MESSAGE_TYPE_AUDIT_RESPONSE = 'MESSAGE_TYPE_AUDIT_RESPONSE';

const messageTypes = {
    MESSAGE_TYPE_LIGHTHOUSE_REQUEST,
    MESSAGE_TYPE_CODE_SNIFFER_REQUEST,
    MESSAGE_TYPE_AUDIT_RESPONSE,
};

let pubsubInstance;

const getPubsub = async () => {
    const options = {};
    if (process.env.NODE_ENV !== 'production') {
        options.apiEndpoint = process.env.ENDPOINT_PUBSUB || 'localhost:8085';
    }
    if (process.env.GOOGLE_CLOUD_PROJECT) {
        options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    }
    if (!pubsubInstance) {
        pubsubInstance = new PubSub(options);

        // eslint-disable-next-line no-restricted-syntax
        for (const topicName of Object.keys(messageTypes)) {
            // eslint-disable-next-line no-await-in-loop
            const topic = await pubsubInstance.topic(topicName);

            // eslint-disable-next-line no-await-in-loop
            const [topicExists] = await topic.exists();
            if (!topicExists) {
                // eslint-disable-next-line no-await-in-loop
                await topic.create();
            }
        }
    }
    return pubsubInstance;
};

const publish = async (message, topicName) => {
    const buffer = Buffer.from(JSON.stringify(message));
    const pubsub = await getPubsub();
    const messageId = await pubsub.topic(topicName).publish(buffer);
    let debugMessage = JSON.stringify(message);
    debugMessage = debugMessage.length > 200 ? Object.keys(message) : debugMessage;
    console.debug(`Message ${messageId} published to ${topicName} with ${debugMessage}`); // eslint-disable-line no-console
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
};
