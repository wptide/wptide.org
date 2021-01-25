/**
 * External Dependencies.
 */
const invariant = require('invariant');

/**
 * Internal Dependencies.
 */
const { getReportDoc } = require('../integrations/datastore');

/**
 * Gets an existing Audit Report.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const getReport = async (req, res) => {
    invariant(req.params.id, 'Report id missing');
    const reportId = req.params.id.replace(/[^\w.-]+/g, '');
    const report = await getReportDoc(reportId);

    if (report) {
        res.json(report);
    } else {
        res.status(404).json({
            error: {
                code: 404,
                message: 'Report not found',
            },
        });
    }
};

module.exports = getReport;
