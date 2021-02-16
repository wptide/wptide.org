/**
 * External Dependencies.
 */
const crypto = require('crypto');

/**
 * Get a hash for a given input.
 *
 * @param   {string | object | Array} input A string or any input that can be coverted to JSON.
 *
 * @returns {string}                        Hash for given input.
 */
const getHash = (input) => {
    const plainText = typeof input === 'string' ? input : JSON.stringify(input);
    return crypto.createHash('sha256').update(plainText).digest('hex');
};

/**
 * Get an audit ID for a project at a particular version.
 *
 * @param   {object} params      Audit Project params
 * @param   {string} params.type Type of project theme or plugin.
 * @param   {string} params.slug Project slug per WordPress.org.
 *
 * @returns {string}             Audit ID, a hash of type, slug and version concatenated.
 */
const getAuditId = (params) => {
    const plainText = `${params.type}${params.slug}${params.version}`;
    return getHash(plainText);
};

/**
 * Get a project ID, independent of the version.
 *
 * @param   {object} params      Audit Project params
 * @param   {string} params.type Type of project theme or plugin.
 * @param   {string} params.slug Project slug per WordPress.org.
 *
 * @returns {string}             Project ID, a hash of type and slug concatenated.
 */
const getProjectId = (params) => {
    const plainText = `${params.type}${params.slug}`;
    return getHash(plainText);
};

module.exports = {
    getHash,
    getAuditId,
    getProjectId,
};
