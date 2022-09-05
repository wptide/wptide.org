/**
 * Internal Dependencies.
 */
const { createTopic, subscribeTopic, publishMessage } = require('../../../src/services/pubsub');

global.console.debug = jest.fn();
global.console.error = jest.fn();

afterEach(() => {
    global.console.debug.mockRestore();
    global.console.error.mockRestore();
});

/**
 * Tests for Pub/Sub.
 */
describe('Pub/Sub service', () => {
    it('The topic does not exist.', async () => {
        await createTopic('CUSTOM_TOPIC');
        expect(global.console.debug).toBeCalledTimes(1);
        expect(global.console.debug).toBeCalledWith('Creating topic CUSTOM_TOPIC');
    });
    it('The topic already exists.', async () => {
        await createTopic('EXISTING_TOPIC');
        expect(global.console.debug).toBeCalledTimes(0);
    });
    it('The subscription does not exist.', async () => {
        await subscribeTopic('CUSTOM_SUBSCRIPTION', {});
        expect(global.console.error).toBeCalledTimes(1);
        expect(global.console.error).toBeCalledWith('Existing subscription to CUSTOM_SUBSCRIPTION could not be deleted: ', ' Subscription does not exist');
    });
    it('The subscription already exists.', async () => {
        await subscribeTopic('EXISTING_SUBSCRIPTION', {});
        expect(global.console.debug).toBeCalledTimes(1);
        expect(global.console.debug).toBeCalledWith('Existing subscription to EXISTING_SUBSCRIPTION successfully deleted');
    });
    it('The message was published.', async () => {
        const messageId = await publishMessage({
            key: 'value',
        }, 'EXISTING_TOPIC');
        expect(messageId).toStrictEqual(1);
        expect(global.console.debug).toBeCalledTimes(1);
        expect(global.console.debug).toBeCalledWith('Message 1 published to EXISTING_TOPIC with {"key":"value"}');
    });
    it('The message was not published.', async () => {
        const messageId = await publishMessage({
            key: 'value',
        }, 'INVALID_TOPIC');
        expect(messageId).toStrictEqual(null);
        expect(global.console.error).toBeCalledTimes(1);
        expect(global.console.error).toBeCalledWith('Message could not be published to INVALID_TOPIC with {"key":"value"}', new Error('some error happened'));
    });
});
