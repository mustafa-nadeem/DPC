export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: statusCode === 500 ? 'Internal server error' : error.message,
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    payload.error = error.message;
  }

  res.status(statusCode).json(payload);
}
