/**
 * Internal Dependencies.
 */
const { dateTime } = require('./dateTime');
const { getAuditId } = require('./identifiers');
const { getSourceUrl } = require('./getSourceUrl');
const {
    getAuditDoc, getReportDoc, getStatusDoc, setAuditDoc, setStatusDoc,
} = require('../integrations/firestore');
const { publish, messageTypes } = require('../integrations/pubsub');
const { shouldLighthouseAudit } = require('./shouldLighthouseAudit');
const { setAuditStatus } = require('./setAuditStatus');

const validReportTypes = ['lighthouse', 'phpcs_phpcompatibilitywp'];

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
        source_url: audit.source_url,
    };

    /* istanbul ignore else */
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

    /* istanbul ignore else */
    if (sourceUrl) {
        const timeNow = dateTime();
        const audit = {
            id,
            type: params.type,
            slug: params.slug,
            version: params.version,
            created_datetime: timeNow,
            modified_datetime: timeNow,
            source_url: sourceUrl,
            reports: {},
        };
        const statusObj = {
            attempts: 0,
            end_datetime: null,
            start_datetime: null,
            status: 'pending',
        };
        const status = {
            id,
            type: params.type,
            slug: params.slug,
            version: params.version,
            created_datetime: timeNow,
            modified_datetime: timeNow,
            source_url: sourceUrl,
            status: 'pending',
            reports: {
                phpcs_phpcompatibilitywp: {
                    ...statusObj,
                },
            },
        };

        if (audit.type === 'theme' && await shouldLighthouseAudit(audit)) {
            audit.reports.lighthouse = null;
            status.reports.lighthouse = {
                ...statusObj,
            };
        }
        audit.reports.phpcs_phpcompatibilitywp = null;

        await setStatusDoc(status.id, status);
        await setAuditDoc(audit.id, audit);
        await sendAuditMessages(audit);

        return getAuditDoc(audit.id);
    }

    /* istanbul ignore next */
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
            /* istanbul ignore else */
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

/**
 * Identifies missing reports and adds them to the audit.
 *
 * @param   {object} existingAuditData The current audit data.
 * @returns {object}                   The updated audit data.
 */
const addMissingAuditReports = async (existingAuditData) => {
    const clonedAuditData = { ...existingAuditData };
    const existingStatusData = await getStatusDoc(existingAuditData.id);
    const doLighthouse = existingAuditData.type === 'theme' ? await shouldLighthouseAudit(existingAuditData) : false;

    clonedAuditData.reports = {};

    validReportTypes.forEach((report) => {
        if (!Object.prototype.hasOwnProperty.call(existingAuditData.reports, report)) {
            /* istanbul ignore else */
            if (report === 'lighthouse') {
                if (existingAuditData.type !== 'theme' || !doLighthouse) {
                    return;
                }
            }
            clonedAuditData.reports[report] = null;
            existingStatusData.reports[report] = {
                attempts: 0,
                end_datetime: null,
                start_datetime: null,
                status: 'pending',
            };
        }
    });

    if (Object.keys(clonedAuditData.reports).length) {
        existingStatusData.status = setAuditStatus(existingStatusData);
        existingStatusData.modified_datetime = dateTime();
        existingAuditData.reports = Object.assign(existingAuditData.reports, clonedAuditData.reports); /* eslint-disable-line max-len, no-param-reassign */
        await setAuditDoc(existingAuditData.id, existingAuditData);
        await setStatusDoc(existingAuditData.id, existingStatusData);
        await sendAuditMessages(clonedAuditData);
    }

    return existingAuditData;
};

module.exports = {
    sendAuditMessages,
    createNewAudit,
    addAuditReports,
    getAuditData,
    addMissingAuditReports,
};
