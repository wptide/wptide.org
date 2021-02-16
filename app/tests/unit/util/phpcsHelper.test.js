/**
 * External Dependencies.
 */
const fs = require('fs');

/**
 * Internal Dependencies.
 */
const { phpcsDownloader, phpcsRemover, phpcsProcessor } = require('../../../src/util/phpcsHelpers');

const app = `${process.cwd()}/app`;

const download = async (slug, version) => {
    const parentDir = `/tmp/${Math.random().toString(36).substr(2)}/`;
    const downloadFilename = `${slug}.${version}.zip`;
    const url = `https://downloads.wordpress.org/plugin/${downloadFilename}`;
    const dir = `${parentDir}${slug}/`;

    await phpcsDownloader(url, parentDir, downloadFilename);

    return {
        dir,
        url,
    };
};

/**
 * Tests for phpcsHelpers.
 */
describe('phpcsHelpers', () => {
    it('phpcsDownloader: downloads the source to the tmp directory', async () => {
        const { dir } = await download('hello-dolly', '1.5');
        expect(fs.existsSync(dir)).toBe(true);
        phpcsRemover(dir);
    });
    it('phpcsRemover: removes the source in the tmp directory', async () => {
        const { dir } = await download('hello-dolly', '1.5');
        expect(fs.existsSync(dir)).toBe(true);
        phpcsRemover(dir);
        expect(fs.existsSync(dir)).toBe(false);
    });
    it('phpcsProcessor: report without errors is generated for the hello-dolly plugin', async () => {
        const { dir, url } = await download('hello-dolly', '1.5');
        const data = phpcsProcessor(url, dir, app);
        expect(data.source_url).toBe('https://downloads.wordpress.org/plugin/hello-dolly.1.5.zip');
        expect(data.report.totals.warnings).toBe(0);
        expect(data.report.totals.errors).toBe(0);
        phpcsRemover(dir);
    });
    it('phpcsProcessor: report with errors is generated for the enable-svg-uploads plugin', async () => {
        const { dir, url } = await download('enable-svg-uploads', '1.8.3');
        const data = phpcsProcessor(url, dir, app);
        expect(data.source_url).toBe('https://downloads.wordpress.org/plugin/enable-svg-uploads.1.8.3.zip');
        expect(data.report.totals.warnings).toBe(0);
        expect(data.report.totals.errors).toBe(9);
        expect(data.report.incompatible.includes('5.6')).toBe(true);
        phpcsRemover(dir);
    });
});
