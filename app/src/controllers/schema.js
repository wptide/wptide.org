/**
 * Internal Dependencies.
 */
const apiValidate = require('../util/apiValidate');

/**
 * Renders the API schema.
 *
 * @param {object} req The HTTP request.
 * @param {object} res The HTTP response.
 */
const schema = async (req, res) => {
    const api = await apiValidate();
    res.status(api.status ? 500 : 200).json(api);
};

module.exports = schema;
