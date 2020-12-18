/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Used to determine if we should do a lighthouse audit,
 * based on whether we have a theme, and the latest version of it is being audited.
 *
 * @param {object} audit The audit params.
 * @returns {boolean} True if we can should do a lighthouse audit.
 */
const shouldLighthouseAudit = async (audit) => {
    const url = `https://api.wordpress.org/themes/info/1.1/?action=theme_information&request[slug]=${audit.slug}`;
    const response = await fetch(url, {
        method: 'GET',
    });
    const themeInfo = await response.json();
    // Checks whether the version supplied is equivalent to the version from themes api.
    return themeInfo.version === audit.version && themeInfo.slug === audit.slug;
};

module.exports = {
    shouldLighthouseAudit,
};
