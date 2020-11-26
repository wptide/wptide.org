const { Datastore } = require('@google-cloud/datastore');

let datastoreInstance;

const auditKeyPath = process.env.DATASTORE_KEY_AUDIT || 'Audit';
const reportKeyPath = process.env.DATASTORE_KEY_REPORT || 'Report';

const getDatastore = () => {
    if (!datastoreInstance) {
        const options = {};
        if (process.env.NODE_ENV !== 'production') {
            options.apiEndpoint = process.env.ENDPOINT_DATASTORE || 'localhost:8081';
            options.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'tide-staging';
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

const getAuditDoc = async (id) => get(getKey(auditKeyPath, id));

const setAuditDoc = async (id, data) => set(getKey(auditKeyPath, id), data);

const getReportDoc = async (id) => get(getKey(reportKeyPath, id));

const setReportDoc = async (id, data) => set(getKey(reportKeyPath, id), data);

module.exports = {
    getAuditDoc,
    setAuditDoc,
    getReportDoc,
    setReportDoc,
};
