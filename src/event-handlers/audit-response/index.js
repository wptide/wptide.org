require('../../global');
const {
    getAuditDoc, setAuditDoc, setReportDoc,
} = require('../../integrations/datastore');
const { dateTime } = require('../../util/time');
const { getHash } = require('../../util/identifiers');

exports.auditResponse = async (data, context) => {
    const buffer = Buffer.from(context.message.data, 'base64');
    const response = buffer.toString();
    const message = JSON.parse(response);
    const existingAuditData = await getAuditDoc(message.id);
    const updatedAudit = { ...existingAuditData };
    const timeNow = dateTime();

    if (message.type === 'lighthouse') {
        const reportId = getHash(`${message.id}${message.type}`);
        const report = message.audit;
        updatedAudit.reports.lighthouse = { report_id: reportId };
        await setReportDoc(reportId, report);
    } else if (message.type === 'phpcs') {
        const reportId = getHash(`${message.id}${message.type}`);
        const report = message.audit.raw;
        updatedAudit.reports.phpcs_phpcompatibilitywp = {
            report_id: reportId,
            compatible_versions: message.audit.compatibleVersions,
            incompatible_versions: message.audit.incompatibleVersions,
        };

        await setReportDoc(reportId, report);
    }

    updatedAudit.last_modified_datetime = timeNow;

    await setAuditDoc(message.id, updatedAudit);
};
