const { get, set } = require('../../integrations/datastore');
const { dateTime } = require('../../util/time');

const addLighthouseAudit = (auditData, lighthouseAudit) => {
    const updatedAudit = { ...auditData };
    updatedAudit.standards.push('lighthouse');
    updatedAudit.reports = updatedAudit.reports || {};
    updatedAudit.reports.lighthouse = lighthouseAudit;
    return updatedAudit;
};

exports.auditResponse = async (data, context) => {
    const message = JSON.parse(Buffer.from(context.message.data, 'base64').toString('ascii'));
    const existingAuditData = await get(message.id);
    let updatedAudit;
    const timeNow = dateTime();
    if (message.type === 'lighthouse') {
        updatedAudit = addLighthouseAudit(existingAuditData, message.audit);
    }

    updatedAudit.last_modified_datetime = timeNow;

    await set(message.id, updatedAudit);
};
