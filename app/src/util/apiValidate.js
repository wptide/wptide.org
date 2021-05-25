/**
 * External Dependencies.
 */
const SwaggerParser = require('swagger-parser');

/**
 * Internal Dependencies.
 */
const { apiSpec } = require('./apiSpec');

/**
 * Validates the API schema.
 *
 * @returns {object} The valid OpenAPI Specification object, or server error.
 */
const apiValidate = async () => {
    // Return the API specification.
    try {
        await SwaggerParser.validate(apiSpec());
        return apiSpec();
    } catch (err) {
        return {
            message: 'The server could not respond with the OpenAPI Specification',
            status: 500,
        };
    }
};

module.exports = apiValidate;
