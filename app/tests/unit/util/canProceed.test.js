/**
 * Internal Dependencies.
 */
const { get, set } = require('../../../src/services/datastore');
const { canProceed } = require('../../../src/util/canProceed');
const { dateTime } = require('../../../src/util/time');

jest.mock('../../../src/services/datastore',
    () => ({
        getKey: (a, b) => b,
        get: jest.fn(),
        set: jest.fn(),
    }));
jest.mock('../../../src/util/time');

const datastoreGet = get;
const datastoreSet = set;

beforeEach(() => {
    datastoreGet.mockClear();
    dateTime.mockClear();
    datastoreSet.mockClear();
});

/**
 * Tests for getSourceUrl.
 */
describe('canProceed', () => {
    it('requires the correct parameters for invocation', async () => {
        let errorMessage;

        try {
            await canProceed();
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('type param missing');

        try {
            await canProceed('lighthouse', {});
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('item.slug param missing');

        try {
            await canProceed('lighthouse', { slug: 'stream' });
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('item.version param missing');
    });

    const retryCounts = [
        0,
        1,
    ];

    it.each(retryCounts)('can retry after %s retries', async (retryCount) => {
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        const statusDoc = { retries: retryCount, startTime: 1 };
        const expectedStatusDoc = { retries: retryCount + 1, startTime: currentTime };
        const audit = { slug: 'foo', version: 1 };
        const type = 'lighthouse';
        datastoreGet.mockResolvedValue(statusDoc);
        await canProceed('lighthouse', audit);
        expect(datastoreSet).toHaveBeenCalledWith(`${type}-${audit.slug}-${audit.version}`, expectedStatusDoc);
    });

    it('returns true when we first run an audit', async () => {
        const statusDoc = undefined;
        const audit = { slug: 'foo', version: 1 };
        const type = 'lighthouse';
        const timeNow = 1000;
        dateTime.mockReturnValue(timeNow);
        datastoreGet.mockResolvedValue(statusDoc);
        try {
            await canProceed(type, audit);
        } catch (error) {
            console.log(error);
        }
        expect(datastoreSet).toHaveBeenCalledWith(`${type}-${audit.slug}-${audit.version}`, { retries: 0, startTime: timeNow });
    });

    it('throws an error when we want to run an audit while one is in progress', async () => {
        let errorMessage;
        const statusDoc = { retries: 0, startTime: 1 };
        const audit = { slug: 'foo', version: 1 };
        const type = 'lighthouse';
        const timeNow = 5;
        dateTime.mockReturnValue(timeNow);
        datastoreGet.mockResolvedValue(statusDoc);
        try {
            await canProceed(type, audit);
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('audit still in progress {"retries":0,"startTime":1}');
    });

    it('throws an error when we try and run an audit a fourth time', async () => {
        let errorMessage;
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        const statusDoc = { retries: 3, startTime: 1 };
        const audit = { slug: 'foo', version: 1 };
        const type = 'lighthouse';

        datastoreGet.mockResolvedValue(statusDoc);
        try {
            await canProceed(type, audit);
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('too many retries not proceeding {"retries":4,"startTime":1000}');
    });
});
