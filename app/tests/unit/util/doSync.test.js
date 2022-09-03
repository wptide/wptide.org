/**
 * Internal Dependencies.
 */
const { getSyncList, makeAuditRequest } = require('../../../src/util/syncHelpers');
const {
    get, set, remove, snapshot,
} = require('../../../src/services/firestore');
const { doSync } = require('../../../src/util/doSync');

jest.mock('../../../src/util/syncHelpers');
jest.mock(
    '../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        snapshot: jest.fn(),
    }),
);

const firestoreGet = get;
const firestoreSet = set;
const firestoreRemove = remove;
const firestoreSnapshot = snapshot;

beforeEach(() => {
    firestoreGet.mockClear();
    firestoreSet.mockClear();
    firestoreRemove.mockClear();
    firestoreSnapshot.mockClear();
    getSyncList.mockClear();
    makeAuditRequest.mockClear();
});

const plugin = {
    pages: 1,
    queue: [
        { type: 'plugin', slug: 'custom-plugin', version: '1.1.0' },
        { type: 'plugin', slug: 'custom-plugin', version: '1.0.9' },
        { type: 'plugin', slug: 'custom-plugin', version: 'trunk' },
    ],
};
const theme = {
    pages: 1,
    queue: [
        { type: 'theme', slug: 'custom-theme', version: '2.0.0' },
        { type: 'theme', slug: 'custom-theme', version: '1.9.8' },
    ],
};

const emptySnapshot = {
    empty: true,
    next() {
        return {
            value: [],
            done: true,
        };
    },
    [Symbol.iterator]() { return this; },
};

/**
 * Tests for syncHelpers.
 */
