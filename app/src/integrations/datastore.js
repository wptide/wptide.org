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
const syncKeyPath = process.env.DATASTORE_KEY_SYNC || 'Sync';

/**
 * Gets an audit document for a given ID.
 *
 * @param {string} id Audit ID.
 * @returns {object | null} Audit document.
 */
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
            modified_datetime: audit.modified_datetime,
        }, audit);
    }

    return null;
};

/**
 * Sets an audit document.
 *
 * @param {string} id   Audit ID.
 * @param {object} data Audit contents.
 * @returns {string} Key
 */
const setAuditDoc = async (id, data) => set(getKey(auditKeyPath, id), data);

/**
 * Gets a status document.
 *
 * @param {string} id Status ID.
 * @returns {object | null} Sync document if it exists.
 */
const getStatusDoc = async (id) => get(getKey(statusKeyPath, id));

/**
 * Sets a status document.
 *
 * @param {string} id   Status ID.
 * @param {object} data Status contents.
 * @returns {string} Key
 */
const setStatusDoc = async (id, data) => set(getKey(statusKeyPath, id), data);

/**
 * Sets a sync document
 *
 * @param {string} id   Sync ID.
 * @param {object} data Sync contents.
 * @returns {string} Key
 */
const setSyncDoc = async (id, data) => set(getKey(syncKeyPath, id), data);

/**
 * Gets a sync document.
 *
 * @param {string} id Sync ID.
 * @returns {object | null} Sync document if it exists.
 */
const getSyncDoc = async (id) => get(getKey(syncKeyPath, id));

/**
 * Gets a report document.
 *
 * @param {string} id Report ID.
 * @returns {object | null} Report document if it exists.
 */
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

/**
 * Sets a report document
 *
 * @param {string} id   Report ID.
 * @param {object} data Report contents.
 * @returns {string} Key
 */
const setReportDoc = async (id, data) => set(getKey(reportKeyPath, id), data);

module.exports = {
    getAuditDoc,
    setAuditDoc,
    getStatusDoc,
    setStatusDoc,
    getSyncDoc,
    setSyncDoc,
    getReportDoc,
    setReportDoc,
};
