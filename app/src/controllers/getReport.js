/**
 * Internal Dependencies.
 */
const { getReportDoc } = require('../integrations/firestore');
const { getReportFile } = require('../util/getReportFile');

/**
 * Gets an existing Audit Report.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const getReport = async (req, res) => {
    res.set('Cache-control', 'no-store');

    if (!req.params.id) {
        req.validation.errors.push({
            message: 'A report identifier is required.',
            parameter: 'id',
        });
    } else if (Object.prototype.toString.call(req.params.id) !== '[object String]' || !req.params.id.match(/^[a-z0-9]+$/i)) {
        req.validation.errors.push({
            message: 'A report identifier must be an alpha-numeric string.',
            parameter: 'id',
        });
    }

    if (req.validation.errors.length) {
        res.status(400).json(req.validation);
    } else {
        try {
            const reportId = req.params.id.replace(/[^\w.-]+/g, '');
            const reportDoc = await getReportDoc(reportId);
            const reportType = (reportDoc && reportDoc.type) || '';
            const reportData = await getReportFile(reportType, reportId);

            if (reportDoc && reportData) {
                const report = {
                    ...reportDoc,
                    ...reportData,
                };

                res.set('Cache-control', 'public, max-age=86400');
                res.status(200).json(report);
            } else {
                res.status(404).json({
                    message: 'The provided report identifier does not exist.',
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

module.exports = getReport;
