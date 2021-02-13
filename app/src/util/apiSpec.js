/**
 * External Dependencies.
 */
const YAML = require('yamljs');
const path = require('path');

/**
 * Get the api spec from the yaml file.
 *
 * @returns {object} Native object of yaml file contents.
 */
const apiSpec = () => YAML.load(path.resolve(__dirname, '../../openapi.yml'));

exports.apiSpec = apiSpec;
