/**
 * Internal Dependencies.
 */
const { getSyncList, makeAuditRequest } = require('../../../src/util/syncHelpers');
const {
    get, set, remove, snapshot,
} = require('../../../src/services/firestore');
const { doSync } = require('../../../src/util/doSync');

jest.mock('../../../src/util/syncHelpers');
jest.mock('../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        snapshot: jest.fn(),
    }));

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
    it('process items in the ingest queue', async () => {
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

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
        await doSync();

        expect(makeAuditRequest).toBeCalledWith({ type: 'plugin', slug: 'custom-plugin-10', version: '1.1.0' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme-10', version: '2.0.0' });
        expect(makeAuditRequest).toBeCalledTimes(2);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
        expect(firestoreSet).toBeCalledTimes(1);
        expect(firestoreRemove).toBeCalledWith('Ingest/12345');
        expect(firestoreRemove).toBeCalledWith('Ingest/12345');
        expect(firestoreRemove).toBeCalledTimes(2);
    });
    it('exit loop if getSyncListPage fails', async () => {
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce(expectedDelta);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);
        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('ingest page one of themes and plugins', async () => {
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce({ ingest: false, plugin: '', theme: '' });
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
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('ingest all themes and plugins', async () => {
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce({ ingest: true, plugin: 'custom-plugin', theme: 'custom-theme' });
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce({
            pages: 1,
            queue: [{ type: 'plugin', slug: 'custom-plugin', version: '1.1.0' }],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 3,
            queue: [{ type: 'theme', slug: 'custom-theme', version: '2.0.0' }],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 3,
            queue: [{ type: 'theme', slug: 'custom-theme-2', version: '2.0.0' }],
        });
        getSyncList.mockResolvedValueOnce(null);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
        expect(firestoreSet).toBeCalledWith('Ingest/2f239f80c94612a3790a372d1489ee3d50d1e50fae5b73b54fc0e30ee49bbcd8', { type: 'plugin', slug: 'custom-plugin', version: '1.1.0' });
        expect(firestoreSet).toBeCalledWith('Ingest/7d0d25c4c5a8ffdfe0b342aef26a47747b8f6d61b1b17f35e2d79c3887c92522', { type: 'theme', slug: 'custom-theme', version: '2.0.0' });
        expect(firestoreSet).toBeCalledWith('Ingest/0d5f05a981949fd613b1e2fec58ca27b67c7abf678a55cbded96cc0f4ab3a9e6', { type: 'theme', slug: 'custom-theme-2', version: '2.0.0' });
        expect(firestoreSet).toBeCalledTimes(4);
    });
    it('no new theme audit is created', async () => {
        const existingDelta = { ingest: false, plugin: '', theme: 'custom-theme' };
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce(false);
        firestoreGet.mockResolvedValueOnce(existingDelta);
        firestoreGet.mockResolvedValueOnce(true);
        firestoreGet.mockResolvedValueOnce(true);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('no new plugin audit is created', async () => {
        const existingDelta = { ingest: false, plugin: 'custom-plugin', theme: '' };
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce(false);
        firestoreGet.mockResolvedValueOnce(existingDelta);
        firestoreGet.mockResolvedValueOnce(true);
        firestoreGet.mockResolvedValueOnce(true);
        firestoreSnapshot.mockResolvedValueOnce(emptySnapshot);
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
});
