const YAML = require('yamljs');

const apiSpec = () => YAML.load('tideapi.yml');
exports.apiSpec = apiSpec;
