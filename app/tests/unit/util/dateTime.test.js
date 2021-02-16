/**
 * Internal Dependencies.
 */
const { dateTime } = require('../../../src/util/dateTime');

/**
 * Tests for dateTime.
 */
describe('dateTime', () => {
    it('Returns a validated date-time in milliseconds', async () => {
        const dateObj = new Date(dateTime());
        expect(Object.prototype.toString.call(dateObj)).toBe('[object Date]');
    });
});
