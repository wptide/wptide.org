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
        const bucket = await storage.bucket(bucketName);
        const [exists] = await bucket.exists();

        return exists;
    } catch (err) {
        return false;
    }
};

/**
 * Saves a JSON object as a file to GCS.
 *
 * @param   {string}                bucketName The name of the bucket.
 * @param   {string}                fileName   The name of the file.
 * @param   {object}                report     The Lighthouse report object.
 * @returns {Promise<boolean|void>}            Whether or not the file was written without errors.
 */
const saveFile = async (bucketName, fileName, report) => {
    try {
        const storage = await getStorage();
        const bucket = await storage.bucket(bucketName);
        const file = await bucket.file(fileName);

        return file.save(JSON.stringify(report), { gzip: true }, (err) => !err);
    } catch (err) {
        return false;
    }
};

/**
 * Get a JSON file as an object from GCS.
 *
 * @param   {string}                  bucketName The name of the bucket.
 * @param   {string}                  fileName   The name of the file.
 * @returns {Promise<object|boolean>}            The contents of the JSON file converted
 *                                               to an object or null.
 */
const getFile = async (bucketName, fileName) => {
    try {
        const storage = await getStorage();
        const bucket = await storage.bucket(bucketName);
        const file = await bucket.file(fileName).download();

        return JSON.parse(file[0].toString('utf8'));
    } catch (err) {
        return false;
    }
};

module.exports = {
    getStorage,
    bucketExists,
    saveFile,
    getFile,
};
