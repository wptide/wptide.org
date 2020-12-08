/**
 * Internal Dependencies.
 */
const { dateTime } = require('./time');
const { getStatusDoc, setStatusDoc } = require('../integrations/datastore');

const MAX_DURATION = 300; // Max audit duration in seconds.
const MAX_RETRIES = 2; // Max number of times we can attempt to redo the same audit.

/**
 * A gatekeeper for whether or not we can proceed with an audit
 *
 * @param {string} type Audit type being performed (e.g. lighthouse)
 * @param {object} item The audit params.
 * @returns {boolean} Whether or not we can proceed with an audit.
 */
const canProceed = async (type, item) => {
    if (!type) {
        throw new Error('type param missing');
    }
    if (!item || !item.slug) {
        throw new Error('item.slug param missing');
    }
    if (!item || !item.version) {
        throw new Error('item.version param missing');
    }
    const timeNow = dateTime();
    const { slug, version } = item;
    const key = `${type}-${slug}-${version}`;
    const statusDoc = await getStatusDoc(key);

    if (!statusDoc) {
        const newStatusDoc = {
            startTime: timeNow,
            retries: 0,
        };
        await setStatusDoc(key, newStatusDoc);
        return true;
    }

    const minTime = timeNow - MAX_DURATION;

    if (statusDoc.startTime < minTime) {
        statusDoc.retries += 1;
        statusDoc.startTime = timeNow;
        // eslint-disable-next-line no-console
        console.log(`running too long incrementing retries ${JSON.stringify(statusDoc)}`);
    } else {
        throw new Error(`audit still in progress ${JSON.stringify(statusDoc)}`);
    }

    if (statusDoc.retries > MAX_RETRIES) {
        throw new Error(`too many retries not proceeding ${JSON.stringify(statusDoc)}`);
    }

    // eslint-disable-next-line no-console
    console.log(`setting status doc ${JSON.stringify(statusDoc)}`);
    await setStatusDoc(key, statusDoc);
    return true;
};

module.exports = {
    canProceed,
};
