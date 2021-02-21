/**
 * Internal Dependencies.
 */
const schema = require('../../../src/controllers/schema');
const apiValidate = require('../../../src/util/apiValidate');

jest.mock('../../../src/util/apiValidate');

beforeEach(() => {
    apiValidate.mockClear();
});

const mock = {
    res: () => ({
        json: jest.fn(),
        set: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    }),
};

describe('Main index entry point schema', () => {
    describe('Route handler', () => {
        it('Invokes route handler with a 200 response', async () => {
            const res = mock.res();
            const api = {
                id: '12345',
            };
            apiValidate.mockResolvedValueOnce(api);
            await schema(null, res);

            expect(res.json).toBeCalledWith(api);
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'public, max-age=86400');
        });
        it('Invokes route handler with a 404 response', async () => {
            const res = mock.res();
            const api = {
                message: 'Not found',
                status: 404,
            };
            apiValidate.mockResolvedValueOnce(api);
            await schema(null, res);

            expect(res.json).toBeCalledWith(api);
            expect(res.set).toHaveBeenCalledWith('Cache-control', 'no-store');
        });
    });
});
