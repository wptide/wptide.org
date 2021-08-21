/**
 * External Dependencies.
 */
const dotenv = require('dotenv');

/**
 * Internal Dependencies.
 */
const {
    get, set, remove, snapshot,
} = require('../services/firestore');

dotenv.config({ path: `${process.cwd()}/../.env` });

const auditCollection = 'Audit';
const reportCollection = 'Report';
const statusCollection = 'Status';
const syncCollection = 'Sync';
const ingestCollection = 'Ingest';

/**
 * Gets an audit document for a given ID.
 *
 * @param   {string}      id Audit ID.
 * @returns {object|null}    Audit document.
 */
const getAuditDoc = async (id) => {
    const audit = await get(`${auditCollection}/${id}`);

    /* eslint-disable prefer-object-spread */
    if (audit) {
        // Forces sort order in response.
        return Object.assign({
            id: audit.id,
            type: audit.type,
            slug: audit.slug,
            version: audit.version,
            source_url: audit.source_url,
            created_datetime: audit.created_datetime,
            modified_datetime: audit.modified_datetime,
            status: audit.status,
        }, audit);
    }

    return null;
};

/**
 * Sets an audit document.
 *
 * @param   {string}          id   Audit ID.
 * @param   {object}          data Audit contents.
 * @returns {Promise<string>}      Key
 */
const setAuditDoc = async (id, data) => set(`${auditCollection}/${id}`, data);

/**
 * Gets a status document.
 *
 * @param   {string}               id Status ID.
 * @returns {Promise<object|null>}    Status document if it exists.
 */
const getStatusDoc = async (id) => get(`${statusCollection}/${id}`);

/**
 * Sets a status document.
 *
 * @param   {string}          id   Status ID.
 * @param   {object}          data Status contents.
 * @returns {Promise<string>}      Key
 */
const setStatusDoc = async (id, data) => set(`${statusCollection}/${id}`, data);

/**
 * Sets a sync document
 *
 * @param   {string}          id   Sync ID.
 * @param   {object}          data Sync contents.
 * @returns {Promise<string>}      Key
 */
const setSyncDoc = async (id, data) => set(`${syncCollection}/${id}`, data);

/**
 * Gets a sync document.
 *
 * @param   {string}               id Sync ID.
 * @returns {Promise<object|null>}    Sync document if it exists.
 */
const getSyncDoc = async (id) => get(`${syncCollection}/${id}`);

/**
 * Gets a limited number of docs from the ingest collection.
 *
 * @param   {number}         limit The query limit.
 * @returns {Promise<Array>}       Ingest documents snapshot.
 */
const getIngestSnapshot = async (limit) => snapshot(ingestCollection, limit);

/**
 * Sets an ingest document.
 *
 * @param   {string}          id   Ingest ID.
 * @param   {object}          data Ingest contents.
 * @returns {Promise<string>}      Key
 */
const setIngestDoc = async (id, data) => set(`${ingestCollection}/${id}`, data);

/**
 * Deletes an ingest document.
 *
 * @param   {string}               id Ingest ID.
 * @returns {Promise<object|null>}    Ingest document if it exists.
 */
const deleteIngestDoc = async (id) => remove(`${ingestCollection}/${id}`);

/**
 * Gets a report document.
 *
 * @param   {string}      id Report ID.
 * @returns {object|null}    Report document if it exists.
 */
const getReportDoc = async (id) => {
    const report = await get(`${reportCollection}/${id}`);

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
            server: report.server,
        }, report);
    }

    return null;
};

/**
 * Sets a report document
 *
 * @param   {string}          id   Report ID.
 * @param   {object}          data Report contents.
 * @returns {Promise<string>}      Key
 */
const setReportDoc = async (id, data) => set(`${reportCollection}/${id}`, data);

module.exports = {
    getAuditDoc,
    setAuditDoc,
    getStatusDoc,
    setStatusDoc,
    getSyncDoc,
    setSyncDoc,
    getReportDoc,
    setReportDoc,
    getIngestSnapshot,
    setIngestDoc,
    deleteIngestDoc,
};
