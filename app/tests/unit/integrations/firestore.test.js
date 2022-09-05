/**
 * Internal Dependencies.
 */
const { setReportDoc } = require('../../../src/integrations/firestore');
const { get, set } = require('../../../src/services/firestore');

jest.mock(
    '../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }),
);

const firestoreGet = get;
const firestoreSet = set;

beforeEach(() => {
    firestoreGet.mockClear();
    firestoreSet.mockClear();
});

/**
 * Tests for subscribe.
 */
describe('firestore', () => {
    it('setReportDoc responds with correct data', async () => {
        firestoreSet.mockResolvedValueOnce(true);
        await setReportDoc('12345', {});

        expect(firestoreSet).toBeCalledWith('Report/12345', {});
        expect(firestoreSet).toBeCalledTimes(1);
    });

    it('setReportDoc responds with correct data after first failed write attempt', async () => {
        firestoreSet.mockResolvedValueOnce(true);
        await setReportDoc('12345', {});

        expect(firestoreSet).toBeCalledWith('Report/12345', {});
        expect(firestoreSet).toBeCalledTimes(1);
    });
});
