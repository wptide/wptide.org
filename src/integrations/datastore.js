const { Datastore } = require('@google-cloud/datastore');

let datastoreInstance;

const getDatastore = () => {
    if (!datastoreInstance) {
        datastoreInstance = new Datastore({ apiEndpoint: 'localhost:8081' });
    }
    return datastoreInstance;
};

const get = async (id) => {
    const datastore = getDatastore();
    const key = datastore.key(['Audit', id]);
    const entities = await datastore.get(key);
    return entities.length ? entities[0] : null;
};

const set = async (id, data) => {
    const datastore = getDatastore();
    const key = datastore.key(['Audit', id]);
    await datastore.save({
        method: 'upsert',
        key,
        data,
    });
    return key;
};

module.exports = {
    get,
    set,
};
