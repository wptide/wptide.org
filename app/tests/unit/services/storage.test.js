/**
 * Internal Dependencies.
 */
const { bucketExists, saveFile, getFile } = require('../../../src/services/storage');

/**
 * Tests for Storage.
 */
describe('Storage service', () => {
    it('The bucket exists.', async () => {
        expect(await bucketExists('EXISTING_BUCKET')).toBeTruthy();
    });
    it('The bucket does not exist.', async () => {
        expect(await bucketExists('ERROR_BUCKET')).toBeFalsy();
    });
    it('The file is created.', async () => {
        expect(await saveFile('EXISTING_BUCKET', 'somefile.json', {})).toBeTruthy();
    });
    it('The file is not created.', async () => {
        expect(await saveFile('ERROR_BUCKET', 'somefile.json', {})).toBeFalsy();
    });
    it('The file does not exist.', async () => {
        expect(await getFile('EXISTING_BUCKET', 'missingfile.json')).toBeFalsy();
    });
    it('The file exist and returns the mocked value.', async () => {
        const data = await getFile('EXISTING_BUCKET', 'somefile.json');
        expect(data.key).toBe('value');
    });
});
