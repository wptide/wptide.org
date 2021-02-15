/**
 * Internal Dependencies.
 */
const { dateTime } = require('./dateTime');
const { getAuditId } = require('./identifiers');
const { getSourceUrl } = require('./getSourceUrl');
const { getAuditDoc, setAuditDoc, getReportDoc } = require('../integrations/datastore');
const { publish, messageTypes } = require('../integrations/pubsub');
const { shouldLighthouseAudit } = require('./shouldLighthouseAudit');

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
 * @param   {string}        id     Audit ID.
 * @param   {object}        params Audit Params.
 * @returns {object | null}        Audit doc if project exists or null.
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
 * @param   {object} audit       Audit Params
 * @param   {Array}  reportTypes Reports to add.
 * @returns {object}             Audit including reports.
 */
const addAuditReports = async (audit, reportTypes) => {
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
 * @param   {object}        auditParams Audit params for audit.
 * @returns {object | null}             Audit if one exists or null if the project doesn't exist.
 */
const getAuditData = async (auditParams) => {
    const id = getAuditId(auditParams);

    let existingAuditData = await getAuditDoc(id);

    if (!existingAuditData) {
        existingAuditData = await createNewAudit(id, auditParams);
    }

    return existingAuditData;
};

module.exports = {
    sendAuditMessages,
    createNewAudit,
    addAuditReports,
    getAuditData,
};
