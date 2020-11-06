const invariant = require('invariant');
const fetch = require('node-fetch');
const { dateTime } = require('../util/time');

const { getAuditId, getProjectId } = require('../util/identifiers');
const { getAuditDoc, setAuditDoc } = require('../integrations/datastore');
const { publish, messageTypes } = require('../integrations/pubsub');

const checkValidProject = async (url) => {
    const response = await fetch(url, {
        method: 'HEAD',
    });

    return response.ok;
};

const shouldLighthouseAudit = async (auditData) => {
    const url = `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${auditData.project_slug}`;
    const response = await fetch(url, {
        method: 'GET',
    });
    const themeInfo = await response.json();
    // Checks whether the version supplied is equivalent to the version from themes api.
    return themeInfo.version === auditData.version && themeInfo.slug === auditData.project_slug;
};

const sendAuditMessages = async (auditData) => {
    const messageBody = {
        id: auditData.id,
        slug: auditData.project_slug,
    };

    if (auditData.project_type === 'theme' && await shouldLighthouseAudit(auditData)) {
        await publish(messageBody, messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST);
    }

    messageBody.project_type = auditData.project_type;
    messageBody.version = auditData.version;

    await publish(messageBody, messageTypes.MESSAGE_TYPE_CODE_SNIFFER_REQUEST);
};

const createNewAudit = async (auditData, params) => {
    const audit = { ...auditData };
    const url = `https://downloads.wordpress.org/${params.project_type}/${params.project_slug}.${params.version}.zip`;
    if (await checkValidProject(url)) {
        const timeNow = dateTime();
        audit.created_datetime = timeNow;
        audit.last_modified_datetime = timeNow;
        audit.version = params.version;
        audit.project_type = params.project_type;
        audit.project_slug = params.project_slug;
        audit.source_url = url;
        audit.standards = [];
        await setAuditDoc(audit.id, audit);
        await sendAuditMessages(audit);
        return getAuditDoc(audit.id);
    }
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
    req.params.project_type = req.params.project_type.replace(/[^\w.-]+/g, '');
    req.params.project_slug = req.params.project_slug.replace(/[^\w.-]+/g, '');
    req.params.version = req.params.version.replace(/[^\d.]+/g, '');

    const id = getAuditId(req.params);
    const projectId = getProjectId(req.params);
    const auditData = {
        id,
        project_id: projectId,
    };

    let existingAuditData = await getAuditDoc(id);

    if (!existingAuditData) {
        existingAuditData = await createNewAudit(auditData, req.params);
    }

    if (!existingAuditData) {
        res.json('not found');
    } else {
        res.json(existingAuditData);
    }
    // res.json({ action: 'getAudit', params: req.params, setbar, getbar });
    // res.json({ action: 'getAudit', params: req.params, audit: await lh('https://wp-themes.com/twentytwenty/') });
};

module.exports = getAudit;
