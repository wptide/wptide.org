const getReport = require('../../../src/controllers/getReport');
const { get, set } = require('../../../src/services/firestore');
const { getReportFile } = require('../../../src/util/getReportFile');

jest.mock(
    '../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }),
);
jest.mock('../../../src/util/getReportFile');

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
        json: jest.fn(),
        set: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    }),
};

beforeEach(() => {
    firestoreGet.mockClear();
    getReportFile.mockClear();
});

describe('Main index entry point getReport', () => {
    describe('Route handler', () => {
        it('Missing id parameter', async () => {
            const req = mock.req();
            await getReport(req, mock.res());
            expect(req.validation.errors[0].message).toEqual('A report identifier is required.');
        });

        it('Invalid id parameter', async () => {
            const req = mock.req();
            req.params.id = '!hello';
            await getReport(req, mock.res());
            expect(req.validation.errors[0].message).toEqual('A report identifier must be an alpha-numeric string.');
        });

        it('Returns a 404 if report does not exist.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'report1';

            firestoreGet.mockResolvedValue(false);
            getReportFile.mockResolvedValue(false);

            await getReport(req, res);
            expect(firestoreSet).toHaveBeenCalledTimes(0);
            expect(res.json).toHaveBeenCalledWith({
                message: 'The provided report identifier does not exist.',
                status: 404,
            });
        });

        it('Returns a 500 if firestore throws an error.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'report1';

            firestoreGet.mockImplementation(() => {
                throw new Error('Something bad happened');
            });

            await getReport(req, res);
            expect(firestoreSet).toHaveBeenCalledTimes(0);
            expect(res.json).toHaveBeenCalledWith({
                message: 'The server could not respond to the request.',
                status: 500,
            });
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'no-store');
        });

        it('Returns report if one exists.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'report1';

            const mockReport = {
                id: 'report1',
                foo: 'bar',
            };
            const mockFile = {
                report: {
                    key: 'value',
                },
            };

            firestoreGet.mockResolvedValue(mockReport);
            getReportFile.mockResolvedValue(mockFile);

            await getReport(req, res);
            expect(firestoreSet).toHaveBeenCalledTimes(0);
            expect(res.json).toHaveBeenCalledWith({
                ...mockReport,
                ...mockFile,
            });
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'public, max-age=86400');
        });
    });
});
