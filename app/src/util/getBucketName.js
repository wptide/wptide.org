/**
 * External Dependencies.
 */
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

/**
 * Get the GCS bucket name.
 *
 * @returns {string} The bucket name.
 */
const getBucketName = /* istanbul ignore next */ () => process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME;

module.exports = {
    getBucketName,
};
