/**
 * External Dependencies.
 */
const YAML = require('yamljs');

/**
 * Get the api spec from the yaml file.
 *
 * @returns {object} Native object of yaml file contents.
 */
const apiSpec = () => YAML.load('openapi.yml');

exports.apiSpec = apiSpec;
