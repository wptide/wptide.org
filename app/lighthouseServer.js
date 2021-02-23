/**
 * Internal Dependencies.
 */
const lighthouseReporter = require('./src/audits/lighthouseReporter');
const { auditServer } = require('./src/run/auditServer');

/**
 * Exports the Lighthouse Cloud Run server to the `tide` namespace.
 *
 * @param   {object} req The HTTP request.
 * @param   {object} res The HTTP response.
 *
 * @returns {res}        The modified HTTP response.
 */
exports.tide = async (req, res) => auditServer(req, res, lighthouseReporter, 'lighthouse', 'Lighthouse');
