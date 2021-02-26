/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Internal Dependencies.
 */
const {
    apiUrl, cleanApiResponse, getSyncList, makeAuditRequest,
} = require('../../../src/util/syncHelpers');
const { getAuditData } = require('../../../src/util/auditHelpers');
const { get, set } = require('../../../src/services/firestore');

jest.mock('../../../src/util/auditHelpers',
    () => ({
        getAuditData: jest.fn(),
    }));
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
    getAuditData.mockClear();
});

/**
 * Tests for syncHelpers.
 */
describe('syncHelpers', () => {
    it('apiUrl: provides a WordPress Theme/Plugins API URL', async () => {
        const url = apiUrl({
            'request[browse]': 'updated',
            'request[per_page]': '5',
            'request[fields][versions]': '1',
            'request[page]': 1,
        }, 'theme');

        expect(url).toContain('https://api.wordpress.org/themes/info/1.1/?action=query_themes');
        expect(url).toContain('&request[browse]=updated');
        expect(url).toContain('&request[per_page]=5');
        expect(url).toContain('&request[fields][versions]=1');
        expect(url).toContain('&request[page]=1');
    });
    it('cleanApiResponse: responds with cleaned data', async () => {
        const url = apiUrl({
            'request[browse]': 'updated',
            'request[per_page]': '1',
            'request[fields][versions]': '1',
            'request[page]': 1,
        }, 'theme');
        const response = await fetch(url);
        const raw = await response.json();
        const json = cleanApiResponse(raw);
        expect(json[0]).toHaveProperty('type');
        expect(json[0]).toHaveProperty('slug');
        expect(json[0]).toHaveProperty('version');
        expect(json[0]).toHaveProperty('versions');
        expect(Object.keys(json[0]).length).toBe(4);
    });
    it('getSyncList: responds with a single plugin version', async () => {
        const syncList = await getSyncList({
            'request[browse]': 'updated',
            'request[per_page]': '1',
            'request[fields][versions]': '1',
            'request[page]': 1,
        }, 'plugin', 0);
        expect(syncList).toHaveProperty('pages');
        expect(syncList).toHaveProperty('queue');
        expect(syncList.queue.length).toBe(1);
    });
    it('getSyncList: responds with a single theme and 0-any previous versions', async () => {
        const syncList = await getSyncList({
            'request[browse]': 'updated',
            'request[per_page]': '2',
            'request[fields][versions]': '1',
            'request[page]': 1,
        }, 'theme', -1);
        expect(syncList).toHaveProperty('pages');
        expect(syncList).toHaveProperty('queue');
        expect(syncList.queue.length > 2).toBeTruthy();
    });
    it('getSyncList: responds with a single plugin and 0-2 previous versions', async () => {
        const syncList = await getSyncList({
            'request[browse]': 'updated',
            'request[per_page]': '1',
            'request[fields][versions]': '1',
            'request[page]': 1,
        }, 'plugin', 2);
        expect(syncList).toHaveProperty('pages');
        expect(syncList).toHaveProperty('queue');
        expect(syncList.queue.length > 0 && syncList.queue.length < 4).toBeTruthy();
    });
    it('makeAuditRequest: creates a new audit', async () => {
        const mockParams = {
            type: 'plugin',
            slug: 'fooslug',
            version: '2',
        };
        const mockAudit = {
            id: 'fb8fd6304dd6a5f2fc4f281a8c7c8e53be9b5d1a5286c0f6ad2eebf78b5838c3',
            type: 'plugin',
            slug: 'fooslug',
            version: '2',
            created_datetime: 1600000000,
            modified_datetime: 1600000001,
            reports: {
                phpcs_phpcompatibilitywp: {
                    id: 'e5085200b1a1db56c82af70ee206947aa449ed9512e524e06085b03a25f599fd',
                },
            },
        };
        getAuditData.mockResolvedValue(mockAudit);
        expect(await makeAuditRequest(mockParams)).toBeTruthy();
    });
    it('makeAuditRequest: failed to create a new audit', async () => {
        const mockParams = {
            type: 'plugin',
            slug: 'fooslug',
            version: '2',
        };
        firestoreGet.mockResolvedValueOnce(null);
        getAuditData.mockResolvedValue(null);
        expect(await makeAuditRequest(mockParams)).toBeFalsy();
        expect(firestoreSet).toBeCalledWith('Sync/failed', {
            plugin: [
                {
                    ...mockParams,
                    id: '827050500b39b475547fd1867e453b4091e05c01ec62a824b84b43c3eaad6eb7',
                },
            ],
        });
    });
});
