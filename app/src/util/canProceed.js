/**
 * Internal Dependencies.
 */
const { dateTime } = require('./dateTime');
const { getStatusDoc, setStatusDoc } = require('../integrations/firestore');
const { setAuditStatus } = require('./setAuditStatus');

const MAX_DURATION = 300; // Max audit duration in seconds.
const MAX_ATTEMPTS = 3; // Max number of times we can attempt the same audit

/**
 * A gatekeeper for whether or not we can proceed with an audit
 *
 * @param   {string}  type Audit type being performed (e.g. lighthouse)
 * @param   {string}  id   The audit ID.
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
    const report = statusDoc.reports[type];

    statusDoc.modified_datetime = timeNow;

    if (report.status === 'complete') {
        console.log(`Audit ${statusDoc.id} has already been completed.`);
        return false;
    } if (report.status === 'failed') {
        throw new Error(`Audit ${statusDoc.id} has already failed.`);
    }

    if (report.attempts >= MAX_ATTEMPTS) {
        statusDoc.status = 'failed';
        statusDoc.reports[type].status = 'failed';
        await setStatusDoc(id, statusDoc);
        console.log(`Too many attempts, not proceeding ${JSON.stringify(statusDoc)}`);
        return false;
    }

    if (report.attempts === 0 || report.start_datetime === null) {
        statusDoc.reports[type].attempts = 1;
        statusDoc.reports[type].status = 'in-progress';
        statusDoc.reports[type].start_datetime = timeNow;
    } else if (report.start_datetime < report.attempts * minTime) {
        statusDoc.reports[type].attempts += 1;
        console.log(`Running too long, incrementing attempts ${JSON.stringify(statusDoc)}`);
    } else {
        throw new Error(`Audit ${statusDoc.id} is still in progress.`);
    }

    statusDoc.status = setAuditStatus(statusDoc);
    return setStatusDoc(id, statusDoc);
};

module.exports = {
    canProceed,
};
