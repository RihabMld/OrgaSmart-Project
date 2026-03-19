const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    data: null,
    errors: [{
      field: err.path,
      message: err.message,
      stack: err.stack 
    }],
  });
};

const sendErrorForProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      data: null,
      errors: [{ message: err.message }],
    });
  }
  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'ERROR',
    message: 'Something went very wrong!',
  });
};

const handleJwtError = () => new ApiError("Invalid token, please login again..", 401);
const handleJwtExpired = () => new ApiError("Your session has expired, please login again.", 401);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'ERROR';

  let error = err; 
  if (error.name === 'JsonWebTokenError') error = handleJwtError(); 
  if (error.name === 'TokenExpiredError') error = handleJwtExpired();

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(error, res);
  } else {
    sendErrorForProd(error, res);
  }
};

module.exports = globalError;