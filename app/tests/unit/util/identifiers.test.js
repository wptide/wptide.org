/**
 * Internal Dependencies.
 */
const { getSourceUrl } = require('../../../src/util/identifiers');

/**
 * Tests for getSourceUrl.
 */
describe('getSourceUrl:', () => {
    it('Returns a valid source URL for the PWA plugin v0.5.0', async () => {
        expect(await getSourceUrl('plugin', 'pwa', '0.5.0')).toBe('https://downloads.wordpress.org/plugin/pwa.0.5.0.zip');
    });
    it('Returns a valid source URL for the Twenty Twenty theme v1.5', async () => {
        expect(await getSourceUrl('theme', 'twentytwenty', '1.5')).toBe('https://downloads.wordpress.org/theme/twentytwenty.1.5.zip');
    });
    it('Returns false for the PWA plugin v0.0.5, which is not a real version', async () => {
        expect(await getSourceUrl('plugin', 'pwa', '0.5.0')).toBe('https://downloads.wordpress.org/plugin/pwa.0.5.0.zip');
    });
    it('Returns false for the Fake theme v1.0.0, which is not a real theme or version', async () => {
        expect(await getSourceUrl('theme', 'fake', '1.0.0')).toBe(false);
    });
    it('Returns false when the project cannot be downloaded from WordPress.org', async () => {
        expect(await getSourceUrl()).toBe(false);
    });
});
