/**
 * Internal Dependencies.
 */
const { getAuditDoc, setAuditDoc, setReportDoc } = require('../integrations/datastore');
const { dateTime } = require('../util/time');
const { getHash } = require('../util/identifiers');
const { canProceed } = require('../util/canProceed');

/**
 * Audit Server helper to handle Pub/Sub HTTP requests.
 *
 * @param {object} req The HTTP Request.
 * @param {object} res The HTTP Response.
 * @param {Function} reporter The Audit Reporter.
 * @param {string} type The audit type.
 * @param {string} name The audit message name.
 * @returns {res} The modified HTTP response.
 */
exports.auditServer = async (req, res, reporter, type, name) => {
    const now = Date.now();
    const sendError = (msg) => {
        console.error(msg);
        res.status(400).send();
    };

    try {
        if (!req.body) {
            throw new Error('No Pub/Sub message received');
        }

        if (!req.body.message) {
            throw new Error('Invalid Pub/Sub message format');
        }

        const pubSubMessage = req.body.message;
        const message = pubSubMessage.data
            ? JSON.parse(Buffer.from(pubSubMessage.data, 'base64').toString('ascii').trim())
            : null;

        if (Object.prototype.toString.call(message) !== '[object Object]') {
            throw new Error('Invalid Pub/Sub message format');
        }

        if (!!message.id && !!message.slug && !!message.version) {
            const reportId = getHash(`${message.id}-${type}`);
            let audit = await getAuditDoc(message.id);

            // Don't update a missing Audit.
            if (Object.prototype.toString.call(audit) !== '[object Object]') {
                throw new Error(`Audit for ${message.slug} v${message.version} is missing`);
            }

            // Don't update an existing Audit.
            if (Object.prototype.toString.call(audit.reports[type]) === '[object Object]' && Object.prototype.hasOwnProperty.call(audit.reports[type], 'id')) {
                console.log(`Skipping: Audit for ${message.slug} v${message.version} already exists`);
                return res.status(200).send();
            }

            if (!await canProceed(type, { slug: message.slug, version: message.version })) {
                throw new Error(`${name} audit for ${message.slug} v${message.version} is currently locked for until expiry`);
            }

            console.log(`${name} audit for ${message.slug} v${message.version} started`);

            // Get the Audit Report.
            const reportData = await reporter(message); // @todo handle error, remove lock.

            // Get a fresh copy of the Audit.
            audit = await getAuditDoc(message.id);

            // Don't update a missing Audit (failure to read Datastore).
            if (Object.prototype.toString.call(audit) !== '[object Object]') {
                throw new Error(`Audit for ${message.slug} v${message.version} is missing`);
            }

            // Don't update an existing Audit.
            if (Object.prototype.toString.call(audit.reports[type]) === '[object Object]' && Object.prototype.hasOwnProperty.call(audit.reports[type], 'id')) {
                console.log(`Warning: Audit for ${message.slug} v${message.version} was already completed`);
                return res.status(200).send();
            }

            const createdDate = dateTime();
            const processTime = Date.now() - now;
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
                ...reportData,
            };

            // Save the Audit.
            audit.last_modified_datetime = createdDate;
            audit.reports[type] = {
                id: reportId,
            };
            await setAuditDoc(message.id, audit);

            // Save the Report.
            await setReportDoc(reportId, report); // @todo handle error.

            console.log(`${name} audit for ${message.slug} v${message.version} completed successfully in ${processTime}ms`);
            return res.status(200).send();
        }

        // Missing message values.
        throw new Error(`Could not perform ${name} audit: ${message}`);

    // Catch and log all errors.
    } catch (error) {
        return sendError(error);
    }
};
