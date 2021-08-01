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

/**
 * Tests for Firestore.
 */
describe('Firestore service', () => {
    const data = {
        prop: 'value',
    };
    it('The document exists.', async () => {
        const doc = await get('collection/exists');
        expect(doc).toStrictEqual(data);
    });
    it('The document does not exists.', async () => {
        const doc = await get('collection/id');
        expect(doc).toBeNull();
    });
    it('The document does not exists because of an error.', async () => {
        const doc = await get('collection/error');
        expect(doc).toBeNull();
        expect(global.console.log).toBeCalledTimes(1);
    });
    it('The document was set.', async () => {
        const doc = await set('collection/exists', data);
        expect(doc).toBeTruthy();
        expect(global.console.log).toBeCalledTimes(0);
    });
    it('The document was updated.', async () => {
        const dataClone = data;
        dataClone.prop = 'new-value';
        const doc = await set('collection/exists', dataClone);
        expect(doc).toBeTruthy();
        expect(global.console.log).toBeCalledTimes(0);
    });
    it('The document was not set because of an error.', async () => {
        const doc = await set('collection/error', null);
        expect(doc).toBeFalsy();
        expect(global.console.log).toBeCalledTimes(1);
    });
    it('The document was deleted.', async () => {
        const doc = await remove('collection/exists');
        expect(doc).toBeTruthy();
        expect(global.console.log).toBeCalledTimes(0);
    });
    it('The document was not deleted because of an error.', async () => {
        const doc = await remove('collection/error');
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
            expect(doc).toStrictEqual(counter);
        });
        expect(counter).toStrictEqual(limit);
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
                const exists = documentPath !== 'collection/id';

                if (documentPath === 'collection/error') {
                    reject(new Error('something went wrong'));
                }

                resolve({
                    exists,
                    data: () => {
                        if (!exists) {
                            return null;
                        }
                        return {
                            prop: 'value',
                        };
                    },
                });
            }),
            set: (data) => new Promise((resolve, reject) => {
                const res = {
                    _writeTime: 'timeString',
                };

                if (!data || !data.prop) {
                    reject(new Error('something went wrong'));
                }

                if (data.prop !== 'value') {
                    res.updateTime = 'timeString';
                }

                resolve(res);
            }),
            delete: () => new Promise((resolve, reject) => {
                if (documentPath === 'collection/error') {
                    reject(new Error('something went wrong'));
                }

                resolve(true);
            }),
        }),
        collection: (collection) => ({
            limit: (limit) => ({
                get: () => new Promise((resolve, reject) => {
                    if (collection === 'error') {
                        reject(new Error('something went wrong'));
                    }
                    resolve({
                        forEach: (cb) => Array.from({ length: limit }, (_, i) => i + 1).forEach(cb),
                        empty: false,
                    });
                }),
            }),
        }),
    }),
}));
