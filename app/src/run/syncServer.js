const fetch = require('node-fetch');

// require('../../global');
const { getSyncDoc, setSyncDoc } = require('../integrations/datastore');
// const getAudit = require('../controllers/getAudit');

const API_BASE = process.env.API_BASE || 'http://localhost:8080/api/v1/';

const MAX_QUEUE_SIZE_FOR_DELTA_FETCH = 100;

const MAX_SIMULTANEOUS_REQUESTS = 5;

const TIME_BETWEEN_REQUESTS = 500; // in millis

const TIME_TO_RECHECK = 5; // in seconds

const TIME_TO_FAIL = 300; // in seconds

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

const getSyncList = async (urlParams) => {
    const syncList = {
        primaryQueue: [],
        secondaryQueue: [],
    };

    // eslint-disable-next-line no-restricted-syntax
    for await (const type of ['theme', 'plugin']) {
        const url = apiUrl(urlParams, type);
        const response = await fetch(url);
        let json = await response.json();
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

const getState = async () => ({
    primaryQueue: await getSyncDoc(stateKeys.PRIMARY_QUEUE) || [],
    secondaryQueue: await getSyncDoc(stateKeys.PRIMARY_QUEUE) || [],
    syncState: await getSyncDoc(stateKeys.SYNC_STATE) || {},
    inProgress: await getSyncDoc(stateKeys.IN_PROGRESS) || [],
    completed: await getSyncDoc(stateKeys.COMPLETED) || {},
});

const setState = async (state) => {
    const {
        primaryQueue, secondaryQueue, syncState, inProgress, completed,
    } = state;
    await setSyncDoc(stateKeys.PRIMARY_QUEUE, primaryQueue);
    await setSyncDoc(stateKeys.SECONDARY_QUEUE, secondaryQueue);
    await setSyncDoc(stateKeys.SYNC_STATE, syncState);
    await setSyncDoc(stateKeys.IN_PROGRESS, inProgress);
    await setSyncDoc(stateKeys.COMPLETED, completed);
};

/*
const makeAuditRequest = async (auditParams) => {
    const req = {
        params: auditParams,
    };

    let auditResponse = undefined;
    const res = {
        json: ( content ) => auditResponse = content,
        status(status) {
            console.log(status);
            return this; // Make it chainable
        },
    };
    await getAudit( req, res );
    console.log(auditParams);
    console.log(auditResponse);
    const isComplete = auditResponse && auditResponse.reports
        && !Object.values(auditResponse.reports).includes(null);
    auditResponse.complete = isComplete;
    return auditResponse;
};
 */

const makeAuditRequest = async (auditParams) => {
    const auditUrl = `${API_BASE}audit/wordpress/${auditParams.type}/${auditParams.slug}/${auditParams.version}`;
    const response = await fetch(auditUrl); // @TODO error handling
    const auditResponse = await response.json();
    const isComplete = auditResponse && auditResponse.reports
        && !Object.values(auditResponse.reports).includes(null);
    auditResponse.complete = isComplete;
    return auditResponse;
};

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

const doSync = async () => {
    const state = await getState();
    initialState = JSON.parse(JSON.stringify(state));

    // 1. Fetch into primary queue if we need to
    if (!Object.keys(state.syncState).length) {
        state.syncState = { type: 'initial' };
        const initialSyncList = await getSyncList({
            'request[browse]': 'popular',
            'request[per_page]': '100',
            'request[fields][versions]': '1',
        });
        state.primaryQueue = [...state.primaryQueue, ...initialSyncList.primaryQueue];
    }

    // 2. Fetch into initial delta queue if we need to
    if (MAX_QUEUE_SIZE_FOR_DELTA_FETCH
        - state.primaryQueue.length
        - state.secondaryQueue.length
        > 0) {
        // @TODO do delta syncs
        const deltaSyncList = await getSyncList({
            'request[browse]': 'updated',
            'request[per_page]': '100',
            'request[fields][versions]': '1',
        });
        state.primaryQueue = [...state.primaryQueue, ...deltaSyncList.primaryQueue];
    }

    // 3. Check and move audits
    // eslint-disable-next-line no-restricted-syntax
    for await (const inProgressAudit of state.inProgress) {
        const minTime = Math.floor(Date.now() / 1000) - TIME_TO_RECHECK;
        const minFailTime = Math.floor(Date.now() / 1000) - TIME_TO_FAIL;
        if (inProgressAudit.startTime < minTime) {
            const response = await makeAuditRequest(inProgressAudit);
            console.log(response); // eslint-disable-line no-console
        }
        if (inProgressAudit.startTime < minFailTime) {
            console.log(inProgressAudit); // eslint-disable-line no-console
        }
    }

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

exports.syncServer = async (req, res) => {
    console.log(req.body); // eslint-disable-line no-console
    await doSync();
    res.json('complete');
};
