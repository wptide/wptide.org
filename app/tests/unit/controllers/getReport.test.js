const getReport = require('../../../src/controllers/getReport');
const { get, set } = require('../../../src/services/datastore');

jest.mock('../../../src/services/datastore',
    () => ({
        getKey: (a, b) => b,
        get: jest.fn(),
        set: jest.fn(),
    }));

const datastoreGet = get;
const datastoreSet = set;

const mock = {
    req: () => {
        return {
            validation: {
                message: 'Request has validation errors',
                status: 400,
                errors: []
            },
            params: {},
        }
    },
    res: () => {
        return {
            json: jest.fn(),
            status(status) { // eslint-disable-line no-unused-vars
                return this; // Make it chainable
            },
        }
    }
};

beforeEach(() => {
    datastoreGet.mockClear();
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

            datastoreGet.mockResolvedValue(false);

            await getReport(req, res);
            expect(datastoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith({
                message: 'The provided report identifier does not exist.',
                status: 404
            });
        });

        it('Returns a 500 if datastore throws an error.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'report1';

            datastoreGet.mockImplementation(() => {
                throw new Error('Something bad happened');
            });

            await getReport(req, res);
            expect(datastoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith({
                message: 'The server could not respond to the request.',
                status: 500
            });
        });

        it('Returns report if one exists.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'report1';

            const mockReport = {
                id: 'report1',
                foo: 'bar',
            };

            datastoreGet.mockResolvedValue(mockReport);

            await getReport(req, res);
            expect(datastoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith(mockReport);
        });
    });
});
