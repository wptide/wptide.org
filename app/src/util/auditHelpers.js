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
const { getReportFile } = require('./getReportFile');
const { MAX_DURATION, MAX_ATTEMPTS } = require('./canProceed');

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
            status: 'pending',
            reports: {
                phpcs_phpcompatibilitywp: null,
            },
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
            const reportDoc = await getReportDoc(reportId);
            const reportData = await getReportFile(reportType, reportId);

            /* istanbul ignore else */
            if (reportDoc && reportData) {
                // Attach the audit report to the doc.
                updatedAudit.reports[reportType] = {
                    ...reportDoc,
                    ...reportData,
                };
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
    const checkKeys = ['in-progress', 'pending'];

    let existingAuditData = await getAuditDoc(id);

    if (!existingAuditData) {
        existingAuditData = await createNewAudit(id, auditParams);

        // Report is stuck in pending or in-progress longer than is allowed, force failure.
        // @todo look into the root cause if this bug and patch it correctly.
    } else if (
        existingAuditData.status
        && Object.keys(existingAuditData.reports).length
        && checkKeys.includes(existingAuditData.status)
        && !Object.keys(existingAuditData.reports).every((k) => !!existingAuditData.reports[k]) /* eslint-disable-line max-len */
        && existingAuditData.created_datetime + (MAX_DURATION * MAX_ATTEMPTS) < dateTime()
    ) {
        const existingStatusData = await getStatusDoc(existingAuditData.id);

        Object.keys(existingStatusData.reports).forEach((key) => {
            /* istanbul ignore else */
            if (checkKeys.includes(existingStatusData.reports[key].status)) {
                existingStatusData.reports[key].status = 'failed';
            }
        });

        existingAuditData.status = 'failed';
        existingAuditData.modified_datetime = dateTime();

        existingStatusData.status = 'failed';
        existingStatusData.modified_datetime = dateTime();

        await setAuditDoc(existingAuditData.id, existingAuditData);
        await setStatusDoc(existingAuditData.id, existingStatusData);

        // All reports are complete but were not updated, so we need to update the status.
        // @todo look into the root cause if this bug and patch it correctly.
    } else if (
        existingAuditData.status
        && Object.keys(existingAuditData.reports).length
        && checkKeys.includes(existingAuditData.status)
        && Object.keys(existingAuditData.reports).every((k) => !!existingAuditData.reports[k])
    ) {
        const existingStatusData = await getStatusDoc(existingAuditData.id);

        Object.keys(existingStatusData.reports).forEach((key) => {
            if (checkKeys.includes(existingStatusData.reports[key].status)) {
                /* istanbul ignore else */
                if (existingStatusData.reports[key].attempts === 0) {
                    existingStatusData.reports[key].attempts = 1;
                }
                /* istanbul ignore else */
                if (existingStatusData.reports[key].end_datetime === null) {
                    existingStatusData.reports[key].end_datetime = dateTime();
                }
                /* istanbul ignore else */
                if (existingStatusData.reports[key].start_datetime === null) {
                    existingStatusData.reports[key].start_datetime = existingStatusData.created_datetime; /* eslint-disable-line max-len */
                }
                existingStatusData.reports[key].status = 'complete';
            }
        });

        existingAuditData.status = 'complete';
        existingAuditData.modified_datetime = dateTime();

        existingStatusData.status = 'complete';
        existingStatusData.modified_datetime = dateTime();

        await setAuditDoc(existingAuditData.id, existingAuditData);
        await setStatusDoc(existingAuditData.id, existingStatusData);
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
