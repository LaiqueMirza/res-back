const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const commonService = require("../services/common.js");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  // No token provided
  if (!token) {
    return next(new ErrorHander("Please login to access this resource", 401));
  }

  try {
    // Verify and decode the JWT token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Fetch user from database
    req.user = await commonService.findOne("user", { user_id: decodedData.id });
    
    // User not found in database
    if (!req.user) {
      return next(new ErrorHander("User not found. Please login again", 401));
    }
    
    next();
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHander("Invalid token. Please login again", 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHander("Token expired. Please login again", 401));
    }
    
    // Other JWT errors
    return next(new ErrorHander("Authentication failed. Please login again", 401));
  }
});


