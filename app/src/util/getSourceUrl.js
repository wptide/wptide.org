/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Checks if a downloadable ZIP archive for a specific version of a
 * theme or plugin exists on WordPress.org and returns the Source URL.
 *
 * @param   {string}                  type    The project type. One of `theme` or `plugin`.
 * @param   {string}                  slug    The theme or plugin slug.
 * @param   {string}                  version The theme or plugin version.
 * @returns {Promise<string|boolean>}         Return the source URL or false.
 */
const getSourceUrl = async (type, slug, version) => {
    try {
        if (!type || !slug || !version) {
            return false;
        }
        const original = `https://downloads.wordpress.org/${type}/${slug}.${version}.zip`;
        const fallback = `https://downloads.wordpress.org/${type}/${slug}.zip`;
        const removeTrail = `https://downloads.wordpress.org/${type}/${slug}.${version.replace(/\.0$/, '')}.zip`;
        const addTrail = `https://downloads.wordpress.org/${type}/${slug}.${version}.0.zip`;
        const exists = async (url) => {
            const response = await fetch(url, {
                method: 'HEAD',
            });
            return response.status && (response.ok || /4\d\d/.test(response.status) === false);
        };
        if (await exists(original)) {
            return original;
        }
        if (await exists(fallback)) {
            return fallback;
        }
        if (/\d\.\d\.0/.test(version) === true && await exists(removeTrail)) {
            return removeTrail;
        }
        if (/\d\.0/.test(version) === true && await exists(addTrail)) {
            return addTrail;
        }
        throw new Error(`Invalid Source URL ${fallback}:`);
    } catch (err) {
        // Helps to debug the server logs on GCP.
        console.error(err);
        return false;
    }
};

module.exports = {
    getSourceUrl,
};
