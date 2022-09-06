/**
 * Internal Dependencies.
 */
const { sourceUrlExists } = require('../../../src/util/sourceUrlExists');
const { getSourceUrl } = require('../../../src/util/getSourceUrl');

jest.mock('../../../src/util/sourceUrlExists', () => ({
    sourceUrlExists: jest.fn(),
}));

afterEach(() => {
    sourceUrlExists.mockRestore();
});

/**
 * Tests for sourceUrlExists.
 */
describe('sourceUrlExists', () => {
    it('Returns removeTrail URL for plugin that wrongly left the trailing zero off in the tag', async () => {
        const expected = 'https://downloads.wordpress.org/plugin/custom-plugin.1.0.zip';

        sourceUrlExists.mockReturnValueOnce(false);
        sourceUrlExists.mockReturnValueOnce(false);
        sourceUrlExists.mockReturnValueOnce(false);
        sourceUrlExists.mockReturnValueOnce(expected);

        expect(await getSourceUrl('plugin', 'custom-plugin', '1.0.0')).toBe(expected);
        expect(sourceUrlExists).toHaveBeenCalledTimes(4);
    });
    it('Returns addTrail URL for plugin that wrongly added a trailing zero to the tag', async () => {
        const expected = 'https://downloads.wordpress.org/plugin/custom-plugin.1.0.0.zip';

        sourceUrlExists.mockReturnValueOnce(false);
        sourceUrlExists.mockReturnValueOnce(false);
        sourceUrlExists.mockReturnValueOnce(expected);

        expect(await getSourceUrl('plugin', 'custom-plugin', '1.0')).toBe(expected);
        expect(sourceUrlExists).toHaveBeenCalledTimes(3);
    });
});
