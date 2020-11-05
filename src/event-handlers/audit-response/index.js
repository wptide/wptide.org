const {
    getAuditDoc, setAuditDoc, setReport,
} = require('../../integrations/datastore');
const { dateTime } = require('../../util/time');
const { getHash } = require('../../util/identifiers');

/*
const addLighthouseAudit = (auditData, lighthouseAudit) => {
    const updatedAudit = { ...auditData };
    updatedAudit.standards.push('lighthouse');
    updatedAudit.reports = updatedAudit.reports || {};
    updatedAudit.reports.lighthouse = lighthouseAudit;
    return updatedAudit;
};
 */

exports.auditResponse = async (data, context) => {
    const buffer = Buffer.from(context.message.data, 'base64');
    const response = buffer.toString();
    const message = JSON.parse(response);
    const existingAuditData = await getAuditDoc(message.id);
    const updatedAudit = { ...existingAuditData };
    const timeNow = dateTime();
    if (message.type === 'lighthouse') {
        // updatedAudit = addLighthouseAudit(existingAuditData, message.audit);
        const reportId = getHash(`${message.id}${message.type}`);
        const report = message.audit;
        updatedAudit.repLighthouse = reportId; // Change this
        updatedAudit.lighthouse = report; // Change this
        await setReport(reportId, report);
    }

    updatedAudit.last_modified_datetime = timeNow;

    await setAuditDoc(message.id, updatedAudit);
};
