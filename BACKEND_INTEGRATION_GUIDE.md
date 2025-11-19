# Backend Setup & Integration Guide

## 📋 Overview
This guide covers the integration of security middleware, error handling, validation, and logging in the backend application.

## ✅ Completed Integrations

### 1. Security Middleware (`src/middleware/security.js`)
Comprehensive security layer including:
- **Helmet.js**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting**: 3-tier rate limiting system
  - API Limiter: 100 requests/15min (general API routes)
  - Auth Limiter: 10 requests/15min (login/signup routes)
  - Strict Limiter: 5 requests/hour (sensitive operations)
- **CORS**: Dynamic origin validation with credentials support
- **Request Sanitization**: NoSQL injection prevention
- **Security Logging**: Suspicious pattern detection
- **Request Size Limiting**: 10MB maximum

### 2. Input Validation (`src/middleware/validation.js`)
Express-validator based validation:
- Email validation with normalization
- Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
- Name validation (1-50 chars, letters only)
- Phone number validation (10-20 chars)
- ID validation (MongoDB ObjectId or UUID)
- Pagination validation (page, limit)
- Pre-built validators for common routes:
  - `validators.register`
  - `validators.login`
  - `validators.updateProfile`
  - `validators.resumeData`
  - `validators.changePassword`

### 3. Error Handling (`src/middleware/errorHandler.js`)
Global error management:
- **ApiError Class**: Structured error responses
- **Error Converters**: Mongoose, JWT, Multer error handling
- **Error Logging**: Integration with Winston logger
- **Async Handler**: Wrapper for async route handlers
- **Process Handlers**: Uncaught exceptions and unhandled rejections
- Pre-built error responses:
  - `apiErrors.badRequest()`
  - `apiErrors.unauthorized()`
  - `apiErrors.notFound()`
  - `apiErrors.conflict()`
  - etc.

### 4. Logging (`src/utils/logger.js`)
Winston-based logging system:
- **Console Logging**: Colorized output in development
- **File Logging**: Production logs (error.log, combined.log)
- **Log Rotation**: 5MB max per file, 5 files retained
- **HTTP Logging**: Morgan integration
- Helper methods:
  - `logger.logRequest(req)`
  - `logger.logResponse(req, res)`
  - `logger.logError(error, context)`
  - `logger.logSecurity(event, details)`

### 5. Environment Validation (`src/utils/validateEnv.js`)
Startup validation:
- Required environment variables check
- Database URL format validation
- Port number validation
- JWT secret strength validation
- Production safety warnings

## 🔧 Integration in index.js

The main Express application (`index.js`) has been updated with:

```javascript
// Security middleware
✅ helmetConfig - Security headers
✅ requestSizeLimiter - 10MB max request size
✅ securityLogger - Suspicious pattern detection

// Request processing
✅ Morgan logging with Winston
✅ JSON body parsing (10MB limit)
✅ Cookie parsing
✅ CORS with origin validation
✅ Request sanitization

// Routes
✅ API rate limiting (100 req/15min)
✅ Auth rate limiting (10 req/15min)
✅ 404 handler
✅ Global error handler

// Process handlers
✅ Graceful shutdown (SIGTERM, SIGINT)
✅ Unhandled rejection handler
```

## 📝 How to Use

### Using Validation in Routes

```javascript
const { validators } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

// Apply rate limiting to specific routes
router.use('/auth', authLimiter);

// Use pre-built validators
router.post('/auth/login', validators.login, loginController);
router.post('/auth/register', validators.register, signUpController);
router.patch('/user/profile', validators.updateProfile, updateProfileController);

// Create custom validation
const { validationRules, handleValidationErrors } = require('../middleware/validation');

router.post('/custom', [
  validationRules.email(),
  validationRules.firstName(),
  handleValidationErrors,
], customController);
```

### Using Error Handling

