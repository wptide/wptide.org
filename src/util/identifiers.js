const crypto = require('crypto');

const getHash = (input) => {
    const plainText = typeof input === 'string' ? input : JSON.stringify(input);
    return crypto.createHash('sha256').update(plainText).digest('hex');
};

const getAuditId = (params) => {
    const plainText = `${params.project_type}${params.project_slug}${params.version}`;
    return getHash(plainText);
};

const getProjectId = (params) => {
    const plainText = `${params.project_type}${params.project_slug}`;
    return getHash(plainText);
};

module.exports = {
    getHash,
    getAuditId,
    getProjectId,
};
