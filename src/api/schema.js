const YAML = require('yamljs');
const { summarise } = require('swagger-routes-express');

const schema = (req, res) => {
    const apiSpec = YAML.load( 'tideapi.yml' );
    res.json(apiSpec);
}

module.exports = schema;
