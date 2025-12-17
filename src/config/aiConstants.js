/**
 * Application Constants
 * Centralized configuration for models, settings, and enums
 */

// ===========================
// AI Models Configuration
// ===========================

/**
 * Available Gemini Models
 * All models available with your $300 credit API key
 */
const GEMINI_MODELS = {
	// ===== PREMIUM MODELS (Best Quality) =====
	PRO_2_5: "gemini-2.5-pro",              // Latest Pro - Most accurate, supports thinking mode
	
	// ===== BALANCED MODELS (Recommended) =====
	FLASH_2_5: "gemini-2.5-flash",          // Latest Flash - Best balance of speed/quality, 65K output
	FLASH_2_0: "gemini-2.0-flash",          // Stable 2.0 Flash - Fast, 8K output
	FLASH_2_0_001: "gemini-2.0-flash-001",  // Versioned 2.0 Flash - Stable release
	
	// ===== LIGHTWEIGHT MODELS (Fastest) =====
	FLASH_LITE_2_5: "gemini-2.5-flash-lite",      // Latest Lite - Fastest, 65K output, thinking mode
	FLASH_LITE_2_0: "gemini-2.0-flash-lite",      // 2.0 Lite - Fast, 8K output
	FLASH_LITE_2_0_001: "gemini-2.0-flash-lite-001", // Versioned 2.0 Lite - Stable
};

/**
 * Current Active Model for Resume Parsing
 * Change this to switch between models
 * 
 * Recommendations:
 * - GEMINI_MODELS.FLASH_2_5 (Best overall - Fast, accurate, 65K output, thinking mode)
 * - GEMINI_MODELS.PRO_2_5 (Most accurate - Use for complex resumes, 11x cost)
 * - GEMINI_MODELS.FLASH_LITE_2_5 (Fastest - 50% cheaper, still has thinking mode)
 */
const ACTIVE_GEMINI_MODEL = GEMINI_MODELS.FLASH_2_5;

/**
 * All available models as array (for reference/validation)
 */
const AVAILABLE_GEMINI_MODELS = Object.values(GEMINI_MODELS);

/**
 * Model Pricing (per 1 million tokens - approximate)
 * Based on Google Cloud pricing as of December 2025
 */
const GEMINI_MODEL_PRICING = {
	[GEMINI_MODELS.PRO_2_5]: {
		input: 3.50,
		output: 10.50,
		description: "Most powerful - Best for complex/poorly formatted resumes",
	},
	[GEMINI_MODELS.FLASH_2_5]: {
		input: 0.30,
		output: 1.20,
		description: "Recommended - Fast, accurate, 65K output, thinking mode",
	},
	[GEMINI_MODELS.FLASH_2_0]: {
		input: 0.30,
		output: 1.20,
		description: "Stable 2.0 - Good for standard resumes, 8K output limit",
	},
	[GEMINI_MODELS.FLASH_2_0_001]: {
		input: 0.30,
		output: 1.20,
		description: "Versioned 2.0 Flash - Locked stable release",
	},
	[GEMINI_MODELS.FLASH_LITE_2_5]: {
		input: 0.15,
		output: 0.60,
		description: "Fastest - 50% cheaper, supports thinking mode, 65K output",
	},
	[GEMINI_MODELS.FLASH_LITE_2_0]: {
		input: 0.15,
		output: 0.60,
		description: "Fast & cheap - Good for simple resumes, 8K output",
	},
	[GEMINI_MODELS.FLASH_LITE_2_0_001]: {
		input: 0.15,
		output: 0.60,
		description: "Versioned 2.0 Lite - Locked stable release",
	},
};

/**
 * Model Capabilities
 * Technical specifications for each model
 */
const GEMINI_MODEL_CAPABILITIES = {
	[GEMINI_MODELS.PRO_2_5]: {
		maxInputTokens: 1048576,   // 1M tokens
		maxOutputTokens: 65536,    // 65K tokens
		supportsThinking: true,
		supportsJSON: true,
		version: "2.5",
		released: "June 2025",
	},
	[GEMINI_MODELS.FLASH_2_5]: {
		maxInputTokens: 1048576,
		maxOutputTokens: 65536,
		supportsThinking: true,
		supportsJSON: true,
		version: "2.5",
		released: "June 2025",
	},
	[GEMINI_MODELS.FLASH_2_0]: {
		maxInputTokens: 1048576,
		maxOutputTokens: 8192,     // 8K tokens only
		supportsThinking: false,
		supportsJSON: true,
		version: "2.0",
		released: "January 2025",
	},
	[GEMINI_MODELS.FLASH_2_0_001]: {
		maxInputTokens: 1048576,
		maxOutputTokens: 8192,
		supportsThinking: false,
		supportsJSON: true,
		version: "2.0",
		released: "January 2025",
	},
	[GEMINI_MODELS.FLASH_LITE_2_5]: {
		maxInputTokens: 1048576,
		maxOutputTokens: 65536,
		supportsThinking: true,
		supportsJSON: true,
		version: "2.5",
		released: "July 2025",
	},
	[GEMINI_MODELS.FLASH_LITE_2_0]: {
		maxInputTokens: 1048576,
		maxOutputTokens: 8192,
		supportsThinking: false,
		supportsJSON: true,
		version: "2.0",
		released: "January 2025",
	},
	[GEMINI_MODELS.FLASH_LITE_2_0_001]: {
		maxInputTokens: 1048576,
		maxOutputTokens: 8192,
		supportsThinking: false,
		supportsJSON: true,
		version: "2.0",
		released: "January 2025",
	},
};

// ===========================
// OpenAI Models (Commented - for future use)
// ===========================

/*
const OPENAI_MODELS = {
	GPT_4O_MINI: "gpt-4o-mini",
	GPT_4O: "gpt-4o",
	GPT_4_TURBO: "gpt-4-turbo",
};

const ACTIVE_OPENAI_MODEL = OPENAI_MODELS.GPT_4O_MINI;
*/

// ===========================
// AI Service Configuration
// ===========================

const AI_CONFIG = {
	// Temperature (0.0 - 2.0)
	// Lower = more deterministic, Higher = more creative
	TEMPERATURE: 0.2,
	
	// Max retries on API failure
	MAX_RETRIES: 3,
	
	// Timeout in milliseconds
	TIMEOUT: 60000, // 60 seconds
	
	// Whether to log full responses (disable in production)
	LOG_RESPONSES: process.env.NODE_ENV === "dev",
};

// ===========================
// Exports
// ===========================

module.exports = {
	// Gemini Models
	GEMINI_MODELS,
	ACTIVE_GEMINI_MODEL,
	AVAILABLE_GEMINI_MODELS,
	GEMINI_MODEL_PRICING,
	GEMINI_MODEL_CAPABILITIES,
	
	// OpenAI Models (commented)
	// OPENAI_MODELS,
	// ACTIVE_OPENAI_MODEL,
	
	// AI Configuration
	AI_CONFIG,
};
