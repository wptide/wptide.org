/**
 * Internal Dependencies.
 */
const { subscribe } = require('../../../src/integrations/pubsub');

/**
 * Setup mock before running tests.
 */
beforeAll(() => {
    jest.mock('../../../src/services/pubsub', () => ({
        createTopics: () => true,
        subscribeTopic: (subscriptionName) => subscriptionName,
        publishMessage: () => true,
    }));
});

/**
 * Tests for subscribe.
 */
describe('subscribe', () => {
    it('subscribes to a given subscription', async () => {
        const subscriptionName = 'subscription1';

        expect(async () => {
            const subscription = await subscribe(subscriptionName);
            expect(subscription).toStrictEqual(subscriptionName);
        }).not.toThrow();
    });
});
