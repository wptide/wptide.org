const getStatus = require('../../../src/controllers/getStatus');
const { get, set } = require('../../../src/services/firestore');

jest.mock(
    '../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }),
);

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
});

describe('Main index entry point getStatus', () => {
    describe('Route handler', () => {
        it('Missing id parameter', async () => {
            const req = mock.req();
            await getStatus(req, mock.res());
            expect(req.validation.errors[0].message).toEqual('A status identifier is required.');
        });

        it('Invalid id parameter', async () => {
            const req = mock.req();
            req.params.id = '!hello';
            await getStatus(req, mock.res());
            expect(req.validation.errors[0].message).toEqual('A status identifier must be an alpha-numeric string.');
        });

        it('Returns a 404 if status does not exist.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'status1';

            firestoreGet.mockResolvedValue(false);

            await getStatus(req, res);
            expect(firestoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith({
                message: 'The provided status identifier does not exist.',
                status: 404,
            });
        });

        it('Returns a 500 if firestore throws an error.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'status1';

            firestoreGet.mockImplementation(() => {
                throw new Error('Something bad happened');
            });

            await getStatus(req, res);
            expect(firestoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith({
                message: 'The server could not respond to the request.',
                status: 500,
            });
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'no-store');
        });

        it('Returns uncached status if one exists.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'status1';

            const mockReport = {
                id: 'status1',
                reports: {
                    phpcs_phpcompatibilitywp: {
                        start_datetime: 1,
                        attempts: 0,
                        status: 'pending',
                    },
                    lighthouse: {
                        start_datetime: 1,
                        attempts: 1,
                        status: 'complete',
                    },
                },
            };

            firestoreGet.mockResolvedValue(mockReport);

            await getStatus(req, res);
            expect(firestoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith(mockReport);
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'no-store');
        });
        it('Returns cached status if one exists.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'status1';

            const mockReport = {
                id: 'status1',
                reports: {
                    phpcs_phpcompatibilitywp: {
                        start_datetime: 1,
                        attempts: 1,
                        status: 'complete',
                    },
                    lighthouse: {
                        start_datetime: 1,
                        attempts: 1,
                        status: 'complete',
                    },
                },
            };

            firestoreGet.mockResolvedValue(mockReport);

            await getStatus(req, res);
            expect(firestoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith(mockReport);
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'public, max-age=86400');
        });
        it('Returns cached status if one exists and has failed.', async () => {
            const req = mock.req();
            const res = mock.res();
            req.params.id = 'status1';

            const mockReport = {
                id: 'status1',
                reports: {
                    phpcs_phpcompatibilitywp: {
                        start_datetime: 1,
                        attempts: 1,
                        status: 'failed',
                    },
                    lighthouse: {
                        start_datetime: 1,
                        attempts: 1,
                        status: 'complete',
                    },
                },
            };

            firestoreGet.mockResolvedValue(mockReport);

            await getStatus(req, res);
            expect(firestoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith(mockReport);
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'public, max-age=86400');
        });
    });
});
