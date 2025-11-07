/**
 * Environment Variable Validator for Backend
 * Ensures all required environment variables are present
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT',
  'FRONTEND_URL',
];

const optionalEnvVars = [
  'REDIS_URL',
  'SENTRY_DSN',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
];

/**
 * Validates all required environment variables
 * @throws {Error} If any required variable is missing
 */
function validateEnv() {
  const missing = [];
  
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `\n❌ Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env file and ensure all required variables are set.\n` +
      `See .env.example for reference.\n`
    );
  }

  // Validate specific formats
  validateDatabaseUrl();
  validatePort();
  validateJwtSecrets();
  validateUrls();

  console.log('✅ Environment variables validated successfully');
  
  // Warn about missing optional variables
  const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Optional environment variables not set:\n${missingOptional.map(v => `  - ${v}`).join('\n')}`);
  }

  return true;
}

/**
 * Validate database URL format
 */
function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }
}

/**
 * Validate port is a number
 */
function validatePort() {
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid number between 1 and 65535');
  }
}

/**
 * Validate JWT secrets are strong enough
 */
function validateJwtSecrets() {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (jwtSecret.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
  }
  
  if (refreshSecret.length < 32) {
    console.warn('⚠️  JWT_REFRESH_SECRET should be at least 32 characters long');
  }
  
  if (jwtSecret === refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }
  
  // Check for default/example values in production
  if (process.env.NODE_ENV === 'production') {
    if (jwtSecret.includes('change-this') || jwtSecret.includes('example')) {
      throw new Error('❌ Please change JWT_SECRET from the example value before deploying to production');
    }
  }
}

/**
 * Validate URL formats
 */
function validateUrls() {
  const frontendUrl = process.env.FRONTEND_URL;
  
  try {
    new URL(frontendUrl);
  } catch (error) {
    throw new Error('FRONTEND_URL must be a valid URL');
  }
}

/**
 * Get environment variable with type checking
 */
function getEnvVar(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined && defaultValue === null) {
    throw new Error(`Environment variable ${key} is not set and has no default value`);
  }
  return value || defaultValue;
}

/**
 * Check if running in production
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

module.exports = {
  validateEnv,
  getEnvVar,
  isProduction,
  isDevelopment,
};
