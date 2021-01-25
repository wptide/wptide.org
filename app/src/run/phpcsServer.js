/**
 * Internal Dependencies.
 */
const phpcsReporter = require('../audits/phpcsReporter');
const { auditServer } = require('./auditServer');

/**
 * PHPCS audit server http handler.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 *
 * @returns {res} The modified HTTP response.
 */
exports.phpcsServer = async (req, res) => auditServer(req, res, phpcsReporter, 'phpcs_phpcompatibilitywp', 'PHPCS PHPCompatibilityWP');
