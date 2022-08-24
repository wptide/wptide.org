/**
 * Internal Dependencies.
 */
const { bucketExists, saveFile } = require('../services/storage');
const { writeFile } = require('../util/dataFile');
const { dateTime } = require('../util/dateTime');
const {
    getAuditDoc, getStatusDoc, setAuditDoc, setReportDoc, setStatusDoc,
} = require('../integrations/firestore');
const { getHash } = require('../util/identifiers');
const { canProceed } = require('../util/canProceed');
const { sendError } = require('../util/sendError');
const { setAuditStatus } = require('../util/setAuditStatus');
const { getBucketName } = require('../util/getBucketName');

/**
 * Delay processing the next line of code with a promise.
 *
 * @param   {number}        min The minimum time to delay.
 * @param   {number}        max The maximum time to delay.
 * @returns {Promise<void>}     The delayed promise.
 */
const delay = async (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

/**
 * Helper to set the status.
 *
 * @param   {string}          id       The status doc ID.
 * @param   {string}          type     The audit type.
 * @param   {string}          status   The status to set.
 * @param   {number}          datetime The value of a call to dateTime().
 * @returns {Promise<string>}          The current status.
 */
const setStatus = async (id, type, status, datetime) => {
    const data = await getStatusDoc(id);
    data.modified_datetime = datetime;
    data.reports[type].end_datetime = datetime;
    data.reports[type].status = status;
    data.status = setAuditStatus(data);
    await setStatusDoc(id, data);
    return data.status;
};

/**
 * Audit Server helper to handle Pub/Sub HTTP requests.
 *
 * @param   {object}   req      The HTTP Request.
 * @param   {object}   res      The HTTP Response.
 * @param   {Function} reporter The Audit Reporter.
 * @param   {string}   type     The audit type.
 * @param   {string}   name     The audit message name.
 * @returns {res}               The modified HTTP response.
 */
exports.auditServer = async (req, res, reporter, type, name) => {
    try {
        /**
         * We need to add some randomness because there's a chance of a race condition
         * on the resource with multiple audit servers attempting to do simultaneous
         * synchronous writes.
         */
        await delay(1, 1000);

        const bucketName = getBucketName();
        const now = Date.now();
        const validation = {
            message: 'Request has validation errors',
            status: 400,
            errors: [],
        };

        if (!req.body) {
            validation.errors.push({
                message: 'The REQUEST body is required.',
                parameter: 'body',
            });
        } else if (!req.body.message) {
            validation.errors.push({
                message: 'The PubSub message is required.',
                parameter: 'message',
            });
        } else if (Object.prototype.toString.call(req.body.message) !== '[object Object]' || !req.body.message.data) {
            validation.errors.push({
                message: 'Invalid Pub/Sub message format.',
                parameter: 'message',
            });
        }

        if (validation.errors.length) {
            return sendError(res, validation);
        }

        const pubSubMessage = req.body.message;
        /* istanbul ignore next */
        const message = pubSubMessage.data
            ? JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString('utf-8').trim())
            : {};

        if (!message.id) {
            validation.errors.push({
                message: 'The Pub/Sub message id is required.',
                parameter: 'message.id',
            });
        }

        if (!message.type) {
            validation.errors.push({
                message: 'The Pub/Sub message type is required.',
                parameter: 'message.type',
            });
        }

        if (!message.slug) {
            validation.errors.push({
                message: 'The Pub/Sub message slug is required.',
                parameter: 'message.slug',
            });
        }

        if (!message.version) {
            validation.errors.push({
                message: 'The Pub/Sub message version is required.',
                parameter: 'message.version',
            });
        }

        if (validation.errors.length) {
            return sendError(res, validation);
        }

        const reportId = getHash(`${message.id}-${type}`);
        let audit = await getAuditDoc(message.id);

        // Don't update a missing Audit.
        if (Object.prototype.toString.call(audit) !== '[object Object]') {
            throw new Error(`Audit for ${message.slug} v${message.version} is missing.`);
        }

        // Don't update an existing Audit.
        if (Object.prototype.toString.call(audit.reports[type]) === '[object Object]' && Object.prototype.hasOwnProperty.call(audit.reports[type], 'id')) {
            console.log(`Skipping: Audit for ${message.slug} v${message.version} already exists.`);
            return res.status(200).send();
        }

        // We can't proceed with this audit, acknowledge the message so it's no longer pending.
        if (!await canProceed(type, message.id)) {
            return res.status(200).send();
        }

        console.log(`${name} audit for ${message.slug} v${message.version} started.`);

        // Get the Audit Report.
        const reportData = await reporter(message);

        // Get a fresh copy of the Audit.
        audit = await getAuditDoc(message.id);

        // Don't update a missing Audit (failure to read Firestore).
        if (Object.prototype.toString.call(audit) !== '[object Object]') {
            throw new Error(`Audit for ${message.slug} v${message.version} is missing.`);
        }

        // Don't update an existing Audit.
        if (Object.prototype.toString.call(audit.reports[type]) === '[object Object]' && Object.prototype.hasOwnProperty.call(audit.reports[type], 'id')) {
            console.log(`Warning: Audit for ${message.slug} v${message.version} was already completed.`);
            return res.status(200).send();
        }

        const createdDate = dateTime();
        const processTime = Date.now() - now;
        const hasPhpcs = (
            type === 'phpcs_phpcompatibilitywp'
            && reportData
            && reportData.report
            && (
                reportData.report.compatible.length !== 0
                || reportData.report.incompatible.length !== 0
            )
        );
        const hasLighthouse = (
            type === 'lighthouse'
            && reportData
            && reportData.report
        );

        if (!(hasPhpcs || hasLighthouse)) {
            console.log(`${name} audit for ${message.slug} v${message.version} failed in ${processTime}ms.`);
            audit.status = await setStatus(message.id, type, 'failed', createdDate);
            audit.modified_datetime = createdDate;
            await setAuditDoc(message.id, audit);
            return res.status(500).send();
        }

        // Generate the name of the file to store.
        const fileName = `${type}/${reportId}.json`;

        // Write data to the local filesystem.
        await writeFile(fileName, reportData);

        // Write data to GCS.
        if (bucketName && await bucketExists(bucketName)) {
            await saveFile(bucketName, fileName, reportData);
        }

        const report = {
            id: reportId,
            type,
            audit: {
                id: message.id,
                type: message.type,
                version: message.version,
                slug: message.slug,
            },
            created_datetime: createdDate,
            milliseconds: processTime,
        };

        // Save the Audit.
        audit.status = await setStatus(message.id, type, 'complete', createdDate);
        audit.modified_datetime = createdDate;
        audit.reports[type] = {
            id: reportId,
        };
        await setAuditDoc(message.id, audit);

        // Save the Report.
        await setReportDoc(reportId, report);

        console.log(`${name} audit for ${message.slug} v${message.version} completed successfully in ${processTime}ms.`);
        return res.status(200).send();

    // Catch and log all errors.
    } catch (error) {
        /* istanbul ignore next */
        return sendError(res, error.message || error, 500);
    }
};
