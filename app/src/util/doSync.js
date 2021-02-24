/**
 * Internal Dependencies.
 */
const {
    getSyncDoc, setSyncDoc, getIngestSnapshot, setIngestDoc, deleteIngestDoc,
} = require('../integrations/firestore');
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
    const versions = limitPageOne ? 1 : ingest ? -1 : 0; /* eslint-disable-line no-nested-ternary */

    const getSyncListPage = async (page, type) => getSyncList({
        'request[browse]': 'updated',
        'request[per_page]': '100',
        'request[fields][versions]': '1',
        'request[page]': page,
    }, type, versions);

    /**
     * Create counter generator.
     *
     * @param  {number} start    The first iterator number.
     * @param  {number} end      The last iterator number, greater than or equal to start.
     * @yields          (number}
     */
    async function* counter(start, end) {
        let i = start;
        while (i <= end) {
            yield i;
            i += 1;
        }
    }

    const loopList = async (type) => {
        const initialRequest = await getSyncListPage(1, type);

        /* eslint-disable no-restricted-syntax */
        for await (const page of counter(1, initialRequest.pages)) {
            const syncList = page === 1 ? initialRequest : await getSyncListPage(page, type);
            let doBreak = false;

            if (!syncList || !syncList.pages || !syncList.queue) {
                break;
            }

            for await (const project of syncList.queue) {
                if (!project || (project.slug === state[type] && !ingest)) {
                    doBreak = true;
                    break;
                }
                if (project.version !== 'trunk') {
                    /* istanbul ignore else */
                    if (!newDelta[type]) {
                        newDelta[type] = project.slug;
                    }

                    if (ingest) {
                        await setIngestDoc(getProjectId(project), project);
                    } else {
                        await makeAuditRequest(project);
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
    for await (const type of ['plugin', 'theme']) {
        await loopList(type);
    }

    // Fallback when empty.
    if (!newDelta.theme) {
        newDelta.theme = delta.theme;
    }
    if (!newDelta.plugin) {
        newDelta.plugin = delta.plugin;
    }

    await setSyncDoc('delta', newDelta);

    // Process and remove upto 500 items from the ingest queue.
    if (!ingest) {
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
    }
};

module.exports = {
    doSync,
};
