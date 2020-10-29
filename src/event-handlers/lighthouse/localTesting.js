const { PubSub } = require('@google-cloud/pubsub');

async function main() {
    const apiEndpoint = 'localhost:8085';
    console.log(`Listening to the Pub/Sub emulator event at: ${apiEndpoint}`); // eslint-disable-line no-console
    const pubsub = new PubSub({
        apiEndpoint, // Pub/Sub emulator endpoint
        projectId: 'myproject',
    });
    const topic = await pubsub.topic('my-topic');
    const [topicExists] = await topic.exists();
    if (!topicExists) {
        await topic.create();
    }
    await topic.createSubscription('my_subscription', {
        pushEndpoint: 'http://localhost:8080',
    });
}

main();
