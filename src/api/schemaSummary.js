const { summarise } = require('swagger-routes-express');
const { apiSpec } = require('../util/apiSpec');

const schemaSummary = (req, res) => {
    const apiSummary = summarise(apiSpec());
    res.json(apiSummary);
};

module.exports = schemaSummary;
