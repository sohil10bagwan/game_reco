const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  
  // Handle duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  
  // Handle invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  
  res.status(statusCode).json({ success: false, message });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

export { errorHandler, notFound };