```javascript
const { ApiError, apiErrors, asyncHandler } = require('../middleware/errorHandler');

// Wrap async route handlers
router.get('/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  if (!data) {
    throw apiErrors.notFound('Data not found');
  }
  res.json({ success: true, data });
}));

// Throw custom errors
if (!user) {
  throw new ApiError(404, 'User not found');
}

// Use pre-built errors
throw apiErrors.unauthorized('Invalid credentials');
throw apiErrors.badRequest('Missing required fields');
throw apiErrors.forbidden('Access denied');
```

### Using Logger

```javascript
const logger = require('../utils/logger');

// Log different levels
logger.info('User logged in', { userId: user.id });
logger.warn('Invalid login attempt', { email, ip: req.ip });
logger.error('Database connection failed', { error: error.message });

// Log requests/responses
logger.logRequest(req, 'User request');
logger.logResponse(req, res, 'User response');

// Log security events
logger.logSecurity('Multiple failed login attempts', { 
  email, 
  ip: req.ip,
  attempts: 5 
});
```

## 🚀 Next Steps

### Required Environment Variables
Copy `.env.example` to `.env` and fill in:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/resume_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500

# Server
PORT=8000
NODE_ENV=development
```

### Testing the Integration

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Check logs:**
   - Console: Colored logs in development
   - Files: `logs/error.log`, `logs/combined.log` (production)

3. **Test rate limiting:**
   ```bash
   # Should succeed
   curl http://localhost:8000/v1/auth/login -X POST

   # After 10 requests in 15 min, should fail with 429
   ```

4. **Test validation:**
   ```bash
   # Invalid email - should return 400
   curl http://localhost:8000/v1/auth/register -X POST \
     -H "Content-Type: application/json" \
     -d '{"email": "invalid", "password": "Test@123"}'
   ```

5. **Test error handling:**
   ```bash
   # Non-existent route - should return 404
   curl http://localhost:8000/v1/nonexistent
   ```

## 📊 Monitoring

### Log Files (Production)
- `logs/error.log` - All errors (400+)
- `logs/combined.log` - All log levels
- Automatic rotation at 5MB, keeps 5 files

### Security Events Logged
- Multiple failed login attempts
- Suspicious request patterns
- SQL/NoSQL injection attempts
- XSS attempts
- Rate limit violations

## 🔐 Security Features Active

✅ Helmet security headers
✅ CORS with origin validation
✅ Rate limiting (API, Auth, Strict)
✅ Request size limiting (10MB)
✅ NoSQL injection prevention
✅ XSS protection
✅ CSRF token support
✅ Security logging
✅ Environment validation
✅ Input sanitization
✅ Password strength validation

## ⚠️ Important Notes

1. **Environment Variables**: Server will not start without required env vars
2. **Rate Limiting**: Applied globally and per-route basis
3. **Error Responses**: Always return structured JSON
4. **Logging**: Sensitive data (passwords, tokens) automatically filtered
5. **Production**: Source maps disabled, console.logs removed automatically

## 🐛 Troubleshooting

### Server won't start
- Check `.env` file exists and contains all required variables
- Check `logs/` directory has write permissions
- Verify database connection string

### Rate limiting too strict
- Adjust in `src/middleware/security.js`
- Or use environment variables (RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)

### Validation errors
- Check request payload matches validation rules
- Review error response for specific field errors
- Adjust validators in `src/middleware/validation.js`

### CORS errors
- Add frontend URL to CORS_ORIGIN environment variable
- Check `corsOptions` in `src/middleware/security.js`

## 📚 Additional Resources

- [Express Validator Docs](https://express-validator.github.io/docs/)
- [Helmet.js Docs](https://helmetjs.github.io/)
- [Winston Logger Docs](https://github.com/winstonjs/winston)
- [Express Rate Limit Docs](https://express-rate-limit.mintlify.app/)

---

**Status**: ✅ Backend security and error handling infrastructure complete
**Next Phase**: Frontend performance optimizations and error boundaries
