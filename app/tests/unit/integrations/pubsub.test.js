/**
 * Internal Dependencies.
 */
const { subscribe } = require('../../../src/integrations/pubsub');
const { createTopic, publishMessage } = require('../../../src/services/pubsub');

jest.mock('../../../src/services/pubsub',
    () => ({
        createTopic: jest.fn(),
        subscribeTopic: (subscriptionName) => subscriptionName,
        publishMessage: jest.fn(),
    }));

global.console.debug = jest.fn();
global.console.log = jest.fn();

beforeEach(() => {
    createTopic.mockClear();
    publishMessage.mockClear();
});

afterEach(() => {
    global.console.debug.mockRestore();
    global.console.log.mockRestore();
});

/**
 * Tests for subscribe.
 */
describe('subscribe', () => {
    it('does not subscribe to a topic', async () => {
        createTopic.mockReturnValueOnce(Promise.reject('my error message')); // eslint-disable-line prefer-promise-reject-errors

        await subscribe('subscription');
        expect(global.console.log).toBeCalledWith('my error message');
    });
    it('subscribes to a topic', async () => {
        const subscriptionName = 'subscription';

        expect(async () => {
            const subscription = await subscribe(subscriptionName);
            expect(subscription).toStrictEqual(subscriptionName);
        }).not.toThrow();
    });
});
