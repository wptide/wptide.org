const getAudit = (req, res) => {
    res.json( { action: 'getAudit', params: req.params } );
}
module.exports = getAudit;
