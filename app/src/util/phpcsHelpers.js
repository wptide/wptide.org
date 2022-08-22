/**
 * External Dependencies.
 */
const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Internal Dependencies.
 */
const { download } = require('./download');
const { phpcsRunner } = require('./phpcsRunner');
const composerConfig = require('../../composer.json');

/**
 * Downloads the project to the local disk.
 *
 * @param   {string} url      The public ZIP archive download URL.
 * @param   {string} dir      The absolute path to the parent report directory.
 * @param   {string} filename The report ZIP archive name.
 * @returns {void}
 */
const phpcsDownloader = async (url, dir, filename) => {
    fs.mkdirSync(dir, { recursive: true });
    await download(url, `${dir}${filename}`);
    execSync(`unzip -o ${filename}`, { cwd: dir });
};

/**
 * Remove the report directory from the local disk.
 *
 * @param   {string} dir The absolute path to the report directory.
 * @returns {void}
 */
const phpcsRemover = (dir) => fs.rmSync(dir, { recursive: true, force: true });

/**
 * Process a PHPCS JSON report.
 *
 * @param   {string} url The public ZIP archive download URL.
 * @param   {string} dir The absolute path to the report directory.
 * @param   {string} app The app working directory.
 * @returns {object}     The report.
 */
const phpcsProcessor = (url, dir, app) => {
    const data = {
        source_url: url,
        server: {
            node: execSync('node --version').toString().match(/\d+(\.\d+)+/g)[0],
            php: execSync('php --version').toString().match(/\d+(\.\d+)+/g)[0],
            dependencies: [
                {
                    vendor: 'squizlabs/php_codesniffer',
                    version: execSync(`${app}/vendor/bin/phpcs -q --version`).toString().match(/\d+(\.\d+)+/g)[0],
                },
                {
                    vendor: 'phpcompatibility/phpcompatibility-wp',
                    version: composerConfig.require['phpcompatibility/phpcompatibility-wp'],
                },
            ],
        },
        // Set the report.
        report: {
            compatible: [],
            incompatible: [],
            totals: {
                warnings: 0,
                errors: 0,
                fixable: 0,
            },
            versions: {},
        },
    };

    // Generate & store PHPCS reports.
    ['5.6', '7.0', '7.1', '7.2', '7.3', '7.4', '8.0'].forEach((version) => {
        try {
            const output = phpcsRunner(version, dir, app);
            const parsedOutput = JSON.parse(output);

            if (!['files', 'totals'].every((v) => Object.keys(parsedOutput).includes(v))) {
                throw new Error(`Missing data for PHP v${version}`);
            }

            // Remove the file path.
            Object.keys(parsedOutput.files).forEach((key) => {
                const newKey = key.replace(dir, '');
                parsedOutput.files[newKey] = parsedOutput.files[key];
                delete parsedOutput.files[key];
            });

            // Add versions to compatible/incompatible arrays.
            const status = parsedOutput.totals.errors === 0 ? 'compatible' : 'incompatible';
            data.report[status].push(version);

            // Add parsed report.
            data.report.versions[version] = parsedOutput;

            // Update the totals.
            Object.keys(data.report.totals).forEach((key) => {
                data.report.totals[key] += parsedOutput.totals[key];
            });
        } catch (err) {
            /* istanbul ignore next */
            console.log(err.message || err);
        }
    });

    return data;
};

module.exports = {
    phpcsDownloader,
    phpcsRemover,
    phpcsProcessor,
};
