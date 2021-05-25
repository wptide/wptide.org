const { createTopic, subscribeTopic, publishMessage } = require('../services/pubsub');

const MESSAGE_TYPE_LIGHTHOUSE_REQUEST = 'MESSAGE_TYPE_LIGHTHOUSE_REQUEST';
const MESSAGE_TYPE_PHPCS_REQUEST = 'MESSAGE_TYPE_PHPCS_REQUEST';
const MESSAGE_TYPE_SYNC_REQUEST = 'MESSAGE_TYPE_SYNC_REQUEST';

const messageTypes = {
    MESSAGE_TYPE_LIGHTHOUSE_REQUEST,
    MESSAGE_TYPE_PHPCS_REQUEST,
    MESSAGE_TYPE_SYNC_REQUEST,
};

let localTopicsExist = false;

/**
 * Expose if topics exist.
 *
 * @returns {boolean} The value of `localTopicsExist`.
 */
const topicsExist = () => localTopicsExist;

/**
 * Conditionally creates each Topic by looping over `messageTypes`.
 *
 * @returns {void}
 */
const maybeCreateTopics = async () => {
    if (!topicsExist()) {
        // eslint-disable-next-line no-restricted-syntax
        for (const topicName of Object.keys(messageTypes)) {
            try {
                // eslint-disable-next-line no-await-in-loop
                await createTopic(topicName);
            } catch (err) {
                console.log(err);
            }
        }
        localTopicsExist = true;
    }
};

const publish = async (message, topicName) => {
    await maybeCreateTopics();
    await publishMessage(message, topicName);
};

const subscribe = async (subscriptionName, options) => {
    await maybeCreateTopics();
    return await subscribeTopic(subscriptionName, options); // eslint-disable-line no-return-await
};

module.exports = {
    topicsExist,
    messageTypes,
    subscribe,
    publish,
};
