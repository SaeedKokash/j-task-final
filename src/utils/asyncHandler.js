// This utility wraps around express route handlers to catch any unhandled promise rejections
const logger = require('./logger');

const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
        logger.error(err);
        next(err);
    });
}

module.exports = asyncHandler;
  