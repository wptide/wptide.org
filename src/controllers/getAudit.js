/**
 * External Dependencies.
 */
const invariant = require('invariant');
const fetch = require('node-fetch');

/**
 * Internal Dependencies.
 */
const { getSourceUrl, getAuditId } = require('../util/identifiers');
const { sleep } = require('../util/sleep');
const { dateTime } = require('../util/time');
const { getAuditDoc, setAuditDoc, getReportDoc } = require('../integrations/datastore');
const { publish, messageTypes } = require('../integrations/pubsub');

const shouldLighthouseAudit = async (audit) => {
    const url = `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${audit.slug}`;
    const response = await fetch(url, {
        method: 'GET',
    });
    const themeInfo = await response.json();
    // Checks whether the version supplied is equivalent to the version from themes api.
    return themeInfo.version === audit.version && themeInfo.slug === audit.slug;
};

const sendAuditMessages = async (audit) => {
    const messageBody = {
        id: audit.id,
        slug: audit.slug,
        type: audit.type,
        version: audit.version,
    };

    // Add delays to avoid race condition during Datastore update.
    if (audit.reports) {
        if (audit.reports.phpcs_phpcompatibilitywp === null) {
            await sleep(1000);
            await publish(messageBody, messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST);
        }

        if (audit.reports.lighthouse === null) {
            await sleep(1000);
            await publish(messageBody, messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST);
        }
    }
};

const createNewAudit = async (id, params) => {
    const sourceUrl = await getSourceUrl(params.type, params.slug, params.version);

    if (sourceUrl) {
        const timeNow = dateTime();
        const audit = {
            id,
            type: params.type,
            slug: params.slug,
            version: params.version,
            created_datetime: timeNow,
            last_modified_datetime: timeNow,
            reports: {},
        };

        if (audit.type === 'theme' && await shouldLighthouseAudit(audit)) {
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
                updatedAudit.reports[reportType] = report;
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
    invariant(req.params.type, 'Project type missing');
    invariant(['theme', 'plugin'].includes(req.params.type), 'Project type should be theme or plugin');
    invariant(req.params.slug, 'Project slug missing');
    invariant(req.params.version, 'Version missing');
    invariant(req.params.length !== 3, 'Only type, slug and version required');
    req.params.type = req.params.type.replace(/[^\w.-]+/g, '');
    req.params.slug = req.params.slug.replace(/[^\w.-]+/g, '');
    req.params.version = req.params.version.replace(/[^\d.]+/g, '');

    const id = getAuditId(req.params);

    let existingAuditData = await getAuditDoc(id);

    if (!existingAuditData) {
        existingAuditData = await createNewAudit(id, req.params);
    }

    if (existingAuditData && req.query && req.query.reports) {
        existingAuditData = await addReports(existingAuditData, req.query.reports.split(','));
    }

    if (existingAuditData) {
        res.json(existingAuditData);
    } else {
        res.status(404).json({
            error: {
                code: 404,
                message: 'Audit not found',
            },
        });
    }
};

module.exports = getAudit;
