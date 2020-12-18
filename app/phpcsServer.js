/**
 * Internal Dependencies.
 */
const { phpcsServer } = require('./src/run/phpcsServer');

// Exports the PHPCS Cloud Run server to the `tide` namespace.
exports.tide = async (req, res) => phpcsServer(req, res);
