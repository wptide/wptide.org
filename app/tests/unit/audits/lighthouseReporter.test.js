/**
 * Internal Dependencies.
 */
const lighthouse = require('lighthouse');
const lighthouseReporter = require('../../../src/audits/lighthouseReporter');

jest.mock('lighthouse');
jest.mock('puppeteer',
    () => ({
        launch: () => ({
            wsEndpoint: () => 'http://localhost:5555',
            close: jest.fn(),
        }),
    }));

beforeEach(() => {
    process.env.CHROMIUM_PATH = '/usr/bin/chromium-browser';
    lighthouse.mockClear();
});

afterEach(() => {
    delete process.env.CHROMIUM_PATH;
});

beforeAll(() => {
    process.chdir('./app');
});

afterAll(() => {
    process.chdir('../');
});

/**
 * Tests for lighthouseReporter.
 */
describe('lighthouseReporter', () => {
    it('Returns the Lighthouse report', async () => {
        lighthouse.mockResolvedValue({
            report: JSON.stringify({ source_url: 'https://wp-themes.com/twentytwenty' }),
        });
        const LH = await lighthouseReporter({ slug: 'twentytwenty' });
        expect(LH).toHaveProperty('source_url');
    });

    it('report is not generated', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        lighthouse.mockImplementation(() => {
            throw new Error('Something bad happened');
        });
        const data = await lighthouseReporter({ slug: 'twentytwenty' });
        expect(data).toBe(false);
        spy.mockRestore();
    });
});
