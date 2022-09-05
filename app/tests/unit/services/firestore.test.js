/**
 * Internal Dependencies.
 */
const {
    get, remove, set, snapshot,
} = require('../../../src/services/firestore');

global.console.log = jest.fn();

afterEach(() => {
    global.console.log.mockRestore();
});

const mockReport = 'Report/1a2b3c4d5e';
const mockData = {
    id: 1,
    key: 'value',
};

/**
 * Tests for Firestore.
 */
describe('Firestore service', () => {
    it('The document exists.', async () => {
        const doc = await get(mockReport);
        expect(doc).toStrictEqual(mockData);
    });
    it('The document does not exists.', async () => {
        const doc = await get('Report/e5d4c3b2a1');
        expect(doc).toBeNull();
    });
    it('The document does not exists because of an error.', async () => {
        const doc = await get(null);
        expect(doc).toBeNull();
        expect(global.console.log).toBeCalledTimes(1);
    });
    it('The document was set.', async () => {
        const doc = await set(mockReport, mockData);
        expect(doc).toBeTruthy();
        expect(global.console.log).toBeCalledTimes(0);
    });
    it('The document was updated.', async () => {
        const mockDataClone = { ...mockData };
        mockDataClone.key = 'new-value';
        const doc = await set(mockReport, mockDataClone);
        expect(doc).toBeTruthy();
        expect(global.console.log).toBeCalledTimes(0);
    });
    it('The document was not set because of an error.', async () => {
        const doc = await set(null, null);
        expect(doc).toBeFalsy();
        expect(global.console.log).toBeCalledTimes(1);
    });
    it('The document was deleted.', async () => {
        const doc = await remove(mockReport);
        expect(doc).toBeTruthy();
        expect(global.console.log).toBeCalledTimes(0);
    });
    it('The document was not deleted because of an error.', async () => {
        const doc = await remove(null);
        expect(doc).toBeFalsy();
        expect(global.console.log).toBeCalledTimes(1);
    });
    it('The collection exists with 3 docs.', async () => {
        let counter = 0;
        const limit = 3;
        const statusSnapshot = await snapshot('Status', limit);

        expect(statusSnapshot.empty).toBeFalsy();
        statusSnapshot.forEach((doc) => {
            counter += 1;
            expect(doc.data().id).toBe(counter);
            expect(doc.data().key).toBe(mockData.key);
        });
        expect(counter).toBe(limit);
    });
});

/**
 * Mock firebase-admin.
 */
jest.mock('firebase-admin', () => ({
    ...jest.mock('firebase-admin'),
    credential: {
        applicationDefault: jest.fn(),
    },
    initializeApp: jest.fn(),
    firestore: () => ({
        doc: (documentPath) => ({
            get: () => new Promise((resolve, reject) => {
                const exists = documentPath === mockReport;

                if (!documentPath) {
                    reject(new Error('something went wrong'));
                }

                resolve({
                    exists,
                    data: () => {
                        if (!exists) {
                            return null;
                        }
                        return mockData;
                    },
                });
            }),
            set: (data) => new Promise((resolve, reject) => {
                const res = {
                    _writeTime: 'timeString',
                };

                if (!data) {
                    reject(new Error('something went wrong'));
                }

                if (data.key !== mockData.key) {
                    res.updateTime = 'timeString';
                }

                resolve(res);
            }),
            delete: () => new Promise((resolve, reject) => {
                if (!documentPath) {
                    reject(new Error('something went wrong'));
                }

                resolve(true);
            }),
        }),
        collection: (collection) => ({
            limit: (limit) => ({
                get: () => new Promise((resolve, reject) => {
                    if (!collection) {
                        reject(new Error('something went wrong'));
                    }
                    resolve({
                        /* eslint-disable max-len */
                        forEach: (cb) => Array.from({ length: limit }, (_, i) => i + 1).forEach((id) => {
                            cb({
                                data: () => ({
                                    id,
                                    key: mockData.key,
                                }),
                            });
                        }),
                        empty: false,
                    });
                }),
            }),
        }),
    }),
}));
