/**
 * External Dependencies.
 */
const SwaggerParser = require('swagger-parser');

/**
 * Internal Dependencies.
 */
const { apiSpec } = require('../../../src/util/apiSpec');

/**
 * Tests for apiSpec.
 */
describe('apiSpec', () => {
    it('Returns the unvalidated OpenAPI Specification', async () => {
        const api = await SwaggerParser.validate(apiSpec());
        expect(api.openapi).toBe('3.0.3');
    });
});
