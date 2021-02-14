/**
 * Internal Dependencies.
 */
const { setupValidation, handleValidation } = require('../../../src/util/validation');

const mock = {
    req: () => ({
        params: {},
    }),
    res: () => ({
        json: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    }),
    next: () => () => {},
};

/**
 * Tests for validation.
 */
describe('validation', () => {
    it('Sets the validation object.', async () => {
        const req = mock.req();
        const res = mock.res();
        const next = mock.next();
        await setupValidation()(req, res, next);
        expect(req.validation).toBeDefined();
    });
    it('Sets a validation error for missing report id.', async () => {
        const req = mock.req();
        const res = mock.res();
        const next = mock.next();
        req.path = '/api/v1/report/';
        await setupValidation()(req, res, next);
        expect(req.validation.errors[0].message).toBe('A report identifier is required.');
    });
    it('Handles a validation error for missing report id.', async () => {
        const req = mock.req();
        const res = mock.res();
        const next = mock.next();
        req.validation = {
            message: 'Request has validation errors',
            status: 400,
            errors: [],
        };
        await handleValidation()(req, res, next);
        expect(res.json).toBeCalledTimes(0);
        req.validation.errors.push({
            message: 'A report identifier is required.',
            parameter: 'id',
        });
        res.json.mockImplementationOnce(() => req.validation);
        await handleValidation()(req, res, next);
        expect(res.json).toBeCalledWith(req.validation);
    });
});
