/**
 * Not Found Middleware
 * Catches any request to a route that hasn't been defined.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 * Overrides the default Express error handler to provide clean JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  // Sometimes errors don't have a status code, default to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);

  res.json({
    message: err.message,
    // Only show stack trace in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};