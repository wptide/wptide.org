/**
 * Internal Dependencies.
 */
const { phpcsProcessor } = require('../../../src/util/phpcsHelpers');
const { phpcsRunner } = require('../../../src/util/phpcsRunner');

jest.mock('../../../src/util/phpcsRunner');

const tmp = `/tmp/${Math.random().toString(36).substr(2)}/`;
const app = `${process.cwd()}/app`;

/**
 * Tests for phpcsHelpers.
 */
describe('phpcsHelpers', () => {
    it('phpcsProcessor: report with missing keys throws errors', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        phpcsRunner.mockReturnValue(JSON.stringify({}));
        const data = phpcsProcessor('', tmp, app);
        expect(data.report.compatible.length).toEqual(0);
        expect(data.report.incompatible.length).toEqual(0);
        expect(spy.mock.calls[0][0]).toContain('Missing data for PHP v5.6');
        expect(spy.mock.calls[1][0]).toContain('Missing data for PHP v7.0');
        expect(spy.mock.calls[2][0]).toContain('Missing data for PHP v7.1');
        expect(spy.mock.calls[3][0]).toContain('Missing data for PHP v7.2');
        expect(spy.mock.calls[4][0]).toContain('Missing data for PHP v7.3');
        expect(spy.mock.calls[5][0]).toContain('Missing data for PHP v7.4');
        expect(spy.mock.calls[6][0]).toContain('Missing data for PHP v8.0');
        expect(spy).toHaveBeenCalledTimes(7);
        spy.mockRestore();
        phpcsRunner.mockClear();
    });

    it('phpcsProcessor: JSON.parse throws error', async () => {
        const spy = jest.spyOn(console, 'log').mockImplementation();
        phpcsRunner.mockReturnValue(null);
        const data = phpcsProcessor('', tmp, app);
        expect(data.report.compatible.length).toEqual(0);
        expect(data.report.incompatible.length).toEqual(0);
        expect(spy).toBeCalledWith('Cannot convert undefined or null to object');
        expect(spy).toHaveBeenCalledTimes(7);
        spy.mockRestore();
        phpcsRunner.mockClear();
    });
});
