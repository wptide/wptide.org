/**
 * External Dependencies.
 */
const { execSync } = require('child_process');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

/**
 * Runs a lighthouse audit for a given project.
 *
 * @param   {object} message      Audit message.
 * @param   {string} message.slug Theme slug to audit.
 * @returns {object}              Lighthouse audit report.
 */
const lighthouseReporter = async (message) => {
    try {
        const options = {
            chromeFlags: [
                '--disable-gpu',
                '--no-sandbox',
                '--headless',
            ],
            logLevel: 'error',
            output: 'json',
        };
        const url = `https://wp-themes.com/${message.slug.replace(/[^\w.-]+/g, '')}/`;

        const args = {
            args: options.chromeFlags,
        };
        /* istanbul ignore else */
        if (process.env.CHROMIUM_PATH) {
            args.executablePath = process.env.CHROMIUM_PATH;
        }
        const browser = await puppeteer.launch(args);
        options.port = (new URL(browser.wsEndpoint())).port;

        const runnerResult = await lighthouse(url, options);

        const reportJson = runnerResult.report;
        const report = JSON.parse(reportJson);
        await browser.close();

        return {
            source_url: url,
            server: {
                node: execSync('node --version').toString().match(/\d+(\.\d+)+/g)[0],
                dependencies: [
                    {
                        vendor: 'GoogleChrome/lighthouse',
                        version: execSync("npm list lighthouse | awk -F@ 'FNR==2{print $2}'").toString().match(/\d+(\.\d+)+/g)[0],
                    },
                ],
            },
            report,
        };
    } catch (err) {
        console.log(err);
        return false;
    }
};

module.exports = lighthouseReporter;
