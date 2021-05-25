/**
 * External Dependencies.
 */
const { execSync } = require('child_process');

/**
 * Runs phpcs on the local downloaded project.
 *
 * @param   {string} version The project version.
 * @param   {string} dir     The absolute path to the report directory.
 * @param   {string} app     The app working directory.
 * @returns {object}         The phpcs report.
 */
const phpcsRunner = (version, dir, app) => {
    const command = `${app}/vendor/bin/phpcs -q -n -d memory_limit=-1 --standard=PHPCompatibilityWP --extensions=php --parallel=16 --report=json --runtime-set ignore_errors_on_exit 1 --runtime-set ignore_warnings_on_exit 1 --runtime-set testVersion ${version} .`;
    return execSync(command, { cwd: dir }).toString();
};

module.exports = {
    phpcsRunner,
};
