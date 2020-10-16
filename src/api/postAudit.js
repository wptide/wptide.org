/**
 * Initiates an audit if it hasn't already been initiated,
 * Returns audit details
 *
 * @param req
 * @param res
 */
const postAudit = (req, res) => {
    res.json( { action: 'postAudit', params: req.params } );
}
module.exports = postAudit;
