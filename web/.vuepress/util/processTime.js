/**
 * Process the time into a human readable format.
 *
 * @param   {number} datetime The datetime in seconds.
 * @returns {string}          The time since the job started.
 */
module.exports = (datetime) => {
    const time = [];
    const seconds = Math.floor(datetime % 60);
    const minutes = Math.floor((datetime / 60) % 60);
    const hours = Math.floor((datetime / 3600) % 24);
    const days = Math.floor(datetime / 86400);

    if (days > 0) {
        time.push(`${Math.floor(days)}d`);
    }
    if (hours > 0) {
        time.push(`${Math.floor(hours)}h`);
    }
    if (minutes > 0) {
        time.push(`${Math.floor(minutes)}m`);
    }
    if (seconds > 0) {
        time.push(`${Math.floor(seconds)}s`);
    }

    return time.join(' ');
};
