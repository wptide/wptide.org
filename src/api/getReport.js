const invariant = require('invariant');
const { getReportDoc } = require('../integrations/datastore');

const getReport = async (req, res) => {
    invariant(req.params.report_id, 'Report id missing');
    const reportId = req.params.report_id.replace(/[^\w.-]+/g, '');
    const report = await getReportDoc(reportId);
    if (report) {
        res.json({
            report_id: reportId,
            report,
        });
    } else {
        res.json('not found');
    }
};

module.exports = getReport;
