/**
 * Error response utility
 */
const errorResponse = (res, statusCode, error, message) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message
  });
};

/**
 * Success response utility
 */
const successResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  response.data = data;

  return res.status(statusCode).json(response);
};

module.exports = {
  errorResponse,
  successResponse
};
