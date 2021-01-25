/**
 * Internal Dependencies.
 */
const lighthouseReporter = require('../audits/lighthouseReporter');
const { auditServer } = require('./auditServer');

/**
 * Lighthouse audit server http handler.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 *
 * @returns {res} The modified HTTP response.
 */
exports.lighthouseServer = async (req, res) => auditServer(req, res, lighthouseReporter, 'lighthouse', 'Lighthouse');
