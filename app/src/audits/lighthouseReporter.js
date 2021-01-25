/**
 * External Dependencies.
 */
const { execSync } = require('child_process');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const lighthouseReporter = async (message) => {
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
                    version: execSync('npm info lighthouse version').toString().match(/\d+(\.\d+)+/g)[0],
                },
            ],
        },
        report,
    };
};

module.exports = lighthouseReporter;
