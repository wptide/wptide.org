/**
 * Internal Dependencies.
 */
const { get, set } = require('../../../src/services/firestore');
const { canProceed } = require('../../../src/util/canProceed');
const { dateTime } = require('../../../src/util/dateTime');

jest.mock('../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }));
jest.mock('../../../src/util/dateTime');

const firestoreGet = get;
const firestoreSet = set;

beforeEach(() => {
    firestoreGet.mockClear();
    dateTime.mockClear();
    firestoreSet.mockClear();
});

global.console.log = jest.fn();

/**
 * Tests for canProceed.
 */
describe('canProceed', () => {
    it('Throws if type param is missing', async () => {
        let errorMessage;

        try {
            await canProceed();
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('The type parameter is required');
    });
    it('Throws if id param is missing', async () => {
        let errorMessage;
        try {
            await canProceed('lighthouse');
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('The id parameter is required');
    });
    it('Throws if status doc is not found', async () => {
        let errorMessage;
        try {
            firestoreGet.mockResolvedValue(false);
            await canProceed('lighthouse', '1234abcde');
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('The status doc does not exist');
    });

    it.each([1, 2])('Can retry after %s attempts', async (retryCount) => {
        const currentTime = 1000 * (retryCount + 1);
        dateTime.mockReturnValue(currentTime);
        const statusDoc = {
            id: '12345abced',
            type: 'lighthouse',
            slug: 'fake-slug',
            version: '1.0.0',
            created_datetime: 1,
            modified_datetime: 1,
            reports: {
                lighthouse: {
                    attempts: retryCount,
                    startTime: 1,
                },
            },
        };
        firestoreGet.mockResolvedValue(statusDoc);
        await canProceed('lighthouse', statusDoc.id);
        const expectedStatusDoc = {
            ...statusDoc,
        };
        expectedStatusDoc.reports.lighthouse.attempts = retryCount + 1;
        expectedStatusDoc.reports.lighthouse.startTime = currentTime;
        expect(firestoreSet).toHaveBeenCalledWith(`Status/${statusDoc.id}`, expectedStatusDoc);
    });

    it('Returns true when we first run an audit', async () => {
        const statusDoc = {
            id: '12345abced',
            type: 'lighthouse',
            slug: 'fake-slug',
            version: '1.0.0',
            created_datetime: 1,
            modified_datetime: 1,
            reports: {
                lighthouse: {
                    attempts: 0,
                    startTime: 1,
                },
            },
        };
        const timeNow = 1000;
        dateTime.mockReturnValue(timeNow);
        firestoreGet.mockResolvedValue(statusDoc);
        const returnStatus = await canProceed(statusDoc.type, statusDoc.id);
        const expectedDoc = Object.assign(statusDoc, {
            reports: {
                lighthouse: {
                    attempts: 1,
                    startTime: timeNow,
                },
            },
        });
        expect(firestoreSet).toHaveBeenCalledWith(`Status/${statusDoc.id}`, expectedDoc);
        expect(returnStatus).toEqual(true);
    });

    it('Throws an error when we want to run an audit while one is in progress', async () => {
        let errorMessage;
        const statusDoc = {
            id: '12345abced',
            type: 'lighthouse',
            slug: 'fake-slug',
            version: '1.0.0',
            created_datetime: 1,
            modified_datetime: 1,
            reports: {
                lighthouse: {
                    attempts: 1,
                    startTime: 1,
                },
            },
        };
        const timeNow = 5;
        dateTime.mockReturnValue(timeNow);
        firestoreGet.mockResolvedValue(statusDoc);
        try {
            await canProceed(statusDoc.type, statusDoc.id);
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('Audit 12345abced is still in progress.');
    });

    it('Returns false when we try and run an audit a fourth time', async () => {
        const statusDoc = {
            id: '12345abced',
            type: 'lighthouse',
            slug: 'fake-slug',
            version: '1.0.0',
            created_datetime: 1,
            modified_datetime: 1,
            reports: {
                lighthouse: {
                    attempts: 3,
                    startTime: 1,
                    status: 'pending',
                },
            },
        };
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(statusDoc);
        const returnStatus = await canProceed(statusDoc.type, statusDoc.id);
        expect(returnStatus).toEqual(false);
        statusDoc.reports.lighthouse.status = 'failed';
        expect(firestoreSet).toHaveBeenCalledWith(`Status/${statusDoc.id}`, statusDoc);
    });

    it('Returns false when we have already completed the audit', async () => {
        const statusDoc = {
            id: '12345abced',
            type: 'lighthouse',
            slug: 'fake-slug',
            version: '1.0.0',
            created_datetime: 1,
            modified_datetime: 1,
            reports: {
                lighthouse: {
                    attempts: 1,
                    startTime: 1000,
                    status: 'complete',
                },
            },
        };
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValue(statusDoc);
        const returnStatus = await canProceed(statusDoc.type, statusDoc.id);
        expect(returnStatus).toEqual(false);
    });

    it('Throws an error when the audit previously failed', async () => {
        let errorMessage;
        try {
            const statusDoc = {
                id: '12345abced',
                type: 'lighthouse',
                slug: 'fake-slug',
                version: '1.0.0',
                created_datetime: 1,
                modified_datetime: 1,
                reports: {
                    lighthouse: {
                        attempts: 1,
                        startTime: 1000,
                        status: 'failed',
                    },
                },
            };
            const currentTime = 1000;
            dateTime.mockReturnValue(currentTime);
            firestoreGet.mockResolvedValue(statusDoc);
            await canProceed(statusDoc.type, statusDoc.id);
        } catch (error) {
            errorMessage = error.message;
        }
        expect(errorMessage).toEqual('Audit 12345abced has already failed.');
    });
});
