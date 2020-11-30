/**
 * External Dependencies.
 */
const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * Checks if a downloadable ZIP archive for a specific version of a
 * theme or plugin exists on WordPress.org and returns the Source URL.
 *
 * @param {string} type The project type. One of `theme` or `plugin`.
 * @param {string} slug The theme or plugin slug.
 * @param {string} version The theme or plugin version.
 * @returns {Promise<string|boolean>} Return the source URL or false.
 */
const getSourceUrl = async (type, slug, version) => {
    const url = `https://downloads.wordpress.org/${type}/${slug}.${version}.zip`;

    return fetch(url, {
        method: 'HEAD',
    })
        .then((response) => {
            if (response.ok) {
                return url;
            }
            return false;
        })
        .catch((error) => {
            // Helps to debug the server logs on GCP.
            console.error(`Invalid Source URL ${url}:`, error);
            return false;
        });
};

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
    getSourceUrl,
    getHash,
    getAuditId,
    getProjectId,
};
