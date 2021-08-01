/**
 * External Dependencies.
 */
const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

let storageInstance;

/**
 * Returns a singleton instance of PubSub client.
 *
 * @returns {object} Storage instance.
 */
const getStorage = async () => {
    const options = {};

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
        options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
        options.keyFilename = `${process.cwd()}/service-account.json`;
    }

    if (!storageInstance) {
        storageInstance = new Storage(options);
    }

    return storageInstance;
};

/**
 * Check to see if the bucket exists.
 *
 * @param   {string}  bucketName The name of the bucket.
 * @returns {Promise}            Whether or not the bucket exists.
 */
const bucketExists = async (bucketName) => {
    try {
        const storage = await getStorage();
        const bucket = storage.bucket(bucketName);
        const [exists] = await bucket.exists();

        return exists;
    } catch (err) {
        return false;
    }
};

/**
 * Saves a JSON object as a file to GCS.
 *
 * @param   {string}  bucketName The name of the bucket.
 * @param   {string}  fileName   The name of the file.
 * @param   {object}  report     The Lighthouse report object.
 * @returns {boolean}            Whether or not the file was written without errors.
 */
const saveFile = async (bucketName, fileName, report) => {
    try {
        const storage = await getStorage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        return file.save(JSON.stringify(report), { gzip: true }, (err) => !err);
    } catch (err) {
        return false;
    }
};

module.exports = {
    getStorage,
    bucketExists,
    saveFile,
};
