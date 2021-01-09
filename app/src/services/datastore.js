/**
 * External Dependencies.
 */
const { Datastore } = require('@google-cloud/datastore');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

let datastoreInstance;

/**
 * Returns a singleton instance of DataStore client.
 *
 * @returns {object} Datastore instance.
 */
const getDatastore = () => {
    if (!datastoreInstance) {
        const options = {};
        if (process.env.NODE_ENV !== 'production') {
            options.apiEndpoint = process.env.ENDPOINT_DATASTORE;
            options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
        }
        datastoreInstance = new Datastore(options);
    }
    return datastoreInstance;
};

/**
 * Gets entity for a given key.
 *
 * @param {string} key Key to get.
 *
 * @returns {object | null} Entity or null.
 */
const get = async (key) => {
    const datastore = getDatastore();
    const entities = await datastore.get(key);
    return entities.length ? entities[0] : null;
};

/**
 * Gets entity for a given key.
 *
 * @param {string} key  Key to set.
 * @param {object} data Data to set for the given key.
 *
 * @returns {string} Key.
 */
const set = async (key, data) => {
    try {
        const datastore = getDatastore();
        await datastore.save({
            method: 'upsert',
            excludeLargeProperties: true,
            key,
            data,
        });
    } catch (e) {
        console.log(e);
    }
    return key;
};

/**
 *
 * @param {string} keyPath Key Path for Key
 * @param {string} id      ID for Key
 *
 * @returns {object} Key for DataStore access.
 */
const getKey = (keyPath, id) => getDatastore().key([keyPath, id]);

module.exports = {
    get,
    set,
    getKey,
};
