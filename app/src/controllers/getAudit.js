/**
 * External Dependencies.
 */
const invariant = require('invariant');

/**
 * Internal Dependencies.
 */
const { dateTime } = require('../util/dateTime');
const { getAuditId } = require('../util/identifiers');
const { getSourceUrl } = require('../util/getSourceUrl');
const { getAuditDoc, setAuditDoc, getReportDoc } = require('../integrations/datastore');
const { publish, messageTypes } = require('../integrations/pubsub');
const { shouldLighthouseAudit } = require('../util/shouldLighthouseAudit');

/**
 * Send Audit Messages for audits that need to occur.
 *
 * @param {object} audit Project we are auditing.
 */
const sendAuditMessages = async (audit) => {
    const messageBody = {
        id: audit.id,
        slug: audit.slug,
        type: audit.type,
        version: audit.version,
    };

    if (audit.reports) {
        if (audit.reports.phpcs_phpcompatibilitywp === null) {
            await publish(messageBody, messageTypes.MESSAGE_TYPE_PHPCS_REQUEST);
        }

        if (audit.reports.lighthouse === null) {
            await publish(messageBody, messageTypes.MESSAGE_TYPE_LIGHTHOUSE_REQUEST);
        }
    }
};

/**
 * Create a new audit
 *
 * @param {string} id     Audit ID.
 * @param {object} params Audit Params.
 * @returns {object | null} Audit doc if project exists or null.
 */
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
            modified_datetime: timeNow,
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

/**
 * Add report docs to a given audit.
 *
 * @param {object} audit       Audit Params
 * @param {Array}  reportTypes Reports to add.
 * @returns {object} Audit including reports.
 */
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
 * Fetches an existing audit doc, creating an audit if we don't yet have it.
 *
 * @param {object} auditParams Audit params for audit.
 * @returns {object | null} Audit if one exists or null if the project doesn't exist.
 */
const doAudit = async (auditParams) => {
    const id = getAuditId(auditParams);

    let existingAuditData = await getAuditDoc(id);

    if (!existingAuditData) {
        existingAuditData = await createNewAudit(id, auditParams);
    }

    return existingAuditData;
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

    let existingAuditData = await doAudit(req.params);

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

module.exports = {
    getAudit,
    doAudit,
};
