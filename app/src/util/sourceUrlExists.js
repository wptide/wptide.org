/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Check if the ZIP archive exists.
 *
 * @param   {string}             url The source URL.
 * @returns {Promise<*|boolean>}     True when the source URL exists.
 */
const sourceUrlExists = async (url) => {
    const response = await fetch(url, {
        method: 'HEAD',
    });
    return response.status && (response.ok || /4\d\d/.test(response.status) === false);
};

module.exports = {
    sourceUrlExists,
};
