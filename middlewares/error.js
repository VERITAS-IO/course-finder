import httpStatus from "http-status";
import ApiError from "../models/errors/ApiError.js"

//INFO: HOW TO CREATE GLOBAL ERROR HANDLER, IT HAS ERR PARAMETER TOO.
//INFO: When i call next(error) function, in the controllers or services express will pass error to this because it has err parameter
const globalErrorHandler = (err, req, res, next) => {
  const errMsg = err.message || "Internal Server Error";
  const errStat = err.statusCode || 500;
  const errStack = err.stack || ""
  res.status(errStat).send({
    error: {
      message: errMsg,
      status: errStat,
      success: err.success,
      stack: errStack
    },
  });
  return next();
};

export default globalErrorHandler;
