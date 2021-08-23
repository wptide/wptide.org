const { sendError } = require('../../../src/util/sendError');
const { auditServer } = require('../../../src/run/auditServer');
const { tide } = require('../../../lighthouseServer');
// eslint-disable-next-line no-unused-vars
const lighthouseReporter = require('../../../src/audits/lighthouseReporter');
const { dateTime } = require('../../../src/util/dateTime');
const {
    getAuditDoc, getStatusDoc, setAuditDoc, setReportDoc, setStatusDoc,
} = require('../../../src/integrations/firestore');
const { canProceed } = require('../../../src/util/canProceed');
const { get, set } = require('../../../src/services/firestore');
const { unlink } = require('../../../src/util/dataFile');
const { getReportFile } = require('../../../src/util/getReportFile');
const { getBucketName } = require('../../../src/util/getBucketName');
const { bucketExists, saveFile } = require('../../../src/services/storage');

jest.mock('../../../src/util/sendError');
jest.mock('../../../src/audits/lighthouseReporter',
    () => jest.fn().mockReturnValue({
        report: {},
    }));
jest.mock('../../../src/util/canProceed');
jest.mock('../../../src/util/dateTime');
jest.mock('../../../src/integrations/firestore',
    () => ({
        getAuditDoc: jest.fn(),
        getStatusDoc: jest.fn(),
        setAuditDoc: jest.fn(),
        setReportDoc: jest.fn(),
        setStatusDoc: jest.fn(),
    }));
