const { Datastore } = require('@google-cloud/datastore');

let datastoreInstance;

// const auditKeyPath = 'Audit';
// const reportKeyPath = 'Report';
const auditKeyPath = `Audit${new Date().toJSON().substr(0, 16)}`; // @TODO: changeme, new queue every init
const reportKeyPath = `Report${new Date().toJSON().substr(0, 16)}`; // @TODO: changeme, new queue every init

const getDatastore = () => {
    if (!datastoreInstance) {
        datastoreInstance = new Datastore({ apiEndpoint: 'localhost:8081' });
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

const getAuditDoc = async (id) => await get(getKey(auditKeyPath, id));

const setAuditDoc = async (id, data) => await set(getKey(auditKeyPath, id), data);

const getReport = async (id) => await get(getKey(reportKeyPath, id));

const setReport = async (id, data) => await set(getKey(reportKeyPath, id), data);

module.exports = {
    getAuditDoc,
    setAuditDoc,
    getReport,
    setReport,
};
