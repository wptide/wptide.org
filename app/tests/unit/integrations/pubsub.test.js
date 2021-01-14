/**
 * Internal Dependencies.
 */
const { subscribe } = require('../../../src/integrations/pubsub');

jest.mock('../../../src/services/pubsub',
    () => ({
        publishMessage: () => true,
        createTopics: () => true,
        subscribeTopic: (subscriptionName) => subscriptionName,
    }));

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
