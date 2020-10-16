const YAML = require('yamljs');
const apiSpec = () => {
    return YAML.load( 'tideapi.yml' );
}
exports.apiSpec = apiSpec;
