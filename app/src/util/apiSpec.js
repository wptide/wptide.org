const YAML = require('yamljs');

const apiSpec = () => YAML.load('openapi.yml');
exports.apiSpec = apiSpec;
