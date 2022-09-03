/**
 * Internal Dependencies.
 */
const { get, set } = require('../../../src/services/firestore');
const { getAuditData } = require('../../../src/util/auditHelpers');
const { dateTime } = require('../../../src/util/dateTime');
const { MAX_DURATION, MAX_ATTEMPTS } = require('../../../src/util/canProceed');

/**
 * Mock JSON data.
 */
const completeInProgressAudit = {
    id: 'a679633380b4b008ed807294e94157451ca142d7c403dfb0e9d514abcb4ab39a',
    type: 'theme',
    slug: 'home-construction',
    version: '0.7',
    source_url: 'https://downloads.wordpress.org/theme/home-construction.0.7.zip',
    created_datetime: 1661654831,
    modified_datetime: 1661654862,
    status: 'in-progress',
    reports: {
        lighthouse: {
            id: 'e349ec05fa627fb4e6601a1c464c1a2ef2687008d3806bcd75905216c22b892b',
        },
        phpcs_phpcompatibilitywp: {
            id: '9596f5c69378f569774bd903142051bdc54565dc596274e73e323f151404a73b',
        },
    },
};
const completeInProgressStatus = {
    reports: {
        phpcs_phpcompatibilitywp: {
            attempts: 0,
            end_datetime: null,
            start_datetime: null,
            status: 'pending',
        },
        lighthouse: {
            attempts: 1,
            end_datetime: 1661654862,
            start_datetime: 1661654838,
            status: 'complete',
        },
    },
    source_url: 'https://downloads.wordpress.org/theme/home-construction.0.7.zip',
    created_datetime: 1661654831,
    version: '0.7',
    type: 'theme',
    status: 'in-progress',
    slug: 'home-construction',
    modified_datetime: 1661654862,
    id: 'a679633380b4b008ed807294e94157451ca142d7c403dfb0e9d514abcb4ab39a',
};
const failedInProgressAudit = {
    id: '78a8f827d53472b25f18f07a89ee30742ff59a5c67065cc15df09378112e9459',
    type: 'plugin',
    slug: 'shapepress-dsgvo',
    version: '3.1.29',
    source_url: 'https://downloads.wordpress.org/plugin/shapepress-dsgvo.3.1.29.zip',
    created_datetime: 1661685588,
    modified_datetime: 1661685588,
    status: 'pending',
    reports: {
        phpcs_phpcompatibilitywp: null,
    },
};
const failedInProgressStatus = {
    created_datetime: 1661685588,
    source_url: 'https://downloads.wordpress.org/plugin/shapepress-dsgvo.3.1.29.zip',
    slug: 'shapepress-dsgvo',
    version: '3.1.29',
    status: 'in-progress',
    reports: {
        phpcs_phpcompatibilitywp: {
            end_datetime: null,
            start_datetime: 1661685593,
            attempts: 1,
            status: 'in-progress',
        },
    },
    modified_datetime: 1661685593,
    type: 'plugin',
    id: '78a8f827d53472b25f18f07a89ee30742ff59a5c67065cc15df09378112e9459',
};

jest.mock(
    '../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }),
);
jest.mock('../../../src/util/dateTime');

const firestoreGet = get;
const firestoreSet = set;

beforeEach(() => {
    firestoreGet.mockClear();
    dateTime.mockClear();
    firestoreSet.mockClear();
});

/**
 * Tests for canProceed.
 */
describe('getAuditData', () => {
    it('Updates & returns correct data when reports have completed but the status is in-progress or pending', async () => {
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(completeInProgressAudit);
        firestoreGet.mockResolvedValueOnce(completeInProgressStatus);

        const existingAuditData = await getAuditData(completeInProgressAudit);

        expect(firestoreGet).toHaveBeenCalledTimes(2);
        expect(firestoreSet).toHaveBeenCalledTimes(2);

        const existingStatusData = { ...completeInProgressStatus };

        existingStatusData.reports.phpcs_phpcompatibilitywp.attempts = 1;
        existingStatusData.reports.phpcs_phpcompatibilitywp.end_datetime = currentTime;
        existingStatusData.reports.phpcs_phpcompatibilitywp.start_datetime = completeInProgressStatus.created_datetime; /* eslint-disable-line max-len */
        existingStatusData.reports.phpcs_phpcompatibilitywp.status = 'complete';
        existingStatusData.status = 'complete';

        expect(existingAuditData.status).toBe('complete');
        expect(existingAuditData.modified_datetime).toBe(currentTime);
        expect(firestoreSet).toHaveBeenNthCalledWith(1, `Audit/${existingAuditData.id}`, existingAuditData);
        expect(firestoreSet).toHaveBeenNthCalledWith(2, `Status/${existingAuditData.id}`, existingStatusData);
    });

    it('Updates & returns correct data when reports have failed but the status is in-progress or pending', async () => {
        const currentTime = failedInProgressAudit.created_datetime + 901;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(failedInProgressAudit);
        firestoreGet.mockResolvedValueOnce(failedInProgressStatus);

        const existingAuditData = await getAuditData(failedInProgressAudit);

        expect(firestoreGet).toHaveBeenCalledTimes(2);
        expect(firestoreSet).toHaveBeenCalledTimes(2);

        const existingStatusData = { ...failedInProgressStatus };

        existingStatusData.status = 'failed';
        existingStatusData.reports.phpcs_phpcompatibilitywp.status = 'failed';

        expect(existingAuditData.status).toBe('failed');
        expect(existingAuditData.modified_datetime).toBe(currentTime);
        expect(firestoreSet).toHaveBeenNthCalledWith(1, `Audit/${existingAuditData.id}`, existingAuditData);
        expect(firestoreSet).toHaveBeenNthCalledWith(2, `Status/${existingAuditData.id}`, existingStatusData);
    });

    it('Returns correct data when reports are in-progress or pending but still have time', async () => {
        const currentTime = failedInProgressAudit.created_datetime + (MAX_DURATION * MAX_ATTEMPTS);
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(failedInProgressAudit);

        const existingAuditData = await getAuditData(failedInProgressAudit);

        expect(firestoreGet).toHaveBeenCalledTimes(1);
        expect(firestoreSet).toHaveBeenCalledTimes(0);

        expect(existingAuditData.status).toBe('pending');
    });
});
