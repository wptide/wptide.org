const invariant = require('invariant');

/**
 * Gets an existing Audit
 *
 * @param req
 * @param res
 */
const getAudit = (req, res) => {
    invariant(req.params.project_type, 'Project type missing');
    invariant(['theme', 'plugin'].includes(req.params.project_type), 'Project type should be theme or plugin');
    invariant(req.params.project_slug, 'Project slug missing');
    invariant(req.params.version, 'Version missing');
    res.json({ action: 'getAudit', params: req.params });
};
module.exports = getAudit;
