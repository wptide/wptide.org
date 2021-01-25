const getReport = require('../../../src/controllers/getReport');
const { get, set } = require('../../../src/services/datastore');

jest.mock('../../../src/services/datastore',
    () => ({
        getKey: (a, b) => b,
        get: jest.fn(),
        set: jest.fn(),
    }));

const datastoreGet = get;
const datastoreSet = set;

beforeEach(() => {
    datastoreGet.mockClear();
});

describe('Main index entry point getReport', () => {
    const res = {
        json: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    };

    describe('Route handler', () => {
        it('Invokes route handler', async () => {
            let errorMessage;
            try {
                await getReport({ params: {} });
            } catch (error) {
                errorMessage = error.message;
            }
            expect(errorMessage).toEqual('Report id missing');

            expect(async () => {
                await getReport({
                    params: {
                        id: 'report1',
                    },
                }, res);
            }).not.toThrow();
        });

        it('Returns report if one exists.', async () => {
            const mockReport = {
                id: 'report1',
                foo: 'bar',
            };

            datastoreGet.mockResolvedValue(mockReport);

            await getReport({ params: { id: 'report1' } }, res);
            expect(datastoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith(mockReport);
        });
    });
});
