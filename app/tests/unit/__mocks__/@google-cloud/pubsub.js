/* global spyOn */
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
          spyOn(this, method).and.callThrough();
      });

      PubSubMock.mockInstances.push(this);
  }

  topic() {
      return {
          fake: () => this,
          subscription: () => ({
              delete: (topic) => topic,
          }),
          create: (topic) => topic,
          createSubscription: (topic) => topic,
          exists: () => [true],
      };
  }

  publish() {
      return this;
  }
}

module.exports.PubSub = PubSubMock;
