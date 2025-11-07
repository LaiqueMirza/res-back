// initiate a node js application with express js, dot env, cookie parser  and more
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
	path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env.dev",
});

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
const server = app.listen(PORT, async () => {
	logger.info(`Server is running on port ${PORT}`);
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
