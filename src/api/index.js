const schema = require('./schema');
const schemaSummary = require('./schemaSummary');
const getAudit = require('./getAudit');

/**
 * Build your API by adding handlers to this index file,
 * the handlers correspond to operationId in your OpenApi paths:
 *
 * @link https://swagger.io/specification/#operationObject
 */

module.exports = {
    schema,
    schemaSummary,
    getAudit,
};
