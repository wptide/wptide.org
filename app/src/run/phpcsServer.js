/**
 * Internal Dependencies.
 */
const phpcsReporter = require('../audits/phpcsReporter');
const { auditServer } = require('./auditServer');

exports.phpcsServer = async (req, res) => auditServer(req, res, phpcsReporter, 'phpcs_phpcompatibilitywp', 'PHPCS PHPCompatibilityWP');
