/**
 * External Dependencies.
 */
const dotenv = require('dotenv');

/**
 * Internal Dependencies.
 */
const { get, set, getKey } = require('../services/datastore');

dotenv.config({ path: `${process.cwd()}/../.env` });

const auditKeyPath = process.env.DATASTORE_KEY_AUDIT || 'Audit';
const reportKeyPath = process.env.DATASTORE_KEY_REPORT || 'Report';
const statusKeyPath = process.env.DATASTORE_KEY_STATUS || 'Status';

const getAuditDoc = async (id) => {
    const audit = await get(getKey(auditKeyPath, id));

    /* eslint-disable prefer-object-spread */
    if (audit) {
        // Forces sort order in response.
        return Object.assign({
            id: audit.id,
            type: audit.type,
            slug: audit.slug,
            version: audit.version,
            created_datetime: audit.created_datetime,
            last_modified_datetime: audit.last_modified_datetime,
        }, audit);
    }

    return null;
};

const setAuditDoc = async (id, data) => set(getKey(auditKeyPath, id), data);

const setStatusDoc = async (id, data) => set(getKey(statusKeyPath, id), data);

const getStatusDoc = async (id) => get(getKey(statusKeyPath, id));

const getReportDoc = async (id) => {
    const report = await get(getKey(reportKeyPath, id));

    /* eslint-disable prefer-object-spread */
    if (report) {
        // Forces sort order in response.
        return Object.assign({
            id: report.id,
            type: report.type,
            source_url: report.source_url,
            created_datetime: report.created_datetime,
            milliseconds: report.milliseconds,
            audit: report.audit,
        }, report);
    }

    return null;
};

const setReportDoc = async (id, data) => set(getKey(reportKeyPath, id), data);

module.exports = {
    getAuditDoc,
    setAuditDoc,
    getStatusDoc,
    setStatusDoc,
    getReportDoc,
    setReportDoc,
};
