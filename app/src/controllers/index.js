/**
 * Internal Dependencies.
 */
const schema = require('./schema');
const { getAudit } = require('./getAudit');
const getReport = require('./getReport');

/**
 * Implements handlers for the API endpoints.
 *
 * The handlers correspond to an `operationId` defined in `paths`
 * for each endpoint, which is found in the `openeapi.yml` file.
 *
 * @see https://swagger.io/specification/#operationObject
 */
module.exports = {
    schema,
    getReport,
    getAudit,
};
