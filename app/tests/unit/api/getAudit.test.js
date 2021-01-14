const { getAudit } = require('../../../src/controllers/getAudit');
const { get, set } = require('../../../src/services/datastore');
const { publishMessage } = require('../../../src/services/pubsub');
const { dateTime } = require('../../../src/util/time');

jest.mock('../../../src/services/datastore',
    () => ({
        getKey: (a, b) => b,
        get: jest.fn(),
        set: jest.fn(),
    }));

jest.mock('../../../src/services/pubsub');

jest.mock('../../../src/util/getSourceUrl',
    () => ({
        getSourceUrl: async (type, slug, version) => `https://downloads.wordpress.org/${type}/${slug}.${version}.zip`,
    }));

jest.mock('../../../src/util/shouldLighthouseAudit',
    () => ({
        shouldLighthouseAudit: () => true,
    }));

jest.mock('../../../src/util/time');

const datastoreGet = get;
const datastoreSet = set;

beforeEach(() => {
    datastoreGet.mockClear();
    dateTime.mockClear();
    datastoreSet.mockClear();
    publishMessage.mockClear();
});

describe('Main index entry point getAudit', () => {
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
                await getAudit({ params: {} });
            } catch (error) {
                errorMessage = error.message;
            }
            expect(errorMessage).toEqual('Project type missing');

            try {
                await getAudit({ params: { type: 'foo' } });
            } catch (error) {
                errorMessage = error.message;
            }
            expect(errorMessage).toEqual('Project type should be theme or plugin');

            expect(async () => {
                await getAudit({
                    params: {
                        type: 'theme',
                        slug: 'fooslug',
                        version: '1',
                    },
                }, res);
            }).not.toThrow();
        });

        it('Returns completed audit if one exists.', async () => {
            const auditParams = {
                type: 'plugin',
                slug: 'fooslug',
                version: '2',
            };
            const currentTime = 1000;
            dateTime.mockReturnValue(currentTime);

            const mockAudit = {
                id: 'fb8fd6304dd6a5f2fc4f281a8c7c8e53be9b5d1a5286c0f6ad2eebf78b5838c3',
                type: 'plugin',
                slug: 'fooslug',
                version: '2',
                created_datetime: 1600000000,
                last_modified_datetime: 1600000001,
                reports: {
                    phpcs_phpcompatibilitywp: {
                        id: 'e5085200b1a1db56c82af70ee206947aa449ed9512e524e06085b03a25f599fd',
                    },
                },
            };

            datastoreGet.mockResolvedValue(mockAudit);

            await getAudit({ params: auditParams }, res);
            expect(datastoreSet).toBeCalledTimes(0);
            expect(res.json).toBeCalledWith(mockAudit);
        });

        it('Publishes a phpcs audit message when we have a valid plugin', async () => {
            const auditParams = {
                type: 'plugin',
                slug: 'fooslug',
                version: '2.0.1',
            };
            const currentTime = 1000;
            dateTime.mockReturnValue(currentTime);
            datastoreGet.mockResolvedValueOnce(null);

            await getAudit({
                params: auditParams,
            }, res);

            const expectedAudit = {
                ...auditParams,
                id: '80b87c3c58e0db32770995c3589f6830304c6cc85cfa61f3c2c7d722b3ef7fe2',
                created_datetime: currentTime,
                last_modified_datetime: currentTime,
                reports: {
                    phpcs_phpcompatibilitywp: null,
                },
            };

            const expectedMessage = {
                ...auditParams,
                id: expectedAudit.id,
            };

            expect(datastoreSet).toHaveBeenCalledWith(expectedAudit.id, expectedAudit);
            expect(publishMessage).toHaveBeenCalledWith(expectedMessage, 'MESSAGE_TYPE_PHPCS_REQUEST');
        });

        it('Returns null trying to createAudit for nonexistent project', async () => {
            jest.mock('../../../src/util/getSourceUrl',
                () => ({
                    getSourceUrl: null,
                }));

            const auditParams = {
                type: 'theme',
                slug: 'fooslug',
                version: '2.0.1',
            };
            const currentTime = 1000;
            dateTime.mockReturnValue(currentTime);
            datastoreGet.mockResolvedValueOnce(null);

            await getAudit({
                params: auditParams,
            }, res);

            expect(res.json).toBeCalledWith({
                error: {
                    code: 404,
                    message: 'Audit not found',
                },
            });
        });

        it('Publishes a phpcs and lighthouse audit message when we have the latest valid theme', async () => {
            const auditParams = {
                type: 'theme',
                slug: 'fooslug',
                version: '2.0.1',
            };
            const currentTime = 1000;
            dateTime.mockReturnValue(currentTime);
            datastoreGet.mockResolvedValueOnce(null);

            await getAudit({
                params: auditParams,
            }, res);

            const expectedAudit = {
                ...auditParams,
                id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
                created_datetime: currentTime,
                last_modified_datetime: currentTime,
                reports: {
                    lighthouse: null,
                    phpcs_phpcompatibilitywp: null,
                },
            };

            const expectedMessage = {
                ...auditParams,
                id: expectedAudit.id,
            };

            expect(datastoreSet).toHaveBeenCalledWith(expectedAudit.id, expectedAudit);
            expect(publishMessage).toHaveBeenCalledWith(expectedMessage, 'MESSAGE_TYPE_PHPCS_REQUEST');
        });
    });
});
