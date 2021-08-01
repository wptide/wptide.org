/**
 * Internal Dependencies.
 */
const { writeFile, readFile, unlink } = require('../../../src/util/dataFile');

/**
 * Tests for dataFile.
 */
describe('dataFile', () => {
    it('Asynchronously writes, reads, and unlinks data from the local filesystem.', async () => {
        const data = {
            report: true,
        };
        const filename = 'report-test-1a2b3c4d5e.json';
        await writeFile(filename, data);
        await expect(readFile(filename)).resolves.toEqual(JSON.stringify(data));
        await unlink(filename);
        await expect(readFile(filename)).rejects.toThrow();
    });
});
