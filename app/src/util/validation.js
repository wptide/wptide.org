/**
 * Validation middleware.
 *
 * @type {object}
 */
module.exports = {
  setup: () => {
    /**
     * Initializes the validation middleware.
     *
     * @param {object} req The HTTP request.
     * @param {object} res The HTTP response.
     * @param {function} next The next handler.
     */
    return (req, res, next) => {

      // Setup the validation object.
      req.validation = {
        message: 'Request has validation errors',
        status: 400,
        errors: []
      };

      /**
       * The report endpoint requires an id. We do this early to ensure the
       * 400 error is returned before the 404 handler.
       */
      if (['/api/v1/report/', '/api/v1/report'].includes(req.path)) {
        req.validation.errors.push({
          message: 'A report identifier is required.',
          parameter: 'id'
        });
      }

      next();
    }
  },
  handle: () => {
    /**
     * Responds with the validation errors.
     *
     * @param {object} req The HTTP request.
     * @param {object} res The HTTP response.
     * @param {function} next The next handler.
     */
    return (req, res, next) => {
      if (req.validation.errors.length) {
        return res.status(400).json(req.validation);
      }

      next();
    }
  },
}
