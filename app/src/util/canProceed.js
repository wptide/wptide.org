/**
 * Internal Dependencies.
 */
const { dateTime } = require('./dateTime');
const { getStatusDoc, setStatusDoc } = require('../integrations/firestore');

const MAX_DURATION = 300; // Max audit duration in seconds.
const MAX_ATTEMPTS = 3; // Max number of times we can attempt the same audit

/**
 * A gatekeeper for whether or not we can proceed with an audit
 *
 * @param   {string}  type Audit type being performed (e.g. lighthouse)
 * @param   {string}  id   The audit params.
 * @returns {boolean}      True if we can proceed or throws error if we cannot.
 */
const canProceed = async (type, id) => {
    if (!type) {
        throw new Error('The type parameter is required');
    }
    if (!id) {
        throw new Error('The id parameter is required');
    }

    const timeNow = dateTime();
    const statusDoc = await getStatusDoc(id);

    if (!statusDoc) {
        throw new Error('The status doc does not exist');
    }

    const minTime = timeNow - MAX_DURATION;

    statusDoc.modified_datetime = timeNow;

    if (statusDoc.reports[type].status === 'complete') {
        console.log(`Audit ${statusDoc.id} has already been completed.`);
        return false;
    } if (statusDoc.reports[type].status === 'failed') {
        throw new Error(`Audit ${statusDoc.id} has already failed.`);
    }

    if (statusDoc.reports[type].attempts === 0) {
        statusDoc.reports[type].attempts = 1;
        statusDoc.reports[type].status = 'in-progress';
        statusDoc.reports[type].start_datetime = timeNow;
    } else if (
        statusDoc.reports[type].start_datetime
        && statusDoc.reports[type].start_datetime < minTime
    ) {
        statusDoc.reports[type].attempts += 1;
        statusDoc.reports[type].start_datetime = timeNow;
        if (statusDoc.reports[type].attempts <= MAX_ATTEMPTS) {
            console.log(`Running too long, incrementing attempts ${JSON.stringify(statusDoc)}`);
        }
    } else {
        throw new Error(`Audit ${statusDoc.id} is still in progress.`);
    }

    if (statusDoc.reports[type].attempts > MAX_ATTEMPTS) {
        statusDoc.reports[type].status = 'failed';
        await setStatusDoc(id, statusDoc);
        console.log(`Too many attempts, not proceeding ${JSON.stringify(statusDoc)}`);
        return false;
    }

    await setStatusDoc(id, statusDoc);
    return true;
};

module.exports = {
    canProceed,
};
