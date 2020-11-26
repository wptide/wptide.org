/**
 * Internal Dependencies.
 */
const { getAuditDoc, setAuditDoc, setReportDoc } = require('../integrations/datastore');
const { dateTime } = require('../util/time');
const { getHash } = require('../util/identifiers');

exports.auditServer = async (data, context) => {
    const buffer = Buffer.from(context.message.data, 'base64');
    const response = buffer.toString();
    const message = JSON.parse(response);
    const existingAuditData = await getAuditDoc(message.id);
    const updatedAudit = { ...existingAuditData };
    const timeNow = dateTime();

    if (message.type === 'lighthouse') {
        const reportId = getHash(`${message.id}${message.type}`);
        const report = message.audit;
        console.debug(`Updating Lighthouse audit for ${message.slug} v${message.version}`);
        updatedAudit.reports.lighthouse = { id: reportId };
        await setReportDoc(reportId, report);
    } else if (message.type === 'phpcs_phpcompatibilitywp') {
        const reportId = getHash(`${message.id}${message.type}`);
        const report = message.audit.raw;
        console.debug(`Updating PHPCS audit for ${message.slug} v${message.version}`);
        updatedAudit.reports.phpcs_phpcompatibilitywp = {
            id: reportId,
            compatible_versions: message.audit.compatibleVersions,
            incompatible_versions: message.audit.incompatibleVersions,
        };
        await setReportDoc(reportId, report);
    } else {
        console.debug('Could not perform audit:', message);
    }

    updatedAudit.last_modified_datetime = timeNow;

    await setAuditDoc(message.id, updatedAudit);
};
