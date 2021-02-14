/**
 * External Dependencies.
 */
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');

/**
 * Internal Dependencies.
 */
const api = path.resolve(__dirname, '../../spec/openapi.yml');

/**
 * Get the api spec from the yaml file.
 *
 * @returns {object} Native object of yaml file contents.
 */
const apiSpec = () => yaml.load(fs.readFileSync(api, 'utf8'));

exports.apiSpec = apiSpec;
