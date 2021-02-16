/**
 * Internal Dependencies.
 */
const { subscribe } = require('../../../src/integrations/pubsub');

/**
 * Setup mock before running tests.
 */
beforeAll(() => {
    jest.mock('../../../src/services/pubsub', () => ({
        createTopic: () => true,
        subscribeTopic: (subscriptionName) => subscriptionName,
        publishMessage: () => true,
    }));
    global.console.debug = jest.fn();
});

/**
 * Tests for subscribe.
 */
describe('subscribe', () => {
    it('subscribes to a topic', async () => {
        const subscriptionName = 'subscription';

        expect(async () => {
            const subscription = await subscribe(subscriptionName);
            expect(subscription).toStrictEqual(subscriptionName);
        }).not.toThrow();
    });
});