jest.mock('../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }));
jest.mock('../../../src/util/getReportFile');
jest.mock('../../../src/util/getBucketName');
jest.mock('../../../src/services/storage',
    () => ({
        bucketExists: jest.fn(),
        saveFile: jest.fn(),
    }));

const firestoreGet = get;
const firestoreSet = set;

const mock = {
    req: () => ({
        validation: {
            message: 'Request has validation errors',
            status: 400,
            errors: [],
        },
        params: {},
    }),
    res: () => ({
        send: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    }),
};

beforeEach(() => {
    firestoreGet.mockClear();
    dateTime.mockClear();
    firestoreSet.mockClear();
    canProceed.mockClear();
    sendError.mockClear();
    getAuditDoc.mockClear();
    getStatusDoc.mockClear();
    setAuditDoc.mockClear();
    setReportDoc.mockClear();
    setStatusDoc.mockClear();
    getReportFile.mockClear();
    getBucketName.mockClear();
    bucketExists.mockClear();
    saveFile.mockClear();
});

beforeAll(() => {
    process.chdir('./app');
});

afterAll(async () => {
    // Remove generated files.
    await unlink('lighthouse/1507a324738693391cd8ab1869de6a9e7b931d360b6a6a539556007540a0d825.json');
    await unlink('phpcs_phpcompatibilitywp/58ac7cd92f7bdcda38f5c518d52afcd82782aaabdc794646ae5c87caab43d8e0.json');

    process.chdir('../');
});

describe('The auditServer HTTP handler', () => {
    it('Missing request body', async () => {
        await tide(mock.req(), mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('The REQUEST body is required.');
    });

    it('Missing request body message', async () => {
        const req = mock.req();
        req.body = {};
        await tide(req, mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('The PubSub message is required.');
    });

    it('Pub/Sub message is invalid', async () => {
        const req = mock.req();
        req.body = {
            message: 'hello',
        };
        await tide(req, mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('Invalid Pub/Sub message format.');
    });

    it('Missing the parameters', async () => {
        const req = mock.req();
        req.body = {
            message: {
                data: 'e30=', // Empty object.
            },
        };
        await tide(req, mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('The Pub/Sub message id is required.');
        expect(sendError.mock.calls[0][1].errors[1].message).toBe('The Pub/Sub message type is required.');
        expect(sendError.mock.calls[0][1].errors[2].message).toBe('The Pub/Sub message slug is required.');
        expect(sendError.mock.calls[0][1].errors[3].message).toBe('The Pub/Sub message version is required.');
    });

    it('Throws when missing audit', async () => {
        const req = mock.req();
        req.body = {
            message: {
                // Converted to base64:
                // {"id": "12345abcde", "type": "theme", "slug": "fake-slug", "version": "1.0.1"}
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSJ9',
            },
        };
        getAuditDoc.mockResolvedValue(null);
        await tide(req, mock.res());
        expect(sendError.mock.calls[0][1]).toBe('Audit for fake-slug v1.0.1 is missing.');
    });

    it('Does not update an existing Audit', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJsaWdodGhvdXNlIjogeyJpZCI6ICJlZGNiYTU0MzIxIn19fQ==',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: {
                    id: 'edcba54321',
                },
            },
        };

        getAuditDoc.mockResolvedValue(auditMock);
        await tide(req, res);
        expect(res.send).toBeCalledTimes(1);
        expect(spy).toBeCalledWith('Skipping: Audit for fake-slug v1.0.1 already exists.');
        spy.mockRestore();
    });

    it('canProceed fails', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJsaWdodGhvdXNlIjogeyJpZCI6ICJlZGNiYTU0MzIxIn19fQ==',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: null,
            },
        };

        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(false);
        await tide(req, res);
        expect(res.send).toBeCalledTimes(1);
        expect(spy).toBeCalledTimes(0);
        spy.mockRestore();
    });

    it('missing audit', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJsaWdodGhvdXNlIjogeyJpZCI6ICJlZGNiYTU0MzIxIn19fQ==',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: null,
            },
        };

        getAuditDoc.mockResolvedValueOnce(auditMock);
        canProceed.mockResolvedValue(true);
        getAuditDoc.mockResolvedValueOnce(null); // Simulate DB failure.
        await tide(req, res);
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(sendError.mock.calls[0][1]).toBe('Audit for fake-slug v1.0.1 is missing.');
        spy.mockRestore();
    });

    it('audit was completed by another Cloud Function', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJsaWdodGhvdXNlIjogeyJpZCI6ICJlZGNiYTU0MzIxIn19fQ==',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: null,
            },
        };

        const auditMockComplete = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: {
                    id: 'edcba54321',
                },
            },
        };

        getAuditDoc.mockResolvedValueOnce(auditMock);
        canProceed.mockResolvedValue(true);
        getAuditDoc.mockResolvedValueOnce(auditMockComplete);
        await tide(req, res);
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(spy).toBeCalledWith('Warning: Audit for fake-slug v1.0.1 was already completed.');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });

    it('Successfully performs the audit using the Lighthouse Reporter', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJsaWdodGhvdXNlIjogeyJpZCI6ICJlZGNiYTU0MzIxIn19fQ==',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: null,
            },
        };
        const statusMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: {
                    attempts: 1,
                    start_datetime: 500,
                    status: 'pending',
                },
            },
        };

        dateTime.mockReturnValueOnce(1000);
        getStatusDoc.mockResolvedValueOnce(statusMock);
        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(true);

        statusMock.reports.lighthouse.end_datetime = 1000;
        statusMock.reports.lighthouse.status = 'complete';
        const fileMock = {
            report: {},
        };
        firestoreSet.mockResolvedValue(statusMock);
        getReportFile.mockResolvedValue(fileMock);
        await auditServer(req, res, async () => ({
            ...fileMock,
        }), 'lighthouse', 'Lighthouse');
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(spy.mock.calls[1][0]).toContain('Lighthouse audit for fake-slug v1.0.1 completed successfully');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });

    it('Successfully performs the audit using the PHPCS Reporter', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJwaHBjc19waHBjb21wYXRpYmlsaXR5d3AiOiB7ImlkIjogImVkY2JhNTQzMjEifX19',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                phpcs_phpcompatibilitywp: null,
            },
        };
        const statusMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                phpcs_phpcompatibilitywp: {
                    attempts: 1,
                    start_datetime: 500,
                    status: 'pending',
                },
            },
        };

        dateTime.mockReturnValueOnce(1000);
        getStatusDoc.mockResolvedValueOnce(statusMock);
        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(true);
        getBucketName.mockResolvedValue(true);
        bucketExists.mockResolvedValue(true);
        saveFile.mockResolvedValue(true);

        statusMock.reports.phpcs_phpcompatibilitywp.end_datetime = 1000;
        statusMock.reports.phpcs_phpcompatibilitywp.status = 'complete';
        const fileMock = {
            report: {
                compatible: ['5.6'],
                incompatible: [],
            },
        };
        firestoreSet.mockResolvedValue(statusMock);
        getReportFile.mockResolvedValue(fileMock);
        await auditServer(req, res, async () => ({
            ...fileMock,
        }), 'phpcs_phpcompatibilitywp', 'PHPCS');
        expect(spy).toBeCalledWith('PHPCS audit for fake-slug v1.0.1 started.');
        console.log(spy.mock.calls);
        expect(spy.mock.calls[1][0]).toContain('PHPCS audit for fake-slug v1.0.1 completed successfully');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });

    it('Fails to performs the audit using the PHPCS Reporter', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJwaHBjc19waHBjb21wYXRpYmlsaXR5d3AiOiB7ImlkIjogImVkY2JhNTQzMjEifX19',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                phpcs_phpcompatibilitywp: null,
            },
        };
        const statusMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                phpcs_phpcompatibilitywp: {
                    attempts: 1,
                    start_datetime: 500,
                    status: 'pending',
                },
            },
        };

        dateTime.mockReturnValueOnce(1000);
        getStatusDoc.mockResolvedValueOnce(statusMock);
        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(true);

        statusMock.reports.phpcs_phpcompatibilitywp.end_datetime = 1000;
        statusMock.reports.phpcs_phpcompatibilitywp.status = 'failed';
        firestoreSet.mockResolvedValue(statusMock);
        await auditServer(req, res, async () => ({
            report: {
                compatible: [],
                incompatible: [],
            },
        }), 'phpcs_phpcompatibilitywp', 'PHPCS');
        expect(spy).toBeCalledWith('PHPCS audit for fake-slug v1.0.1 started.');
        expect(spy.mock.calls[1][0]).toContain('PHPCS audit for fake-slug v1.0.1 failed in');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });

    it('Successfully performs the audit', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        const req = mock.req();
        const res = mock.res();
        req.body = {
            message: {
                data: 'eyJpZCI6ICIxMjM0NWFiY2RlIiwgInR5cGUiOiAidGhlbWUiLCAic2x1ZyI6ICJmYWtlLXNsdWciLCAidmVyc2lvbiI6ICIxLjAuMSIsICJyZXBvcnRzIjogeyJsaWdodGhvdXNlIjogeyJpZCI6ICJlZGNiYTU0MzIxIn19fQ==',
            },
        };
        const auditMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: null,
            },
        };
        const statusMock = {
            id: '12345abcde',
            type: 'theme',
            slug: 'fake-slug',
            version: '1.0.1',
            reports: {
                lighthouse: {
                    attempts: 1,
                    start_datetime: 500,
                    status: 'pending',
                },
            },
        };

        dateTime.mockReturnValueOnce(1000);
        getStatusDoc.mockResolvedValueOnce(statusMock);
        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(true);

        statusMock.reports.lighthouse.status = 'complete';
        firestoreSet.mockResolvedValue(statusMock);
        await tide(req, res);
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(spy.mock.calls[1][0]).toContain('Lighthouse audit for fake-slug v1.0.1 completed successfully');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });
});
