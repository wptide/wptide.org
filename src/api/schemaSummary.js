const YAML = require('yamljs');
const { summarise } = require('swagger-routes-express');

const schemaSummary = (req, res) => {
    const apiSpec = YAML.load( 'tideapi.yml' );
    const apiSummary = summarise(apiSpec);
    res.json(apiSummary);
}

module.exports = schemaSummary;
