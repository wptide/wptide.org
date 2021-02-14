/**
 * Initializes the validation middleware.
 *
 * @param {object}   req  The HTTP request.
 * @param {object}   res  The HTTP response.
 * @param {Function} next The next handler.
 * @returns {void}
 */
const setupValidation = (req, res, next) => {
    // Setup the validation object.
    req.validation = {
        message: 'Request has validation errors',
        status: 400,
        errors: [],
    };

    /**
     * The report endpoint requires an id. We do this early to ensure the
     * 400 error is returned before the 404 handler.
     */
    if (['/api/v1/report/', '/api/v1/report'].includes(req.path)) {
        req.validation.errors.push({
            message: 'A report identifier is required.',
            parameter: 'id',
        });
    }

    next();
};

/**
 * Responds with the validation errors.
 *
 * @param {object}   req  The HTTP request.
 * @param {object}   res  The HTTP response.
 * @param {Function} next The next handler.
 */
const handleValidation = (req, res, next) => {
    if (req.validation.errors.length) {
        res.status(400).json(req.validation);
    } else {
        next();
    }
};

/**
 * Validation middleware.
 *
 * @type {object}
 */
module.exports = {
    setupValidation: () => setupValidation,
    handleValidation: () => handleValidation,
};
