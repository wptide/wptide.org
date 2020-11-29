/**
 * External Dependencies.
 */
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

    const browser = await puppeteer.launch({
        executablePath: process.env.CHROMIUM_PATH,
        args: options.chromeFlags,
    });
    options.port = (new URL(browser.wsEndpoint())).port;

    const runnerResult = await lighthouse(url, options);

    const reportJson = runnerResult.report;
    const report = JSON.parse(reportJson);
    await browser.close();

    return report;
};

module.exports = lighthouseReporter;
