/**
 * Security Middleware Configuration
 * Implements comprehensive security measures for the backend API
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const { validateEnv, isProduction } = require('../utils/validateEnv');

/**
 * Configure Helmet for security headers
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Rate limiting configuration
 */
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store rate limit info in memory (use Redis in production for distributed systems)
    // store: new RedisStore({ client: redisClient }),
  });
};

/**
 * API rate limiter - General API endpoints
 */
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

/**
 * Auth rate limiter - More strict for authentication endpoints
 */
const authLimiter = createRateLimiter(15 * 60 * 1000, 10); // 10 requests per 15 minutes

/**
 * Strict rate limiter - For sensitive operations
 */
const strictLimiter = createRateLimiter(60 * 60 * 1000, 5); // 5 requests per hour

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    const isDev = process.env.NODE_ENV === 'dev';
    const isProd = !isDev; // Everything else is treated as production
    
    // Determine allowed origins based on environment
    let allowedOrigins;
    if (isDev) {
      // Development - allow all origins from env or defaults
      allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:3000'];
    } else {
      // Production - allow both www and non-www domains
      allowedOrigins = ['https://resumaye.com', 'https://www.resumaye.com'];
    }
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || isDev) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

/**
 * Request sanitization middleware
 */
const sanitizeRequest = (req, res, next) => {
  // Remove any keys that start with $ or contain .
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  next();
};

/**
 * Security logging middleware
 */
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log suspicious patterns
  if (req.body && JSON.stringify(req.body).match(/(\$|<script|javascript:|onerror=)/i)) {
    console.warn(`⚠️  [${timestamp}] Suspicious request detected from ${ip}: ${method} ${url}`);
  }
  
  next();
};

/**
 * Request size limiter
 */
const requestSizeLimiter = require('express').json({
  limit: '10mb',
  verify: (req, res, buf) => {
    const size = buf.length;
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (size > maxSize) {
      throw new Error('Request entity too large');
    }
  }
});

module.exports = {
  helmetConfig,
  apiLimiter,
  authLimiter,
  strictLimiter,
  corsOptions,
  sanitizeRequest,
  securityLogger,
  requestSizeLimiter,
  cors: cors(corsOptions),
};
