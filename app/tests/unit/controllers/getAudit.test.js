const getAudit = require('../../../src/controllers/getAudit');
const { get, set } = require('../../../src/services/firestore');
const { publishMessage } = require('../../../src/services/pubsub');
const { dateTime } = require('../../../src/util/dateTime');

jest.mock('../../../src/services/firestore',
    () => ({
        get: jest.fn(),
        set: jest.fn(),
    }));

jest.mock('../../../src/services/pubsub');

jest.mock('../../../src/util/getSourceUrl',
    () => ({
        getSourceUrl: async (type, slug, version) => (slug === 'non-existent' ? null : `https://downloads.wordpress.org/${type}/${slug}.${version}.zip`),
    }));

jest.mock('../../../src/util/shouldLighthouseAudit',
    () => ({
        shouldLighthouseAudit: () => true,
    }));

jest.mock('../../../src/util/dateTime');

const firestoreGet = get;
const firestoreSet = set;

const mock = {
    req: () => ({
        validation: {
            message: 'Request has validation errors',
            status: 400,
            errors: [],
        },
        params: {},
    }),
    res: () => ({
        json: jest.fn(),
        set: jest.fn(),
        status(status) { // eslint-disable-line no-unused-vars
            return this; // Make it chainable
        },
    }),
};

beforeEach(() => {
    firestoreGet.mockClear();
    dateTime.mockClear();
    firestoreSet.mockClear();
    publishMessage.mockClear();
});

