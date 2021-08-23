class StorageMock {
  static mockInstances = [];

  static clearAllMocks() {
      StorageMock.mockInstances.forEach((instance) => Object.getOwnPropertyNames(
          instance.constructor.prototype,
      ).forEach((method) => method.mockClear()));

      StorageMock.mockInstances.length = 0;
  }

  constructor() {
      Object.getOwnPropertyNames(this.constructor.prototype).forEach((method) => {
          jest.spyOn(this, method);
      });

      StorageMock.mockInstances.push(this);
  }

  bucket(bucketName) {
      if (bucketName === 'ERROR_BUCKET') {
          throw new Error('some error happened');
      }
      return {
          fake: () => this,
          file: (fileName) => ({
              save: (data, options, callback) => callback(false),
              download: () => {
                  if (fileName === 'missingfile.json') {
                      throw new Error('some error happened');
                  }
                  return [JSON.stringify({ key: 'value' })];
              },
          }),
          exists: () => [true],
      };
  }
}

module.exports.Storage = StorageMock;
