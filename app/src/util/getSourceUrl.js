/**
 * Internal Dependencies.
 */
const { sourceUrlExists } = require('./sourceUrlExists');

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
        if (await sourceUrlExists(original)) {
            return original;
        }
        if (await sourceUrlExists(fallback)) {
            return fallback;
        }
        if (/\d\.0/.test(version) === true && await sourceUrlExists(addTrail)) {
            return addTrail;
        }
        if (/\d\.\d\.0/.test(version) === true && await sourceUrlExists(removeTrail)) {
            return removeTrail;
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
