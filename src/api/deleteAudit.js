/**
 * Deletes an existing Audit
 *
 * @param req
 * @param res
 */
const deleteAudit = (req, res) => {
    res.json( { action: 'deleteAudit', params: req.params } );
}
exports.deleteAudit = deleteAudit;
