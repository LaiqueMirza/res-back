/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
    debugger;
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // Email validation
  email: () => body('email')
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters'),
  
  // Password validation
  password: () => body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Name validation (optional)
  firstName: () => body('firstName')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: () => body('lastName')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // Phone validation
  phone: () => body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Phone number contains invalid characters')
    .isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 characters'),
  
  // Job title validation
  jobTitle: () => body('jobTitle')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Job title must not exceed 100 characters'),
  
  // City/Country validation
  city: () => body('city')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('City must not exceed 100 characters'),
  
  country: () => body('country')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),
  
  // Date validation
  date: (field) => body(field)
    .optional()
    .isISO8601().withMessage(`${field} must be a valid date`)
    .toDate(),
  
  // Boolean validation
  boolean: (field) => body(field)
    .optional()
    .isBoolean().withMessage(`${field} must be a boolean`),
  
  // ID validation (MongoDB ObjectId or UUID)
  id: (field = 'id') => param(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .matches(/^[a-f\d]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage(`${field} must be a valid ID`),
  
  // Template ID validation
  templateId: () => body('templateId')
    .isInt({ min: 1 }).withMessage('Template ID must be a positive integer')
    .toInt(),
  
  // Pagination validation
  page: () => query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  limit: () => query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
};

/**
 * Validation chains for specific routes
 */
const validators = {
  // User registration
  register: [
    validationRules.email(),
    validationRules.password(),
    handleValidationErrors,
  ],
  
  // User login
  login: [
    validationRules.email(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
  ],
  
  // Update profile
  updateProfile: [
    validationRules.firstName(),
    validationRules.lastName(),
    validationRules.phone(),
    validationRules.jobTitle(),
    validationRules.city(),
    validationRules.country(),
    handleValidationErrors,
  ],
  
  // Create/Update resume
  resumeData: [
    body('personalDetails').optional().isObject().withMessage('Personal details must be an object'),
    body('employment').optional().isArray().withMessage('Employment must be an array'),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('languages').optional().isArray().withMessage('Languages must be an array'),
    handleValidationErrors,
  ],
  
  // Change password
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    validationRules.password(),
    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    handleValidationErrors,
  ],
  
  // Template selection
  selectTemplate: [
    validationRules.templateId(),
    handleValidationErrors,
  ],
  
  // Pagination
  pagination: [
    validationRules.page(),
    validationRules.limit(),
    handleValidationErrors,
  ],
};

/**
 * Sanitize HTML content
 */
const sanitizeHtml = (field) => {
  return body(field)
    .customSanitizer(value => {
      if (typeof value !== 'string') return value;
      
      // Remove script tags and dangerous attributes
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/on\w+\s*=\s*'[^']*'/gi, '')
        .replace(/javascript:/gi, '');
    });
};

module.exports = {
  validators,
  validationRules,
  handleValidationErrors,
  sanitizeHtml,
};
