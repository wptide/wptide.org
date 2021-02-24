/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Internal Dependencies.
 */
const { getAuditData } = require('./auditHelpers');
const { getSyncDoc, setSyncDoc } = require('../integrations/firestore');
const { getProjectId } = require('./identifiers');

/**
 * Generates a query URL from the provided parameters for the WordPress Themes/Plugins API.
 *
 * @param   {object} urlParams URL Params to fetch from.
 * @param   {string} type      The project type. One of theme or plugin.
 * @returns {string}           The API URL.
 */
const apiUrl = (urlParams, type) => {
    const defaultParams = {
        'request[fields][name]': '0',
        'request[fields][versions]': '0',
        'request[fields][sections]': '0',
        'request[fields][description]': '0',
        'request[fields][screenshot_url]': '0',
        'request[fields][compatibility]': '0',
        'request[fields][rating]': '0',
        'request[fields][ratings]': '0',
        'request[fields][num_ratings]': '0',
        'request[fields][support_threads]': '0',
        'request[fields][support_threads_resolved]': '0',
        'request[fields][last_updated]': '0',
        'request[fields][added]': '0',
        'request[fields][homepage]': '0',
        'request[fields][short_description]': '0',
        'request[fields][download_link]': '0',
        'request[fields][tags]': '0',
        'request[browse]': 'updated',
    };

    const params = { ...defaultParams, ...urlParams };

    let url = `https://api.wordpress.org/${type}s/info/1.1/?action=query_${type}s`;

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(params)) {
        url += `&${key}=${value}`;
    }

    return url;
};

/**
 * Cleans an input array of themes or plugins by filtering out unused parameters.
 *
 * @param   {object} input Object containing API responses in an array in the themes
 *                         or plugins keys.
 * @returns {Array}        Array of API responses keeping only the properties specified.
 */
const cleanApiResponse = (input) => {
    const keepKeys = [
    // Keep only these properties
        'slug',
        'version',
        'versions',
    ];

    const collection = input.themes ? input.themes : input.plugins;
    const type = input.themes ? 'theme' : 'plugin';

    const output = [];

    collection.forEach((entity) => {
        const cleanEntity = { type };
        keepKeys.forEach((key) => {
            /* istanbul ignore else */
            if (entity[key]) {
                cleanEntity[key] = entity[key];
            }
        });
        output.push(cleanEntity);
    });

    return output;
};

/**
 * Gets the list of projects to sync for a given set of url parameters.
 *
 * @param   {object} urlParams URL Params to fetch from.
 * @param   {string} type      The project type. One of theme or plugin.
 * @param   {number} versions  The number of previous versions to include.
 * @returns {object}           Sync list to process.
 */
const getSyncList = async (urlParams, type, versions) => {
    const syncList = {
        pages: 0,
        queue: [],
    };

    const url = apiUrl(urlParams, type);
    const response = await fetch(url);

    let json = await response.json();

    syncList.pages = json.info.pages;
    json = cleanApiResponse(json);
    json.forEach((auditEntity) => {
        const auditParams = {
            type,
            slug: auditEntity.slug,
            version: auditEntity.version,
        };

        const versionList = Object.keys(auditEntity.versions).reverse();

        if (versions === -1 && versionList.length) {
            versions = versionList.length; /* eslint-disable-line no-param-reassign */
        }

        syncList.queue.push(auditParams);
        if (versions > 0) {
            let counter = 0;
            versionList.forEach((version) => {
                if (version === auditEntity.version || versions <= counter) {
                    return;
                }
                const versionAuditParams = {
                    type,
                    slug: auditEntity.slug,
                    version,
                };
                syncList.queue.push(versionAuditParams);
                counter += 1;
            });
        }
    });

    return syncList;
};

/**
 * Make an audit request for a given project.
 *
 * @param   {object}  auditParams Params for project to audit.
 * @returns {boolean}             Audit response.
 */
const makeAuditRequest = async (auditParams) => {
    const auditResponse = await getAuditData(auditParams);

    if (!auditResponse) {
        const failed = await getSyncDoc('failed') || {};
        failed[auditParams.type] = failed[auditParams.type] || [];
        failed[auditParams.type].push({
            id: getProjectId(auditParams),
            ...auditParams,
        });
        await setSyncDoc('failed', failed);
    }

    return !!auditResponse;
};

module.exports = {
    apiUrl,
    cleanApiResponse,
    getSyncList,
    makeAuditRequest,
};
