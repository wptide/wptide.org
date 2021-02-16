/**
 * Internal Dependencies.
 */
const phpcsReporter = require('../../../src/audits/phpcsReporter');
const { phpcsDownloader, phpcsRemover, phpcsProcessor } = require('../../../src/util/phpcsHelpers');

jest.mock('../../../src/util/phpcsHelpers',
    () => ({
        phpcsDownloader: jest.fn(),
        phpcsRemover: jest.fn(),
        phpcsProcessor: jest.fn(),
    }));

beforeEach(() => {
    phpcsDownloader.mockClear();
    phpcsRemover.mockClear();
    phpcsProcessor.mockClear();
});

/**
 * Tests for phpcsReporter.
 */
describe('phpcsReporter', () => {
    it('report is generated', async () => {
        const report = {
            source_url: 'https://downloads.wordpress.org/theme/twentytwenty.1.6.zip',
        };
        phpcsDownloader.mockResolvedValue(true);
        phpcsProcessor.mockResolvedValue(report);
        phpcsRemover.mockResolvedValue(true);
        const data = await phpcsReporter({
            slug: 'twentytwenty',
            version: '1.6',
            type: 'theme',
        });
        expect(data.source_url).toBe('https://downloads.wordpress.org/theme/twentytwenty.1.6.zip');
    });
});
