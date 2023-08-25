// This utility wraps around express route handlers to catch any unhandled promise rejections
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  module.exports = asyncHandler;
  