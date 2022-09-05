/* eslint-disable no-restricted-syntax */
/**
 * Internal Dependencies.
 */
const {
    getSyncDoc, setSyncDoc, getIngestSnapshot, setIngestDoc, deleteIngestDoc,
} = require('../integrations/firestore');
const { getSyncList, makeAuditRequest } = require('./syncHelpers');
const { getProjectId } = require('./identifiers');

/**
 * Helper function to make dynamic Theme & Plugin API requests.
 *
 * @param   {number}  page     The page.
 * @param   {string}  type     The project type: theme or plugin.
 * @param   {number}  versions The number of versions to retrieve beyond the most recent.
 * @returns {Promise}          The project queue.
 */
const getSyncListPage = async (page, type, versions) => getSyncList({
    'request[browse]': 'updated',
    'request[per_page]': '100',
    'request[fields][versions]': '1',
    'request[page]': page,
}, type, versions);

/**
 * Create counter generator.
 *
 * @param {number} start The first iterator number.
 * @param {number} end   The last iterator number, greater than or equal to start.
 * @yields {number}
 */
async function* counter(start, end) {
    let i = start;
    while (i <= end) {
        yield i;
        i += 1;
    }
}

/**
 * Handle the sync routine until the each delta is found.
 *
 * @param {object} delta The current delta document.
 */
const syncRoutine = async (delta) => {
    const newDelta = {
        ...delta,
        theme: '',
        plugin: '',
    };

    /**
     * Loops through the pages and projects.
     *
     * @param {string} type The project type: plugin or theme.
     */
    const loopList = async (type) => {
        const limitPageOne = !delta[type];
        const versions = limitPageOne ? 1 : 0;
        const initialRequest = await getSyncListPage(1, type, versions);

        for await (const page of counter(1, initialRequest.pages)) {
            const syncList = page === 1 ? initialRequest : await getSyncListPage(page, type, versions); /* eslint-disable-line max-len */
            let doBreak = false;

            /* istanbul ignore else */
            if (!syncList || !syncList.pages || !syncList.queue || !syncList.queue.length) {
                break;
            }

            for await (const project of syncList.queue) {
                if (!project || project.slug === delta[type]) {
                    doBreak = true;
                    break;
                }

                /* istanbul ignore else */
                if (
                    project.version !== 'trunk'
                    && await makeAuditRequest(project)
                    && !newDelta[type]
                ) {
                    newDelta[type] = project.slug;
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

    // Process and remove upto 500 items from the ingest queue.
    const queue = [];
    const snapshot = await getIngestSnapshot(500);
    if (snapshot && !snapshot.empty) {
        snapshot.forEach((doc) => {
            queue.push({
                id: doc.id,
                project: doc.data(),
            });
        });
        for await (const item of queue) {
            /* istanbul ignore else */
            if (await makeAuditRequest(item.project)) {
                await deleteIngestDoc(item.id);
            }
        }
    }
};

/**
 * Handle the ingest routine.
 *
 * @param {object} delta The current delta document.
 */
const ingestRoutine = async (delta) => {
    const newDelta = {
        ...delta,
    };

    // Used to signal a completed ingest routine.
    const ingest = {
        plugin: true,
        theme: true,
    };

    /**
     * Loops through the pages and projects.
     *
     * @param {string} type The project type: plugin or theme.
     */
    const loopList = async (type) => {
        const initialRequest = await getSyncListPage(newDelta.page[type], type, 1);

        for await (const page of counter(newDelta.page[type], initialRequest.pages)) {
            const syncList = page === 1 ? initialRequest : await getSyncListPage(page, type, 1);

            // Stop ingesting after this iteration.
            if (syncList.pages && page === syncList.pages) {
                ingest[type] = false;
            }

            /* istanbul ignore else */
            if (!syncList || !syncList.pages || !syncList.queue || !syncList.queue.length) {
                break;
            }

            for await (const project of syncList.queue) {
                /* istanbul ignore else */
                if (project.version !== 'trunk') {
                    await setIngestDoc(getProjectId(project), project);

                    if (!newDelta[type]) {
                        newDelta[type] = project.slug;
                        await setSyncDoc('delta', newDelta);
                    }
                }
            }

            // Iterate page number.
            if (page < syncList.pages) {
                newDelta.page[type] += 1;
                await setSyncDoc('delta', newDelta);
            }
        }
    };

    // Loop over each queue.
    await loopList('plugin');
    await loopList('theme');

    // Reset the ingest routine.
    /* istanbul ignore else */
    if (!ingest.plugin && !ingest.theme) {
        newDelta.ingest = false;
        newDelta.page.plugin = 1;
        newDelta.page.theme = 1;
        await setSyncDoc('delta', newDelta);
    }
};

/**
 * Do the sync & ingest routines.
 */
const doSync = async () => {
    const delta = await getSyncDoc('delta') || {};
    const deltaValidated = {
        ingest: delta.ingest || false,
        page: delta.page || {
            plugin: 1,
            theme: 1,
        },
        plugin: delta.plugin || '',
        theme: delta.theme || '',
    };
    if (deltaValidated.ingest) {
        await ingestRoutine(deltaValidated);
    } else {
        await syncRoutine(deltaValidated);
    }
};

module.exports = {
    doSync,
};
