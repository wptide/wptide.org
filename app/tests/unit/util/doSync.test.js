/**
 * Internal Dependencies.
 */
const { getSyncList, makeAuditRequest } = require('../../../src/util/syncHelpers');
const { get, set } = require('../../../src/services/firestore');
const { doSync } = require('../../../src/util/doSync');

jest.mock('../../../src/util/syncHelpers');
jest.mock('../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }));

const firestoreGet = get;
const firestoreSet = set;

beforeEach(() => {
    firestoreGet.mockClear();
    firestoreSet.mockClear();
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

/**
 * Tests for syncHelpers.
 */
describe('doSync', () => {
    it('exit loop if getSyncListPage fails', async () => {
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce(expectedDelta);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);
        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('ingest page one of themes and plugins', async () => {
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce({ ingest: false, plugin: '', theme: '' });
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

        firestoreGet.mockResolvedValueOnce({ ingest: true });
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce({
            pages: 1,
            queue: [{ type: 'plugin', slug: 'custom-plugin', version: '1.1.0' }],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 3,
            queue: [
                { type: 'theme', slug: 'custom-theme', version: '2.0.0' },
            ],
        });
        getSyncList.mockResolvedValueOnce({
            pages: 3,
            queue: [{ type: 'theme', slug: 'custom-theme-2', version: '2.0.0' }],
        });
        getSyncList.mockResolvedValueOnce(null);

        await doSync();

        expect(makeAuditRequest).toBeCalledWith({ type: 'plugin', slug: 'custom-plugin', version: '1.1.0' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme', version: '2.0.0' });
        expect(makeAuditRequest).toBeCalledWith({ type: 'theme', slug: 'custom-theme-2', version: '2.0.0' });
        expect(makeAuditRequest).toBeCalledTimes(3);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('failed to create a new audit', async () => {
        const expectedPlugin = {
            plugin: [{
                id: '2f239f80c94612a3790a372d1489ee3d50d1e50fae5b73b54fc0e30ee49bbcd8', slug: 'custom-plugin', type: 'plugin', version: '1.1.0',
            }],
        };
        const expectedTheme = {
            theme: [{
                id: '7d0d25c4c5a8ffdfe0b342aef26a47747b8f6d61b1b17f35e2d79c3887c92522', slug: 'custom-theme', type: 'theme', version: '2.0.0',
            }],
        };
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValue(null);
        makeAuditRequest.mockResolvedValue(false);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/failed', expectedPlugin);
        expect(firestoreSet).toBeCalledWith('Sync/failed', expectedTheme);
        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
    it('no new theme audit is created', async () => {
        const existingDelta = { ingest: false, plugin: '', theme: 'custom-theme' };
        const expectedDelta = { ingest: false, plugin: 'custom-plugin', theme: 'custom-theme' };

        firestoreGet.mockResolvedValueOnce(false);
        firestoreGet.mockResolvedValueOnce(existingDelta);
        firestoreGet.mockResolvedValueOnce(true);
        firestoreGet.mockResolvedValueOnce(true);
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
        makeAuditRequest.mockResolvedValue(true);
        getSyncList.mockResolvedValueOnce(plugin);
        getSyncList.mockResolvedValueOnce(theme);

        await doSync();

        expect(firestoreSet).toBeCalledWith('Sync/delta', expectedDelta);
    });
});
