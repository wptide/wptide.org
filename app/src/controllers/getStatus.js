/**
 * Internal Dependencies.
 */
const { getStatusDoc } = require('../integrations/firestore');

/**
 * Gets an existing Audit Status.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const getStatus = async (req, res) => {
    res.set('Cache-control', 'no-store');

    if (!req.params.id) {
        req.validation.errors.push({
            message: 'A status identifier is required.',
            parameter: 'id',
        });
    } else if (Object.prototype.toString.call(req.params.id) !== '[object String]' || !req.params.id.match(/^[a-z0-9]+$/i)) {
        req.validation.errors.push({
            message: 'A status identifier must be an alpha-numeric string.',
            parameter: 'id',
        });
    }

    if (req.validation.errors.length) {
        res.status(400).json(req.validation);
    } else {
        try {
            const statusId = req.params.id.replace(/[^\w.-]+/g, '');
            const status = await getStatusDoc(statusId);

            if (status) {
                const addCache = Object
                    .keys(status.reports)
                    .every((report) => status.reports[report].status !== 'pending');

                if (addCache) {
                    res.set('Cache-control', 'public, max-age=86400');
                }

                res.status(200).json(status);
            } else {
                res.status(404).json({
                    message: 'The provided status identifier does not exist.',
                    status: 404,
                });
            }
        } catch (err) {
            res.status(500).json({
                message: 'The server could not respond to the request.',
                status: 500,
            });
        }
    }
};

module.exports = getStatus;
