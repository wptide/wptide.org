/**
 * Internal Dependencies.
 */
const { bucketExists, getFile } = require('../services/storage');
const { readFile } = require('./dataFile');
const { getBucketName } = require('./getBucketName');

/**
 * Get the report object from GCS or the local filesystem by ID.
 *
 * @param   {string}          type     The report type.
 * @param   {string}          reportId The report identifier.
 * @returns {Promise<object>}          The report object.
 */
const getReportFile = async (type, reportId) => {
    const bucketName = getBucketName();

    // Generate the name of the file to store.
    const fileName = `${type}/${reportId}.json`;
    let report = {};

    // Get data from GCS.
    if (bucketName && await bucketExists(bucketName)) {
        const gcsData = await getFile(bucketName, fileName);
        /* istanbul ignore else */
        if (gcsData) {
            report = {
                ...gcsData,
            };
        }
    } else {
        // Get data from the local filesystem.
        const localFile = await readFile(fileName);
        /* istanbul ignore else */
        if (localFile) {
            const localData = JSON.parse(localFile);
            report = {
                ...localData,
            };
        }
    }

    return report;
};

module.exports = {
    getReportFile,
};
