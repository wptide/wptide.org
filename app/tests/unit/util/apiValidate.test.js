/**
 * Internal Dependencies.
 */
const apiValidate = require('../../../src/util/apiValidate');

/**
 * Tests for apiValidate.
 */
describe('apiValidate', () => {
    it('Returns a validated OpenAPI Specification', async () => {
        const api = await apiValidate();
        expect(api.openapi).toBe('3.0.3');
    });
    it('Returns a 500 server error message', async () => {
        jest.resetModules();
        jest.mock(
            '../../../src/util/apiSpec',
            () => ({
                apiSpec: () => 'apispec',
            }),
        );

        // eslint-disable-next-line global-require
        const validate = require('../../../src/util/apiValidate');
        const api = await validate();
        expect(api.status).toBe(500);
    });
});
