/**
 * Internal Dependencies.
 */
const { getAuditDoc, setAuditDoc, setReportDoc } = require('../integrations/datastore');
const { dateTime } = require('../util/time');
const { getHash } = require('../util/identifiers');

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
                return res.status(200).send();
            }

            // Audits are locked for 60 seconds.
            if (Number.isInteger(audit.reports[type]) && dateTime() - audit.reports[type] < 60) {
                throw new Error(`${name} audit for ${message.slug} v${message.version} is already running`);
            }

            // Save the Audit Report lock.
            audit.reports[type] = dateTime();
            await setAuditDoc(message.id, audit); // @todo handle error.

            console.log(`${name} audit for ${message.slug} v${message.version} started`);

            // Get the Audit Report.
            const report = await reporter(message); // @todo handle error.

            // Get a fresh copy of the Audit.
            audit = await getAuditDoc(message.id);

            // Don't update a missing Audit (failure to read Datastore).
            if (Object.prototype.toString.call(audit) !== '[object Object]') {
                throw new Error(`Audit for ${message.slug} v${message.version} is missing`);
            }

            // Don't update an unlocked Audit.
            if (Object.prototype.toString.call(audit.reports[type]) === '[object Null]') {
                throw new Error(`${name} audit for ${message.slug} v${message.version} is not locked`);
            }

            // Save the Audit.
            audit.last_modified_datetime = dateTime();
            audit.reports[type] = {
                id: reportId,
            };
            if (report.compatibleVersions) {
                audit.reports[type].compatible_versions = report.compatibleVersions;
            }
            if (report.incompatibleVersions) {
                audit.reports[type].incompatible_versions = report.incompatibleVersions;
            }
            await setAuditDoc(message.id, audit);

            // Save the Report.
            await setReportDoc(reportId, report.raw || report); // @todo handle error.

            console.log(`${name} audit for ${message.slug} v${message.version} completed successfully in ${Date.now() - now}ms`);
            return res.status(200).send();
        }

        // Missing message values.
        return sendError(`Could not perform ${name} audit: ${message}`);

    // Catch and log all errors.
    } catch (error) {
        return sendError(error);
    }
};
