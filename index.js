// initiate a node js application with express js, dot env, cookie parser  and more
const express = require("express");
const app = express();
const dotenv = require("dotenv");
// Load environment file based on NODE_ENV
// Development uses .env.dev, everything else (production) uses .env
let envFile = ".env"; // Default to production

const isDev = process.env.NODE_ENV === "dev";
if (isDev) {
	envFile = `.env.dev`;
}

console.log(`Loading environment from: ${envFile}`);
console.log(
	`NODE_ENV: ${process.env.NODE_ENV} (${isDev ? "Development" : "Production"})`
);

dotenv.config({
	path: envFile,
});

console.log(
	`After loading env - GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET"}`
);
console.log(`After loading env - DB_HOST: ${process.env.DB_HOST}`);
console.log(`After loading env - PORT: ${process.env.PORT}`);

// Validate environment variables
require('./src/utils/validateEnv');

const cookieParser = require("cookie-parser");
const initDb = require("./db/models/index");
const path = require("path");
const googleAuthFun = require("./src/services/googleAuth.js");

// Import new middleware
const logger = require('./src/utils/logger');
const { 
	helmetConfig, 
	apiLimiter, 
	authLimiter,
	corsOptions,
	sanitizeRequest,
	securityLogger,
	requestSizeLimiter
} = require('./src/middleware/security');
const { 
	errorHandler, 
	notFoundHandler, 
	initializeErrorHandlers 
} = require('./src/middleware/errorHandler');

// Initialize global error handlers
initializeErrorHandlers();

// Security middleware
app.use(helmetConfig);
app.use(requestSizeLimiter);
app.use(securityLogger);

// Logging
const morgan = require('morgan');
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing
app.use(express.json({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Cookie parsing
app.use(cookieParser());

// CORS
const cors = require('cors');
app.use(cors(corsOptions));

// Request sanitization
app.use(sanitizeRequest);

// Static files
app.use("/previousResumeFile", express.static("previousResumeFile"));

// Google authentication
googleAuthFun(app);

// API routes with rate limiting
app.use("/v1", apiLimiter, require("./src/routes/index"));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, "0.0.0.0", async () => {
	logger.info(
		`Server is running on port ${PORT} and listening on all interfaces (0.0.0.0)`
	);
	try {
		await initDb().sequelize.sync({ alter: true });
		logger.info("Database synced and connected successfully");
	} catch (error) {
		logger.error("Database connection failed", {
			error: error.message,
			stack: error.stack,
		});
		process.exit(1);
	}
});

// Graceful shutdown handlers
process.on("unhandledRejection", (err) => {
	logger.error(`Unhandled Promise Rejection: ${err.message}`, {
		stack: err.stack,
	});
	logger.info(`Shutting down the server due to Unhandled Promise Rejection`);

	server.close(() => {
		process.exit(1);
	});
});

process.on("SIGTERM", () => {
	logger.info("SIGTERM signal received: closing HTTP server");
	server.close(() => {
		logger.info("HTTP server closed");
		process.exit(0);
	});
});

process.on("SIGINT", () => {
	logger.info("SIGINT signal received: closing HTTP server");
	server.close(() => {
		logger.info("HTTP server closed");
		process.exit(0);
	});
});
