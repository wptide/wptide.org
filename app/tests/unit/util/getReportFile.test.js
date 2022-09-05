/**
 * Internal Dependencies.
 */
const { bucketExists, getFile } = require('../../../src/services/storage');
const { readFile } = require('../../../src/util/dataFile');
const { getBucketName } = require('../../../src/util/getBucketName');
const { getReportFile } = require('../../../src/util/getReportFile');

jest.mock('../../../src/services/storage');
jest.mock('../../../src/util/dataFile');
jest.mock('../../../src/util/getBucketName');

beforeEach(() => {
    readFile.mockClear();
    bucketExists.mockClear();
    getFile.mockClear();
    getBucketName.mockClear();
});

/**
 * Tests for getReportFile.
 */
describe('getReportFile', () => {
    it('Returns the local file data', async () => {
        bucketExists.mockReturnValue(false);
        readFile.mockReturnValue(JSON.stringify({
            key: 'value',
        }));
        const data = await getReportFile('lighthouse', 'somefile.json');
        expect(data.key).toBe('value');
    });
    it('Returns the GCS file data', async () => {
        bucketExists.mockReturnValue(true);
        getBucketName.mockReturnValue(true);
        getFile.mockReturnValue({
            key: 'value',
        });
        const data = await getReportFile('lighthouse', 'somefile.json');
        expect(data.key).toBe('value');
    });
    it('Returns an empty object', async () => {
        bucketExists.mockReturnValue(false);
        readFile.mockReturnValue(false);
        const data = await getReportFile('lighthouse', 'somefile.json');
        expect(Object.keys(data).length).toBe(0);
    });
});
