const { Datastore } = require('@google-cloud/datastore');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

let datastoreInstance;

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

const get = async (key) => {
    const datastore = getDatastore();
    const entities = await datastore.get(key);
    return entities.length ? entities[0] : null;
};

const set = async (key, data) => {
    const datastore = getDatastore();
    await datastore.save({
        method: 'upsert',
        excludeLargeProperties: true,
        key,
        data,
    });
    return key;
};

const getKey = (keyPath, id) => getDatastore().key([keyPath, id]);

module.exports = {
    get,
    set,
    getKey,
};
