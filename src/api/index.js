const schema = require('./schema');
const getAudit = require('./getAudit');
const getReport = require('./getReport');

/**
 * Build your API by adding handlers to this index file,
 * the handlers correspond to operationId in your OpenApi paths:
 *
 * @link https://swagger.io/specification/#operationObject
 */

module.exports = {
    schema,
    getReport,
    getAudit,
};
