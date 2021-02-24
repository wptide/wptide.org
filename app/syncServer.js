/**
 * Internal Dependencies.
 */
const { doSync } = require('./src/util/doSync');

// Exports the Sync Cloud Run server to the `tide` namespace.
exports.tide = async (req, res) => {
    try {
        await doSync();
        res.status(200).json({
            message: 'Completed the WordPress.org theme and plugin sync.',
            status: 200,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'The server could not respond to the request.',
            status: 500,
        });
    }
};
