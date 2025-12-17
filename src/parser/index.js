/**
 * Main Resume Parser
 * Orchestrates PDF reading, text extraction, and section parsing
 */

const pdf = require("pdf-parse");
const fs = require("fs").promises;

// Import AI service
const { parseResumeWithGemini } = require("../services/openai.service");
// const { parseResumeWithOpenAI } = require("../services/openai.service"); // Commented - keeping for future use

// Import utilities
const { cleanText } = require("./utils/cleanText");
const {
	validateResumeObject,
} = require("./buildFinalObject");

// Import database service
const commonService = require("../services/common");

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(filePath) {
	try {
		const dataBuffer = await fs.readFile(filePath);
		const data = await pdf(dataBuffer);
		return data.text;
	} catch (error) {
		console.error("Error extracting text from PDF:", error);
		throw new Error("Failed to extract text from PDF: " + error.message);
	}
}

/**
 * Main resume parsing function using Gemini AI
 * @param {string} filePath - Path to PDF file
 * @param {number} user_id - User ID for storing the resume
 * @param {boolean} isReplacedData - If true, update existing resume data; if false, only insert if no data exists
 * @returns {Promise<object>} Parsed resume object
 */
async function parseResume(filePath, user_id, isReplacedData = false) {
	try {
		console.log("Starting resume parsing for:", filePath);

		// Step 1: Extract text from PDF
		const rawText = await extractTextFromPDF(filePath);
		console.log(`Extracted ${rawText.length} characters from PDF`);

		if (!rawText || rawText.trim().length === 0) {
			throw new Error("No text could be extracted from the PDF");
		}

		// Step 2: Clean and normalize text
		const cleanedText = cleanText(rawText);
		console.log(`Cleaned text to ${cleanedText.length} characters`);

		// Step 3: Use Gemini to parse the resume
		let parsedData = await parseResumeWithGemini(cleanedText);

		// Step 4: Validate and sanitize the result
		parsedData = validateResumeObject(parsedData);

		console.log("Resume parsing completed successfully");

		// Step 5: Save parsed data to resume table
		if (user_id) {
			try {
				// Check if resume already exists for this user
				const existingResume = await commonService.findOne(
					"resume",
					{ user_id: user_id },
					["resume_id"]
				);

				if (!existingResume) {
					// Insert if no resume exists for this user
					const resumeRecord = await commonService.create("resume", {
						user_id: user_id,
						title: null,
						resume_data: parsedData,
						resume_template_id: 1,
						ats_score: null,
					});
					console.log("Resume data inserted to database successfully");
				} else if (isReplacedData) {
					// Update existing resume data only if isReplacedData is true
					const [affectedRows] = await commonService.update(
						"resume",
						{
							resume_data: parsedData,
							updated_at: new Date(),
						},
						{ user_id: user_id }
					);
					if (affectedRows > 0) {
						console.log("Resume data updated in database successfully");
					}
				} else {
					console.log(
						"Resume already exists for user_id:",
						user_id,
						". Ignoring insert."
					);
				}
			} catch (dbError) {
				console.error("Error saving resume to database:", dbError);
				// Log the error but don't fail the parsing - return the parsed data anyway
				console.warn("Continuing without saving to database");
			}
		}

		return parsedData;
	} catch (error) {
		console.error("Error parsing resume:", error);
		throw new Error("Resume parsing failed: " + error.message);
	}
}

module.exports = {
	parseResume,
	extractTextFromPDF,
};
