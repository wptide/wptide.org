/**
 * External Dependencies.
 */
const { Firestore } = require('@google-cloud/firestore');
const dotenv = require('dotenv');

dotenv.config({ path: `${process.cwd()}/../.env` });

let firestoreInstance;

/**
 * Returns a singleton instance of Firestore client.
 *
 * @returns {object}  Firestore instance.
 */
const getFirestore = () => {
    if (!firestoreInstance) {
        const options = {};
        if (process.env.NODE_ENV !== 'production') {
            options.projectId = process.env.GOOGLE_CLOUD_PROJECT;
            options.ssl = false;
        }
        firestoreInstance = new Firestore(options);
    }
    return firestoreInstance;
};

/**
 * Gets entity for a given key.
 *
 * @param   {string}        documentPath Path to the document: example `collection/id`.
 *
 * @returns {object | null}              Entity or null.
 */
const get = async (documentPath) => getFirestore()
    .doc(documentPath)
    .get()
    .then((doc) => {
        if (doc.exists) {
            return doc.data();
        }
        return null;
    })
    .catch((err) => {
        console.log(err);
        return null;
    });

/**
 * Sets the document data for a given document path.
 *
 * @param   {string} documentPath Path to the document: example `collection/id`.
 * @param   {object} data         Data to set for the given key.
 *
 * @returns {string}              Key.
 */
const set = async (documentPath, data) => getFirestore()
    .doc(documentPath)
    .set(data)
    .then((res) => !!res.updateTime)
    .catch((err) => {
        console.log(err);
        return false;
    });

/**
 * Deletes an entity for a given key.
 *
 * @param   {string}        documentPath Path to the document: example `collection/id`.
 *
 * @returns {object | null}              Entity or null.
 */
const remove = async (documentPath) => getFirestore()
    .doc(documentPath)
    .delete()
    .then(() => true)
    .catch((err) => {
        console.log(err);
        return false;
    });

/**
 * Gets a limited number of entities for a given collection.
 *
 * @param   {string}        collection Path to the collection: example `collection`.
 * @param   {number}        limit      The query limit.
 *
 * @returns {object | null}            Entity or null.
 */
const snapshot = async (collection, limit) => getFirestore()
    .collection(collection)
    .limit(limit)
    .get();

module.exports = {
    get,
    set,
    remove,
    snapshot,
};
