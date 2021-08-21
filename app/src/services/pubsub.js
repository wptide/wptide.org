/**
 * External Dependencies.
 */
const { PubSub } = require('@google-cloud/pubsub');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

let pubSubInstance;

/**
 * Returns a singleton instance of PubSub client.
 *
 * @returns {object} PubSub instance.
 */
const getPubSub = async () => {
    const options = {};

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
        options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    }

    if (!pubSubInstance) {
        pubSubInstance = new PubSub(options);
    }

    return pubSubInstance;
};

/**
 * Create a Topic by name.
 *
 * @param {string} topicName The name of the topic.
 */
const createTopic = async (topicName) => {
    const pubSub = await getPubSub();
    const topic = await pubSub.topic(topicName);
    const [topicExists] = await topic.exists();

    if (!topicExists) {
        console.debug(
            `Creating topic ${topicName}`,
        );
        await topic.create();
    }
};

/**
 * Add a subscription to a topic.
 *
 * @param   {string}     subscriptionName Subscription name.
 * @param   {object}     options          Subscription options.
 * @returns {Promise<*>}                  Topic Subscription.
 */
const subscribeTopic = async (subscriptionName, options) => {
    const pubSub = await getPubSub();
    const topic = await pubSub.topic(subscriptionName);
    const subscription = await topic.subscription(subscriptionName);
    /* istanbul ignore else */
    if (subscription) {
        try {
            await subscription.delete();
            console.debug(
                `Existing subscription to ${subscriptionName} successfully deleted`,
            );
        } catch (error) {
            console.error(
                `Existing subscription to ${subscriptionName} could not be deleted: `,
                error.details,
            );
        }
    }

    return topic.createSubscription(subscriptionName, options);
};

/**
 * Publish a message to a given topic.
 *
 * @param   {string}      message   Message to send.
 * @param   {string}      topicName Topic to which the message should be published.
 * @returns {string|null}           The message ID or null.
 */
const publishMessage = async (message, topicName) => {
    const messageString = JSON.stringify(message);
    const buffer = Buffer.from(messageString);
    const pubSub = await getPubSub();
    try {
        const messageId = await pubSub.topic(topicName).publish(buffer);
        console.debug(
            `Message ${messageId} published to ${topicName} with ${messageString}`,
        );
        return messageId;
    } catch (error) {
        console.error(
            `Message could not be published to ${topicName} with ${messageString}`,
            error,
        );
    }

    return null;
};

module.exports = {
    createTopic,
    subscribeTopic,
    publishMessage,
};
