/**
 * @param   {string} message The error message.
 * @returns {Error}          The custom Error object.
 */
function CustomException(message) {
    const error = new Error(message);
    return {
        ...error,
        details: message.split(':')[1],
    };
}
CustomException.prototype = Object.create(Error.prototype);

class PubSubMock {
    static mockInstances = [];

    static clearAllMocks() {
        PubSubMock.mockInstances.forEach((instance) => Object.getOwnPropertyNames(
            instance.constructor.prototype,
        ).forEach((method) => method.mockClear()));

        PubSubMock.mockInstances.length = 0;
    }

    constructor() {
        Object.getOwnPropertyNames(this.constructor.prototype).forEach((method) => {
            jest.spyOn(this, method);
        });

        PubSubMock.mockInstances.push(this);
    }

    topic(topicName) {
        if (topicName === 'ERROR_TOPIC') {
            throw new Error('some error happened');
        }
        return {
            create: (topic) => topic,
            createSubscription: (subscriptionName) => subscriptionName,
            exists: () => [topicName === 'EXISTING_TOPIC'],
            subscription: (subscriptionName) => ({
                delete: () => {
                    if (subscriptionName !== 'EXISTING_SUBSCRIPTION') {
                        throw new CustomException('5 NOT_FOUND: Subscription does not exist');
                    }
                    return this;
                },
            }),
            publish: () => {
                if (topicName !== 'EXISTING_TOPIC') {
                    throw new Error('some error happened');
                }
                return 1;
            },
        };
    }

    publish() {
        return this;
    }
}

module.exports.PubSub = PubSubMock;
