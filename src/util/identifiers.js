const crypto = require('crypto');

const getAuditId = (params) => {
    const plainText = `${params.project_type}${params.project_slug}${params.version}`;
    return crypto.createHash('sha256').update(plainText).digest('hex');
};

const getProjectId = (params) => {
    const plainText = `${params.project_type}${params.project_slug}`;
    return crypto.createHash('sha256').update(plainText).digest('hex');
};

module.exports = {
    getAuditId,
    getProjectId,
};
