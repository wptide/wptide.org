const { PubSub } = require('@google-cloud/pubsub');

const TOPIC_NAME = 'audits';
const SUBSCRIPTION_NAME = 'tide';

const pubsub = new PubSub();
const topic = TOPIC_NAME;

const publish = async (message) => {
    const messageId = await pubsub.topic(topic).publish(message);
    console.debug(`Message ${messageId} published to ${topic} with ${JSON.stringify(message)}`); // eslint-disable-line no-console
};

const subscribe = () => SUBSCRIPTION_NAME;

module.exports = {
    subscribe,
    publish,
};
