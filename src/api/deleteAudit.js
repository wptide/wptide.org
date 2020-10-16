const deleteAudit = (req, res) => {
    res.json( { action: 'deleteAudit', params: req.params } );
}
module.exports = deleteAudit;
