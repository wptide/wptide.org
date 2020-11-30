const invariant = require('invariant');
const { getReportDoc } = require('../integrations/datastore');

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
