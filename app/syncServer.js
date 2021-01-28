/**
 * Internal Dependencies.
 */
const { syncServer } = require('./src/run/syncServer');

// Exports the Sync Cloud Run server to the `tide` namespace.
exports.tide = async (req, res) => syncServer(req, res);
