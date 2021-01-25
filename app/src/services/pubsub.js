/**
 * External Dependencies.
 */
const { PubSub } = require('@google-cloud/pubsub');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

let pubsubInstance;

/**
 * Returns a singleton instance of PubSub client.
 *
 * @returns {object} PubSub instance.
 */
const getPubsub = async () => {
    const options = {};
    if (process.env.NODE_ENV !== 'production') {
        options.apiEndpoint = process.env.ENDPOINT_PUBSUB;
        options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    }

    if (!pubsubInstance) {
        pubsubInstance = new PubSub(options);
    }
    return pubsubInstance;
};

/**
 * Create a Topic by name.
 *
 * @param {string} topicName The name of the topic.
 */
const createTopic = async (topicName) => {
    const pubsub = await getPubsub();
    const topic = await pubsub.topic(topicName);
    const [topicExists] = await topic.exists();

    if (!topicExists) {
        await topic.create();
    }
};

/**
 * Publish a message to a given topic.
 *
 * @param {string} message   Message to send.
 * @param {string} topicName Topic to which the message should be published.
 */
const publishMessage = async (message, topicName) => {
    const buffer = Buffer.from(JSON.stringify(message));
    const pubsub = await getPubsub();
    const messageId = await pubsub.topic(topicName).publish(buffer);
    let debugMessage = JSON.stringify(message);
    debugMessage = debugMessage.length > 200 ? Object.keys(message) : debugMessage;
    console.debug(`Message ${messageId} published to ${topicName} with ${debugMessage}`);
};

/**
 * Add a subscription to a topic.
 *
 * @param {string} subscriptionName Subscription name.
 * @param {object} options          Subscription options.
 *
 * @returns {Promise<*>} Topic Subscription.
 */
const subscribeTopic = async (subscriptionName, options) => {
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
    createTopic,
    subscribeTopic,
    publishMessage,
};
