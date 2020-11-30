/**
 * Sleep function processing with setTimeout.
 *
 * @param {number} ms The timeout in milliseconds.
 * @returns {Promise} Returns a thenable promise.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    sleep,
};
