/**
 * Internal Dependencies.
 */
const { getSourceUrl } = require('../../../src/util/getSourceUrl');

global.console.error = jest.fn();

afterEach(() => {
    global.console.error.mockRestore();
});

/**
 * Tests for getSourceUrl.
 */
describe('getSourceUrl', () => {
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
    it('Returns false when the parameters are missing', async () => {
        expect(await getSourceUrl()).toBe(false);
    });
    it('Returns fallback URL for plugin that wrongly uses trunk as the source, they should use tags', async () => {
        expect(await getSourceUrl('plugin', 'xpro-addons-beaver-builder-elementor', '1.4.1')).toBe('https://downloads.wordpress.org/plugin/xpro-addons-beaver-builder-elementor.zip');
    });
    it('Returns removeTrail URL for plugin that wrongly left the trailing zero off in the tag', async () => {
        expect(await getSourceUrl('plugin', 'ithemeland-woo-bulk-coupons-editing-lite', '1.0.0')).toBe('https://downloads.wordpress.org/plugin/ithemeland-woo-bulk-coupons-editing-lite.1.0.zip');
    });
    it('Returns addTrail URL for plugin that wrongly added a trailing zero to the tag', async () => {
        expect(await getSourceUrl('plugin', 'superb-recent-posts-with-thumbnail-images', '1.0')).toBe('https://downloads.wordpress.org/plugin/superb-recent-posts-with-thumbnail-images.1.0.0.zip');
    });
});
