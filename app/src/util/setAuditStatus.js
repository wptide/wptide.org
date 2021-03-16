/**
 * Helper function to set the Audit Status.
 *
 * @param   {object} statusDoc The status doc.
 * @returns {string}           status    The audit status.
 */
exports.setAuditStatus = (statusDoc) => {
    const isFailed = Object
        .keys(statusDoc.reports)
        .some((report) => statusDoc.reports[report].status === 'failed');

    const isInProgress = Object
        .keys(statusDoc.reports)
        .some((report) => statusDoc.reports[report].status === 'in-progress');

    const isComplete = Object
        .keys(statusDoc.reports)
        .every((report) => statusDoc.reports[report].status === 'complete');

    const isPending = Object
        .keys(statusDoc.reports)
        .every((report) => statusDoc.reports[report].status === 'pending');

    /* eslint-disable no-param-reassign */
    if (isFailed) {
        statusDoc.status = 'failed';
    } else if (isComplete) {
        statusDoc.status = 'complete';
    } else if (isInProgress || !isPending) {
        statusDoc.status = 'in-progress';
    }
    /* eslint-enable no-param-reassign */

    return statusDoc.status || 'pending';
};
