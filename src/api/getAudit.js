/**
 * External Dependencies.
 */
const invariant = require('invariant');
const fetch = require('node-fetch');

/**
 * Internal Dependencies.
 */
const { dateTime } = require('../util/time');
const { getSourceUrl, getAuditId, getProjectId } = require('../util/identifiers');
const { getAuditDoc, setAuditDoc, getReportDoc } = require('../integrations/datastore');
const { publish, messageTypes } = require('../integrations/pubsub');

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
        project_type: auditData.project_type,
        version: auditData.version,
    };

    // Add delays to avoid race condition during Datastore update.
    if (auditData.reports) {
        setTimeout(async () => {
            if (auditData.reports.phpcs_phpcompatibilitywp === null) {
                await publish(messageBody, messageTypes.MESSAGE_TYPE_PHPCS_REQUEST);
            }
        }, 2000);

        setTimeout(async () => {
            if (auditData.reports.lighthouse === null) {
                await publish(messageBody, messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST);
            }
        }, 4000);
    }
};

const createNewAudit = async (auditData, params) => {
    const audit = { ...auditData };
    const sourceUrl = await getSourceUrl(params.project_type, params.project_slug, params.version);

    if (sourceUrl) {
        const timeNow = dateTime();

        audit.created_datetime = timeNow;
        audit.last_modified_datetime = timeNow;
        audit.project_type = params.project_type;
        audit.project_slug = params.project_slug;
        audit.reports = {};
        audit.source_url = sourceUrl;
        audit.version = params.version;

        if (audit.project_type === 'theme' && await shouldLighthouseAudit(auditData)) {
            audit.reports.lighthouse = null;
        }
        audit.reports.phpcs_phpcompatibilitywp = null;

        await setAuditDoc(audit.id, audit);
        await sendAuditMessages(audit);

        return getAuditDoc(audit.id);
    }

    return null; // Project not found
};

const addReports = async (audit, reportTypes) => {
    const updatedAudit = { ...audit };
    const validReportTypes = ['lighthouse', 'phpcs_phpcompatibilitywp'];
    let fetchReportTypes = [];

    if (reportTypes.includes('all')) {
        fetchReportTypes = validReportTypes;
    } else {
        validReportTypes.forEach((validReportType) => {
            if (reportTypes.includes(validReportType)) {
                fetchReportTypes.push(validReportType);
            }
        });
    }

    await Promise.all(fetchReportTypes.map(async (reportType) => {
        const reportId = updatedAudit.reports[reportType]
            ? updatedAudit.reports[reportType].id : null;
        if (reportId) {
            const report = await getReportDoc(reportId);
            if (report) {
                // Attach the audit report to the doc.
                updatedAudit.reports[reportType].report = report.raw || report;
            }
        }
    }));

    return updatedAudit;
};

/**
 * Gets an existing Audit.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
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

    if (existingAuditData && req.query && req.query.reports) {
        existingAuditData = await addReports(existingAuditData, req.query.reports.split(','));
    }

    if (!existingAuditData) {
        res.json('not found');
    } else {
        res.json(existingAuditData);
    }
};

module.exports = getAudit;
