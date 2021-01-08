/**
 * Get the number of seconds since epoch.
 *
 * @return {number} Number of seconds since epoch.
 */
const dateTime = () => Math.floor(Date.now() / 1000);

module.exports = {
    dateTime,
};
