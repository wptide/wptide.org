const invariant = require('invariant');
// const lh = require('../audits/lighthouse');
const { getAuditId, getProjectId } = require('../util/identifiers');
// const { get, set } = require('../integrations/datastore');
const { get } = require('../integrations/datastore');

const createNewAudit = (auditData, params) => {
    console.debug(auditData); // eslint-disable-line no-console
    console.debug(params); // eslint-disable-line no-console
    return null; // Project not found
};

/**
 * Gets an existing Audit
 *
 * @param req
 * @param res
 */
const getAudit = async (req, res) => {
    invariant(req.params.project_type, 'Project type missing');
    invariant(['theme', 'plugin'].includes(req.params.project_type), 'Project type should be theme or plugin');
    invariant(req.params.project_slug, 'Project slug missing');
    invariant(req.params.version, 'Version missing');
    invariant(req.params.length !== 3, 'Only type, slug and version required');

    const auditId = getAuditId(req.params);
    const projectId = getProjectId(req.params);
    const auditData = {
        auditId,
        projectId,
        date: new Date().toJSON(),
    };

    let existingAuditData = await get(auditId);

    if (!existingAuditData) {
        existingAuditData = await createNewAudit(auditData, req.params);
    }

    if (!existingAuditData) {
        res.status(404).json(req.params);
    }
    res.json(existingAuditData);
    // res.json({ action: 'getAudit', params: req.params, setbar, getbar });
    // res.json({ action: 'getAudit', params: req.params, audit: await lh('https://wp-themes.com/twentytwenty/') });
};

module.exports = getAudit;
