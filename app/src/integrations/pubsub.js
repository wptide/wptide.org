const { createTopics, subscribeTopic, publishMessage } = require('../services/pubsub');

const MESSAGE_TYPE_LIGHTHOUSE_REQUEST = 'MESSAGE_TYPE_LIGHTHOUSE_REQUEST';
const MESSAGE_TYPE_PHPCS_REQUEST = 'MESSAGE_TYPE_PHPCS_REQUEST';
const MESSAGE_TYPE_SYNC = 'MESSAGE_TYPE_SYNC';

const messageTypes = {
    MESSAGE_TYPE_LIGHTHOUSE_REQUEST,
    MESSAGE_TYPE_PHPCS_REQUEST,
    MESSAGE_TYPE_SYNC,
};

const topicsExist = false;

const publish = async (message, topicName) => {
    if (!topicsExist) {
        createTopics(Object.keys(messageTypes));
    }
    await publishMessage(message, topicName);
};

const subscribe = async (subscriptionName, options) => {
    if (!topicsExist) {
        createTopics(Object.keys(messageTypes));
    }
    const subscription = await subscribeTopic(subscriptionName, options);
    return subscription;
};

module.exports = {
    messageTypes,
    subscribe,
    publish,
};
