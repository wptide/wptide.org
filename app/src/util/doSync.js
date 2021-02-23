/**
 * Internal Dependencies.
 */
const { getSyncDoc, setSyncDoc } = require('../integrations/firestore');
const { getSyncList, makeAuditRequest } = require('./syncHelpers');
const { getProjectId } = require('./identifiers');

/**
 * Do the sync routine until the each delta is found.
 */
const doSync = async () => {
    const delta = await getSyncDoc('delta') || {};
    const state = {
        theme: delta.theme || '',
        plugin: delta.plugin || '',
    };
    const newDelta = {
        ingest: false,
        theme: '',
        plugin: '',
    };
    const ingest = delta.ingest || false;
    const limitPageOne = (!ingest && !delta.theme && !delta.plugin);
    const versions = limitPageOne ? 2 : ingest ? -1 : 0; /* eslint-disable-line no-nested-ternary */

    const getSyncListPage = async (page, type) => getSyncList({
        'request[browse]': 'updated',
        'request[per_page]': '100',
        'request[fields][versions]': '1',
        'request[page]': page,
    }, type, versions);

    const loopList = async (type) => {
        const initialRequest = await getSyncListPage(1, type);

        /**
         * Create generator.
         *
         * @param  {number} start    The first iterator number.
         * @param  {number} end      The last iterator number, greater than or equal to start.
         * @yields          (number}
         */
        async function* pages(start, end) {
            let i = start;
            while (i <= end) {
                yield i;
                i += 1;
            }
        }

        /* eslint-disable no-restricted-syntax */
        for await (const page of pages(1, initialRequest.pages)) {
            const syncList = page === 1 ? initialRequest : await getSyncListPage(page, type);
            let doBreak = false;

            if (!syncList || !syncList.pages || !syncList.queue) {
                break;
            }

            for await (const project of syncList.queue) {
                if (!project || project.slug === state[type]) {
                    doBreak = true;
                    break;
                }
                if (project.version !== 'trunk') {
                    /* istanbul ignore else */
                    if (!newDelta[type]) {
                        newDelta[type] = project.slug;
                    }

                    const madeAudit = await makeAuditRequest(project);

                    // This should really never happen, but we need to know if it does.
                    if (!madeAudit) {
                        const failed = await getSyncDoc('failed') || {};
                        failed[type] = failed[type] || [];
                        failed[type].push({
                            id: getProjectId(project),
                            ...project,
                        });
                        await setSyncDoc('failed', failed);
                    }
                }
            }

            /* istanbul ignore else */
            if (limitPageOne || doBreak) {
                break;
            }
        }
    };

    // Loop over each queue.
    await loopList('plugin');
    await loopList('theme');

    // Fallback when empty.
    if (!newDelta.theme) {
        newDelta.theme = delta.theme;
    }
    if (!newDelta.plugin) {
        newDelta.plugin = delta.plugin;
    }

    await setSyncDoc('delta', newDelta);
};

module.exports = {
    doSync,
};