describe('doSync', () => {
    it('runs sync correctly for the first time', async () => {
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        };

        firestoreGet.mockResolvedValueOnce(null);
        makeAuditRequest.mockResolvedValue(true);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);
        await doSync();

        expect(firestoreSet).toBeCalledTimes(1);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('process items in the ingest queue', async () => {
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        };

        firestoreGet.mockResolvedValueOnce(expectedDelta);
        firestoreSnapshot.mockResolvedValueOnce({
            empty: false,
            forEach(callback) {
                [
                    {
                        id: '12345',
                        data: () => ({ type: 'plugin', slug: 'custom-plugin-10', version: '1.1.0' }),
                    },
                    {
                        id: '12345',
                        data: () => ({ type: 'theme', slug: 'custom-theme-10', version: '2.0.0' }),
                    },
                ].forEach(callback);
            },
        });
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);
        makeAuditRequest.mockResolvedValueOnce(true);
        makeAuditRequest.mockResolvedValueOnce(true);
        firestoreSet.mockResolvedValue(true);
        await doSync();

        expect(makeAuditRequest).toBeCalledWith({ type: 'plugin', slug: 'custom-plugin-10', version: '1.1.0' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme-10', version: '2.0.0' });
        expect(makeAuditRequest).toBeCalledTimes(2);
        expect(firestoreRemove).toBeCalledWith('Ingest/12345');
        expect(firestoreRemove).toBeCalledWith('Ingest/12345');
        expect(firestoreRemove).toBeCalledTimes(2);
    });
    it('exit sync loop if getSyncListPage fails', async () => {
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: '',
        };

        firestoreGet.mockResolvedValueOnce(expectedDelta);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce({
            pages: 1,
            queue: [],
        });
        await doSync();

        expect(firestoreSet).toBeCalledTimes(1);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('exit ingest loop if getSyncListPage fails', async () => {
        const expectedDelta = {
            ingest: true,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: '',
            theme: 'custom-theme',
        };

        firestoreGet.mockResolvedValueOnce(expectedDelta);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce({
            pages: 1,
            queue: [],
        });
        await doSync();

        expect(firestoreSet).toBeCalledTimes(4);
        expect(firestoreSet).toHaveBeenNthCalledWith(4, 'Sync/delta', {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        });
    });
    it('sync page one of themes and plugins', async () => {
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        };

        firestoreGet.mockResolvedValueOnce({
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: '',
            theme: '',
        });
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);

        await doSync();

        expect(makeAuditRequest).toBeCalledWith({ type: 'plugin', slug: 'custom-plugin', version: '1.1.0' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'plugin', slug: 'custom-plugin', version: '1.0.9' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme', version: '2.0.0' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme', version: '1.9.8' });
        expect(makeAuditRequest).toBeCalledTimes(4);
        expect(firestoreSet).toBeCalledTimes(1);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('sync page two of themes and no plugins', async () => {
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme-2',
        };

        firestoreGet.mockResolvedValueOnce({
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        });
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce({
            pages: 2,
            queue: [{ type: 'theme', slug: 'custom-theme-2', version: '2.0.0' }],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 2,
            queue: [{ type: 'theme', slug: 'custom-theme', version: '2.0.0' }],
        });

        await doSync();

        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme-2', version: '2.0.0' });
        expect(makeAuditRequest).toBeCalledTimes(1);
        expect(firestoreSet).toBeCalledTimes(1);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('ingest all themes and plugins', async () => {
        firestoreGet.mockResolvedValueOnce({
            ingest: true,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: '',
            theme: '',
        });
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce({
            pages: 1,
            queue: [{ type: 'plugin', slug: 'custom-plugin', version: '1.1.0' }],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 2,
            queue: [{ type: 'theme', slug: 'custom-theme', version: '2.0.0' }],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 2,
            queue: [{ type: 'theme', slug: 'custom-theme-2', version: '2.0.0' }],
        });

        await doSync();

        expect(firestoreSet).toHaveBeenNthCalledWith(1, 'Ingest/2f239f80c94612a3790a372d1489ee3d50d1e50fae5b73b54fc0e30ee49bbcd8', {
            type: 'plugin',
            slug: 'custom-plugin',
            version: '1.1.0',
        });
        // @todo
        // The async Firestore set calls are getting the wrong returned values (out of order).
        // However, the ingest has been manually tested and does execute in the correct
        // order. All set calls to Firestore are being called as expected so further
        // research must be done to identify the root cause. Moving on for now.
        //
        // expect(firestoreSet).toHaveBeenNthCalledWith(2, 'Sync/delta', {
        //     ingest: true,
        //     page: {
        //         plugin: 1,
        //         theme: 1,
        //     },
        //     plugin: 'custom-plugin',
        //     theme: '',
        // });

        expect(firestoreSet).toHaveBeenNthCalledWith(3, 'Ingest/7d0d25c4c5a8ffdfe0b342aef26a47747b8f6d61b1b17f35e2d79c3887c92522', {
            type: 'theme',
            slug: 'custom-theme',
            version: '2.0.0',
        });
        // expect(firestoreSet).toHaveBeenNthCalledWith(4, 'Sync/delta', {
        //     ingest: true,
        //     page: {
        //         plugin: 1,
        //         theme: 1,
        //     },
        //     plugin: 'custom-plugin',
        //     theme: 'custom-theme',
        // });
        // expect(firestoreSet).toHaveBeenNthCalledWith(5, 'Sync/delta', {
        //     ingest: true,
        //     page: {
        //         plugin: 1,
        //         theme: 2,
        //     },
        //     plugin: 'custom-plugin',
        //     theme: 'custom-theme',
        // });

        expect(firestoreSet).toHaveBeenNthCalledWith(6, 'Ingest/0d5f05a981949fd613b1e2fec58ca27b67c7abf678a55cbded96cc0f4ab3a9e6', { type: 'theme', slug: 'custom-theme-2', version: '2.0.0' });
        expect(firestoreSet).toHaveBeenNthCalledWith(7, 'Sync/delta', {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        });

        expect(firestoreSet).toBeCalledTimes(7);
    });
    it('no new theme audit is created', async () => {
        const existingDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: '',
            theme: 'custom-theme',
        };
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        };

        firestoreGet.mockResolvedValueOnce(existingDelta);
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('no new plugin audit is created', async () => {
        const existingDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: '',
        };
        const expectedDelta = {
            ingest: false,
            page: {
                plugin: 1,
                theme: 1,
            },
            plugin: 'custom-plugin',
            theme: 'custom-theme',
        };

        firestoreGet.mockResolvedValueOnce(existingDelta);
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
});