describe('The getAudit route handler', () => {
    it('Missing type parameter', async () => {
        const req = mock.req();
        await getAudit(req, mock.res());
        expect(req.validation.errors[0].message).toEqual('The audit project type is required.');
    });

    it('The type parameter is invalid', async () => {
        const req = mock.req();
        req.params.type = 'site';
        await getAudit(req, mock.res());
        expect(req.validation.errors[0].message).toEqual('The audit project type must be theme or plugin.');
    });

    it('Missing slug parameter', async () => {
        const req = mock.req();
        req.params.type = 'theme';
        await getAudit(req, mock.res());
        expect(req.validation.errors[0].message).toEqual('The audit project slug is required.');
    });

    it('The slug parameter is invalid', async () => {
        const req = mock.req();
        req.params.type = 'theme';
        req.params.slug = 'INVALID_SLUG';
        await getAudit(req, mock.res());
        expect(req.validation.errors[0].message).toEqual('The audit project slug must be an alpha-numeric string, dashes are allowed.');
    });

    it('Missing version parameter', async () => {
        const req = mock.req();
        req.params.type = 'plugin';
        req.params.slug = 'pwa';
        await getAudit(req, mock.res());
        expect(req.validation.errors[0].message).toEqual('The audit project version is required.');
    });

    it('The version parameter is invalid', async () => {
        const req = mock.req();
        req.params.type = 'plugin';
        req.params.slug = 'pwa';
        req.params.version = '1.0.0-alpha';
        await getAudit(req, mock.res());
        expect(req.validation.errors[0].message).toEqual('The audit project version must contain only numbers and periods, plus begins and ends with a number.');
    });

    it('Returns a 404 if audit does not exist.', async () => {
        const req = mock.req();
        const res = mock.res();
        req.params.type = 'plugin';
        req.params.slug = 'fake';
        req.params.version = '0.0.1';

        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(null);

        await getAudit(req, res);
        expect(res.json).toBeCalledWith({
            message: 'The audit requested does not exist.',
            status: 404,
        });
    });

    it('Returns a 500 if firestore throws an error.', async () => {
        const req = mock.req();
        const res = mock.res();
        req.params.type = 'plugin';
        req.params.slug = 'pwa';
        req.params.version = '0.5';

        firestoreGet.mockImplementation(() => {
            throw new Error('Something bad happened');
        });

        await getAudit(req, res);
        expect(firestoreSet).toBeCalledTimes(0);
        expect(res.json).toBeCalledWith({
            message: 'The server could not respond to the request.',
            status: 500,
        });
    });

    it('Returns completed audit if one exists.', async () => {
        const req = mock.req();
        const res = mock.res();
        req.params = {
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
            modified_datetime: 1600000001,
            reports: {
                phpcs_phpcompatibilitywp: {
                    id: 'e5085200b1a1db56c82af70ee206947aa449ed9512e524e06085b03a25f599fd',
                },
            },
        };

        firestoreGet.mockResolvedValue(mockAudit);

        await getAudit(req, res);
        expect(firestoreSet).toBeCalledTimes(0);
        expect(res.json).toBeCalledWith(mockAudit);
    });

    it('Returns completed audit with reports if requested.', async () => {
        const req = mock.req();
        const res = mock.res();
        req.params = {
            type: 'theme',
            slug: 'fooslug',
            version: '2.0.1',
        };
        req.query = {
            reports: 'phpcs_phpcompatibilitywp',
        };
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);

        const mockAudit = {
            id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
            type: 'theme',
            slug: 'fooslug',
            version: '2.0.1',
            created_datetime: 1600000000,
            modified_datetime: 1600000001,
            reports: {
                phpcs_phpcompatibilitywp: {
                    id: 'e5085200b1a1db56c82af70ee206947aa449ed9512e524e06085b03a25f599fd',
                },
                lighthouse: {
                    id: 'a5467200b1a1db56c82af70ee206947aa449ed9512e524e06085b03a25f599fc',
                },
            },
        };
        firestoreGet.mockResolvedValueOnce(mockAudit);

        const mockCompatReport = {
            id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
            type: 'phpcs_phpcompatibilitywp',
            source_url: 'https://downloads.wordpress.org/theme/fooslug.3.zip',
            created_datetime: 1600000001,
            milliseconds: 10000,
            audit: {
                id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
                type: 'theme',
                slug: 'fooslug',
                version: '2.0.1',
            },
        };
        firestoreGet.mockResolvedValueOnce(mockCompatReport);

        const mockLighthouseReport = {
            id: 'a5467200b1a1db56c82af70ee206947aa449ed9512e524e06085b03a25f599fc',
            type: 'lighthouse',
            source_url: 'https://wp-themes.com/fooslug',
            created_datetime: 1600000001,
            milliseconds: 10000,
            audit: {
                id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
                type: 'theme',
                slug: 'fooslug',
                version: '2.0.1',
            },
        };
        firestoreGet.mockResolvedValueOnce(mockLighthouseReport);

        await getAudit(req, res);
        expect(firestoreSet).toBeCalledTimes(0);
        expect(res.json).toBeCalledWith({
            reports: {
                phpcs_phpcompatibilitywp: { ...mockCompatReport },
            },
            ...mockAudit,
        });
        req.query.reports = 'all';
        await getAudit(req, res);
        expect(firestoreSet).toBeCalledTimes(0);
        expect(res.json).toBeCalledWith({
            reports: {
                phpcs_phpcompatibilitywp: { ...mockCompatReport },
                lighthouse: { ...mockLighthouseReport },
            },
            ...mockAudit,
        });
    });

    it('Publishes a phpcs audit message when we have a valid plugin', async () => {
        const req = mock.req();
        const res = mock.res();
        req.params = {
            type: 'plugin',
            slug: 'fooslug',
            version: '2',
        };
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(null);

        await getAudit(req, res);

        const expectedAudit = {
            ...req.params,
            id: 'f4d5b369004513a9eeb691e19f1c17c2f05888485b4342f31ee5ec981c8f60c0',
            created_datetime: currentTime,
            modified_datetime: currentTime,
            reports: {
                phpcs_phpcompatibilitywp: null,
            },
        };

        const expectedMessage = {
            ...req.params,
            id: expectedAudit.id,
        };

        expect(firestoreSet).toHaveBeenCalledWith(`Audit/${expectedAudit.id}`, expectedAudit);
        expect(publishMessage).toHaveBeenCalledWith(expectedMessage, 'MESSAGE_TYPE_PHPCS_REQUEST');
        expect(res.set).toHaveBeenCalledWith('Cache-control', 'public, max-age=86400');
    });

    it('Publishes a phpcs and lighthouse audit message when we have the latest valid theme', async () => {
        const req = mock.req();
        const res = mock.res();
        req.params = {
            type: 'theme',
            slug: 'fooslug',
            version: '2.0.1',
        };
        const currentTime = 1000;
        dateTime.mockReturnValue(currentTime);
        firestoreGet.mockResolvedValueOnce(null);

        await getAudit(req, res);

        const expectedAudit = {
            ...req.params,
            id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
            created_datetime: currentTime,
            modified_datetime: currentTime,
            reports: {
                lighthouse: null,
                phpcs_phpcompatibilitywp: null,
            },
        };

        const expectedMessage = {
            ...req.params,
            id: expectedAudit.id,
        };

        const expectedStatus = {
            ...req.params,
            id: 'd29213d0e05c8669ece2f68ce995e19407212debcdc6519f79b1208aa07c0b27',
            created_datetime: currentTime,
            modified_datetime: currentTime,
        };
        const statusObj = {
            attempts: 0,
            startTime: currentTime,
            status: 'pending',
        };
        expectedStatus.reports = {
            lighthouse: { ...statusObj },
            phpcs_phpcompatibilitywp: { ...statusObj },
        };

        expect(firestoreSet).toHaveBeenCalledWith(`Status/${expectedAudit.id}`, expectedStatus);
        expect(firestoreSet).toHaveBeenCalledWith(`Audit/${expectedAudit.id}`, expectedAudit);
        expect(publishMessage).toHaveBeenCalledWith(expectedMessage, 'MESSAGE_TYPE_PHPCS_REQUEST');
        expect(publishMessage).toHaveBeenCalledWith(expectedMessage, 'MESSAGE_TYPE_LIGHTHOUSE_REQUEST');
        expect(res.set).toHaveBeenCalledWith('Cache-control', 'no-store');
    });
});
