const { sendError } = require('../../../src/util/sendError');
const { auditServer } = require('../../../src/run/auditServer');
const { lighthouseServer } = require('../../../src/run/lighthouseServer');
const lighthouseReporter = require('../../../src/audits/lighthouseReporter');
const { dateTime } = require('../../../src/util/dateTime');
const { // eslint-disable-next-line no-unused-vars
    getAuditDoc, getStatusDoc, setAuditDoc, setReportDoc, setStatusDoc,
} = require('../../../src/integrations/datastore');
const { canProceed } = require('../../../src/util/canProceed');
const { get, set } = require('../../../src/services/datastore');

jest.mock('../../../src/util/sendError');
jest.mock('../../../src/audits/lighthouseReporter');
jest.mock('../../../src/util/canProceed');
jest.mock('../../../src/util/dateTime');
jest.mock('../../../src/integrations/datastore',
    () => ({
        getAuditDoc: jest.fn(),
        getStatusDoc: jest.fn(),
        setAuditDoc: jest.fn(),
        setReportDoc: jest.fn(),
        setStatusDoc: jest.fn(),
    }));
jest.mock('../../../src/services/datastore',
    () => ({
        getKey: (a, b) => b,
        get: jest.fn(),
        set: jest.fn(),
    }));

const datastoreGet = get;
const datastoreSet = set;

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
    datastoreGet.mockClear();
    dateTime.mockClear();
    datastoreSet.mockClear();
    canProceed.mockClear();
    sendError.mockClear();
});

describe('The auditServer HTTP handler', () => {
    it('Missing request body', async () => {
        await lighthouseServer(mock.req(), mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('The REQUEST body is required.');
    });

    it('Missing request body message', async () => {
        const req = mock.req();
        req.body = {};
        await lighthouseServer(req, mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('The PubSub message is required.');
    });

    it('Pub/Sub message is invalid', async () => {
        const req = mock.req();
        req.body = {
            message: 'hello',
        };
        await lighthouseServer(req, mock.res());
        expect(sendError.mock.calls[0][1].errors[0].message).toBe('Invalid Pub/Sub message format.');
    });

    it('Missing the parameters', async () => {
        const req = mock.req();
        req.body = {
            message: {
                data: 'e30=', // Empty object.
            },
        };
        await lighthouseServer(req, mock.res());
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
        await lighthouseServer(req, mock.res());
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
        await lighthouseServer(req, res);
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
        await lighthouseServer(req, res);
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
        await lighthouseServer(req, res);
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
        await lighthouseServer(req, res);
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(spy).toBeCalledWith('Warning: Audit for fake-slug v1.0.1 was already completed.');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });

    it('Successfully performs the an audit', async () => {
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
                    startTime: 500,
                    status: 'pending',
                },
            },
        };

        dateTime.mockReturnValueOnce(1000);
        getStatusDoc.mockResolvedValueOnce(statusMock);
        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(true);

        statusMock.reports.lighthouse.status = 'complete';
        datastoreSet.mockResolvedValue(statusMock);
        await lighthouseServer(req, res);
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(spy.mock.calls[1][0]).toContain('Lighthouse audit for fake-slug v1.0.1 completed successfully');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });

    it('Successfully performs the an audit using the Lighthouse Reporter', async () => {
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
                    startTime: 500,
                    status: 'pending',
                },
            },
        };

        dateTime.mockReturnValueOnce(1000);
        getStatusDoc.mockResolvedValueOnce(statusMock);
        getAuditDoc.mockResolvedValue(auditMock);
        canProceed.mockResolvedValue(true);

        statusMock.reports.lighthouse.status = 'complete';
        datastoreSet.mockResolvedValue(statusMock);
        await auditServer(req, res, lighthouseReporter, 'lighthouse', 'Lighthouse');
        expect(spy).toBeCalledWith('Lighthouse audit for fake-slug v1.0.1 started.');
        expect(spy.mock.calls[1][0]).toContain('Lighthouse audit for fake-slug v1.0.1 completed successfully');
        expect(res.send).toBeCalledTimes(1);
        spy.mockRestore();
    });
});
