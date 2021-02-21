/**
 * Internal Dependencies.
 */
const { getAuditData, addAuditReports } = require('../util/auditHelpers');

/**
 * Gets an existing Audit.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const getAudit = async (req, res) => {
    res.set('Cache-control', 'no-store');

    if (!req.params.type) {
        req.validation.errors.push({
            message: 'The audit project type is required.',
            parameter: 'type',
        });
    } else if (!['theme', 'plugin'].includes(req.params.type)) {
        req.validation.errors.push({
            message: 'The audit project type must be theme or plugin.',
            parameter: 'type',
        });
    }

    if (!req.params.slug) {
        req.validation.errors.push({
            message: 'The audit project slug is required.',
            parameter: 'slug',
        });
    } else if (!req.params.slug.match(/^[a-z0-9-]+$/)) {
        req.validation.errors.push({
            message: 'The audit project slug must be an alpha-numeric string, dashes are allowed.',
            parameter: 'slug',
        });
    }

    if (!req.params.version) {
        req.validation.errors.push({
            message: 'The audit project version is required.',
            parameter: 'version',
        });
    } else if (!req.params.version.match(/^(?!^\.)(?!.*[.]$)[0-9.]+$/)) {
        req.validation.errors.push({
            message: 'The audit project version must contain only numbers and periods, plus begins and ends with a number.',
            parameter: 'version',
        });
    }

    if (req.validation.errors.length) {
        res.status(400).json(req.validation);
    } else {
        try {
            let existingAuditData = await getAuditData(req.params);

            if (existingAuditData && req.query && req.query.reports) {
                const { reports } = req.query;
                // Support both array and csv format.
                const reportsSanitized = Array.isArray(reports) ? reports : reports.split(',');
                existingAuditData = await addAuditReports(existingAuditData, reportsSanitized);
            }

            if (existingAuditData) {
                const addCache = Object
                    .keys(existingAuditData.reports)
                    .every((report) => !!existingAuditData.reports[report]);

                if (addCache) {
                    res.set('Cache-control', 'public, max-age=86400');
                }

                res.status(200).json(existingAuditData);
            } else {
                res.status(404).json({
                    message: 'The audit requested does not exist.',
                    status: 404,
                });
            }
        } catch (err) {
            res.status(500).json({
                message: 'The server could not respond to the request.',
                status: 500,
            });
        }
    }
};

module.exports = getAudit;
