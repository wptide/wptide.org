/**
 * Internal Dependencies.
 */
const { subscribe } = require('../../../src/integrations/pubsub');

global.console.debug = jest.fn();
global.console.error = jest.fn();

afterEach(() => {
    global.console.debug.mockRestore();
    global.console.error.mockRestore();
});

const subscriptionName = 'CUSTOM_TOPIC';

/**
 * Tests for subscribe.
 */
describe('subscribe', () => {
    it('subscribes to a topic with maybeCreateTopics on first run', async () => {
        const sub = await subscribe(subscriptionName, {});
        expect(sub).toStrictEqual(subscriptionName);
        expect(global.console.debug).toBeCalledTimes(3);
        expect(global.console.debug).toBeCalledWith('Creating topic MESSAGE_TYPE_LIGHTHOUSE_REQUEST');
        expect(global.console.debug).toBeCalledWith('Creating topic MESSAGE_TYPE_PHPCS_REQUEST');
        expect(global.console.debug).toBeCalledWith('Creating topic MESSAGE_TYPE_SYNC_REQUEST');
        expect(global.console.error).toBeCalledTimes(1);
        expect(global.console.error).toBeCalledWith(`Existing subscription to ${subscriptionName} could not be deleted: `, ' Subscription does not exist');
    });
    it('subscribes to a topic with maybeCreateTopics on second run', async () => {
        const sub = await subscribe(subscriptionName, {});
        expect(sub).toStrictEqual(subscriptionName);
        expect(global.console.debug).toBeCalledTimes(0);
    });
});
