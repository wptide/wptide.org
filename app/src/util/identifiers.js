/**
 * External Dependencies.
 */
const crypto = require('crypto');

const getHash = (input) => {
    const plainText = typeof input === 'string' ? input : JSON.stringify(input);
    return crypto.createHash('sha256').update(plainText).digest('hex');
};

const getAuditId = (params) => {
    const plainText = `${params.type}${params.slug}${params.version}`;
    return getHash(plainText);
};

const getProjectId = (params) => {
    const plainText = `${params.type}${params.slug}`;
    return getHash(plainText);
};

module.exports = {
    getHash,
    getAuditId,
    getProjectId,
};
