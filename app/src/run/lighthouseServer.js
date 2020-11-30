/**
 * Internal Dependencies.
 */
const lighthouseReporter = require('../audits/lighthouseReporter');
const { auditServer } = require('./auditServer');

exports.lighthouseServer = async (req, res) => auditServer(req, res, lighthouseReporter, 'lighthouse', 'Lighthouse');
