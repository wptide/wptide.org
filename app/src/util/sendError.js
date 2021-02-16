/**
 * Helper function for the Audit Server.
 *
 * @param {object} res    The HTTP Response.
 * @param {string} msg    The error response.
 * @param {number} status The status code.
 */
exports.sendError = (res, msg, status) => {
    console.log(msg);
    res.status(status || 400).send();
};
