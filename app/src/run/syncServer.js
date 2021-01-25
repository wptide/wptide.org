/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Internal Dependencies.
 */
const { getSyncDoc, setSyncDoc } = require('../integrations/datastore');
const { doAudit } = require('../controllers/getAudit');

const MAX_QUEUE_SIZE_FOR_DELTA = process.env.SYNC_SERVER_MAX_QUEUE_SIZE_FOR_DELTA || 1000;

const MAX_SIMULTANEOUS_REQUESTS = process.env.SYNC_SERVER_MAX_SIMULTANEOUS_REQUESTS || 50;

const TIME_BETWEEN_REQUESTS = process.env.SYNC_SERVER_MILLISECONDS_BETWEEN_REQUESTS || 5;

const TIME_TO_RECHECK = process.env.SYNC_SERVER_SECONDS_TO_RECHECK || 30;

const TIME_TO_FAIL = process.env.SYNC_SERVER_SECONDS_TO_FAIL || 1000;

const SYNC_STATE_INITIAL = 'initial';
const SYNC_STATE_DELTA = 'delta';

let initialState;

const stateKeys = {
    PRIMARY_QUEUE: 'PRIMARY_QUEUE',
    SECONDARY_QUEUE: 'SECONDARY_QUEUE',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    SYNC_STATE: 'SYNC_STATE',
};

const apiUrl = (params, type) => {
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

    const urlParams = { ...defaultParams, ...params };

    let url = `https://api.wordpress.org/${type}s/info/1.1/?action=query_${type}s`;

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(urlParams)) {
        url += `&${key}=${value}`;
    }

    return url;
};

/**
 * Cleans an input array of themes or plugins by filtering out unused parameters.
 *
 * @param {object} input Object containing API responses in an array in the themes or plugins keys.
 * @returns {Array} Array of API responses keeping only the properties specified.
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
 * @param {object} urlParams URL Params to fetch from.
 * @returns {object} Sync list to process.
 */
const getSyncList = async (urlParams) => {
    const syncList = {
        primaryQueue: [],
        secondaryQueue: [],
        pages: {},
    };

    // eslint-disable-next-line no-restricted-syntax
    for await (const type of ['theme', 'plugin']) {
        const url = apiUrl(urlParams, type);
        const response = await fetch(url);
        let json = await response.json();
        syncList.pages[type] = json.info.pages;
        json = cleanApiResponse(json);
        json.forEach((auditEntity) => {
            const auditParams = {
                type: auditEntity.type,
                slug: auditEntity.slug,
                version: auditEntity.version,
            };
            // syncList.primaryQueue.push(auditUrl);
            syncList.primaryQueue.push(auditParams);
            Object.keys(auditEntity.versions).forEach((version) => {
                if (version === auditEntity.version) {
                    return;
                }
                const versionAuditParams = {
                    type: auditEntity.type,
                    slug: auditEntity.slug,
                    version,
                };
                syncList.secondaryQueue.push(versionAuditParams);
            });
        });
    }
    return syncList;
};

/**
 * Get the current sync state for our sync server.
 *
 * @returns {object} Sync state.
 */
const getState = async () => {
    const state = {
        primaryQueue: await getSyncDoc(stateKeys.PRIMARY_QUEUE) || { k: [] },
        secondaryQueue: await getSyncDoc(stateKeys.SECONDARY_QUEUE) || { k: [] },
        syncState: await getSyncDoc(stateKeys.SYNC_STATE) || {},
        inProgress: await getSyncDoc(stateKeys.IN_PROGRESS) || { k: [] },
        completed: await getSyncDoc(stateKeys.COMPLETED) || { k: [] },
    };

    state.primaryQueue = state.primaryQueue.k;
    state.secondaryQueue = state.secondaryQueue.k;
    state.inProgress = state.inProgress.k;
    state.completed = state.completed.k;
    return state;
};

/**
 * Set the sync state for  our sync server.
 *
 * @param {object} state State to sync.
 */
const setState = async (state) => {
    let {
        primaryQueue, secondaryQueue, inProgress, completed,
    } = state;
    const { syncState } = state;
    primaryQueue = { k: primaryQueue };
    secondaryQueue = { k: secondaryQueue };
    inProgress = { k: inProgress };
    completed = { k: completed };

    await setSyncDoc(stateKeys.PRIMARY_QUEUE, primaryQueue);
    await setSyncDoc(stateKeys.SECONDARY_QUEUE, secondaryQueue);
    await setSyncDoc(stateKeys.SYNC_STATE, syncState);
    await setSyncDoc(stateKeys.IN_PROGRESS, inProgress);
    await setSyncDoc(stateKeys.COMPLETED, completed);
};

/**
 * Make an audit request for a given project.
 *
 * @param {object} auditParams Params for project to audit.
 * @returns {object | null} Audit response.
 */
const makeAuditRequest = async (auditParams) => {
    const auditResponse = await doAudit(auditParams);
    // Non existent audits are null
    if (auditResponse) {
        const isComplete = auditResponse && auditResponse.reports
        && !Object.values(auditResponse.reports).includes(null);
        auditResponse.complete = isComplete;
    }
    return auditResponse;
};

/**
 * Start off our pending sync requests, with a small delay between each.
 *
 * @param {Array} audits A collection of audits to perform.
 */
const makePendingRequests = async (audits) => {
    const pendingAudits = [...audits];
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    while (pendingAudits.length) {
        makeAuditRequest(pendingAudits.shift());
        if (pendingAudits.length) {
            await delay(TIME_BETWEEN_REQUESTS); // eslint-disable-line no-await-in-loop
        }
    }
};

