/**
 * Internal Dependencies.
 */
const phpcsReporter = require('./src/audits/phpcsReporter');
const { auditServer } = require('./src/run/auditServer');

/**
 * Exports the PHPCS Cloud Run server to the `tide` namespace.
 *
 * @param   {object} req The HTTP request.
 * @param   {object} res The HTTP response.
 * @returns {res}        The modified HTTP response.
 */
exports.tide = async (req, res) => auditServer(req, res, phpcsReporter, 'phpcs_phpcompatibilitywp', 'PHPCS PHPCompatibilityWP');
