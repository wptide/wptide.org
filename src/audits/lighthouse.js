const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');

const lighthouseAudit = async (url) => {
    const options = {
        chromeFlags: [
            '--disable-gpu',
            '--no-sandbox',
            '--headless',
        ],
        logLevel: 'error',
        output: 'json',
    };

    const browser = await puppeteer.launch();
    options.port = (new URL(browser.wsEndpoint())).port;

    const runnerResult = await lighthouse(url, options);

    const reportJson = runnerResult.report;
    const report = JSON.parse(reportJson);
    await browser.close();
    return {
        report,
    };
};

module.exports = lighthouseAudit;