/**
 * Perform the sync.
 */
const doSync = async () => {
    const state = await getState();
    initialState = JSON.parse(JSON.stringify(state));

    // 1. Fetch into primary queue if we need to
    if (!Object.keys(state.syncState).length) {
        state.syncState = { type: SYNC_STATE_INITIAL, page: 0 };
        const initialSyncList = await getSyncList({
            'request[browse]': 'popular',
            'request[per_page]': '100',
            'request[fields][versions]': '1',
        });
        state.primaryQueue = [...state.primaryQueue, ...initialSyncList.primaryQueue];
    }

    // 2. Fetch into delta queue if we need to
    if (MAX_QUEUE_SIZE_FOR_DELTA
        - state.primaryQueue.length
        - state.secondaryQueue.length
        > 0) {
        // If we're in initial sync mode, we fetch the next updated page.
        if (state.syncState.type === SYNC_STATE_INITIAL) {
            state.syncState.page += 1;

            // Once we've visited every page, we go into delta fetch mode.
            if (state.syncState.pages
                && state.syncState.page > state.syncState.pages.plugin
                && state.syncState.page > state.syncState.pages.theme
            ) {
                state.syncState.page = 1;
                state.syncState.type = SYNC_STATE_DELTA;
            }
        }
        const syncList = await getSyncList({
            'request[browse]': 'updated',
            'request[per_page]': '100',
            'request[fields][versions]': '1',
            'request[page]': state.syncState.page,
        });

        if (state.syncState.type === SYNC_STATE_INITIAL && !state.syncState.pages) {
            state.syncState.pages = syncList.pages;
        }

        let deltaSyncList;

        /**
         * Used to tell that we've gone through all of the pending projects.
         */
        if (!state.syncState.stopVersions || state.syncState.type === SYNC_STATE_DELTA) {
            // A stop theme is the first theme on this page of results that we use as a marker
            // to indicate that on our next pass when we've reached where we currently are.
            let stopTheme = null;
            let stopPlugin = null;
            let reachedStopTheme = false;
            let reachedStopPlugin = false;
            deltaSyncList = {
                primaryQueue: [],
            };
            syncList.primaryQueue.forEach((project) => {
                if (project.type === 'theme') {
                    if (!reachedStopTheme) {
                        deltaSyncList.primaryQueue.push(project);
                    }
                    if (stopTheme) {
                        if (state.syncState.type === SYNC_STATE_DELTA) {
                            // If we're in delta mode and we reach previous stop theme.
                            if (JSON.stringify(project)
                                === JSON.stringify(state.syncState.stopVersions.theme)) {
                                reachedStopTheme = true;
                            }
                        }
                        return;
                    }
                    stopTheme = project;
                }
                if (project.type === 'plugin') {
                    if (!reachedStopPlugin) {
                        deltaSyncList.primaryQueue.push(project);
                    }
                    if (stopPlugin) {
                        // If we're in delta mode and we reach previous theme
                        if (state.syncState.type === SYNC_STATE_DELTA) {
                            if (JSON.stringify(project)
                                === JSON.stringify(state.syncState.stopVersions.plugin)) {
                                reachedStopPlugin = true;
                            }
                        }
                        return;
                    }
                    stopPlugin = project;
                }
            });
            state.syncState.stopVersions = {
                theme: stopTheme,
                plugin: stopPlugin,
            };
        } else {
            deltaSyncList = syncList;
        }

        state.primaryQueue = [...state.primaryQueue, ...deltaSyncList.primaryQueue];
    }

    const updatedInProgress = [];
    // 3. Check and move audits
    // eslint-disable-next-line no-restricted-syntax
    for await (const inProgressAudit of state.inProgress) {
        const minTime = Math.floor(Date.now() / 1000) - TIME_TO_RECHECK;
        const minFailTime = Math.floor(Date.now() / 1000) - TIME_TO_FAIL;
        if (inProgressAudit.startTime < minTime) {
            const response = await makeAuditRequest(inProgressAudit);
            if (response) {
                if (response.complete) {
                    // Audit finished move it to completed list
                    inProgressAudit.endTime = Math.floor(Date.now() / 1000);
                    state.completed.push(inProgressAudit);
                } else {
                    updatedInProgress.push(inProgressAudit);
                }
            } else {
                // Invalid Audit
                console.log('Invalid Audit');
                console.log(inProgressAudit);
            }
        }
        if (inProgressAudit.startTime < minFailTime) {
            console.log(`Audit took too long, giving up: ${JSON.stringify(inProgressAudit)}`); // eslint-disable-line no-console
        }
    }
    state.inProgress = updatedInProgress;

    // 4. Fire off audit requests if we don't have enough of them already running
    if (state.inProgress.length < MAX_SIMULTANEOUS_REQUESTS) {
        const pendingRequests = state.primaryQueue.splice(0,
            MAX_SIMULTANEOUS_REQUESTS - state.inProgress.length);
        if (pendingRequests.length) {
            const startTime = Math.floor(Date.now() / 1000);
            await makePendingRequests(pendingRequests);
            pendingRequests.forEach((pendingRequest) => {
                state.inProgress.push({
                    ...pendingRequest,
                    startTime,
                });
            });
        }
    }

    if (JSON.stringify(state) !== JSON.stringify(initialState)) {
        await setState(state);
    }
};

/**
 * Sync server http handler.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
exports.syncServer = async (req, res) => {
    if (req.body) {
        console.log(req.body); // eslint-disable-line no-console
    }
    await doSync();
    const state = await getState();
    res.json(state);
};
