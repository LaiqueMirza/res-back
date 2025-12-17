const fs = require("fs").promises;
const path = require("path");
const { parseResume } = require("../parser");

/**
 * Analyze resume for ATS compatibility
 * @param {string} userId - User ID
 * @param {string} experienceLevel - Experience level (junior, mid, senior)
 * @param {object} file - Uploaded file object from multer
 * @returns {object} Analysis result
 */
const analyzeResume = async (userId, experienceLevel, file) => {
	try {
		const filePath = file.path;
		const fileName = file.filename;

		console.log("Starting resume analysis...");
		console.log("File path:", filePath);

		// Parse the resume PDF and extract structured data
		const parsedResumeData = await parseResume(filePath, userId);

		console.log("Resume parsed successfully");
		console.log("Extracted sections:", {
			employment: parsedResumeData.employment,
			education: parsedResumeData.education,
			skills: parsedResumeData.skills,
			languages: parsedResumeData.languages,
			courses: parsedResumeData.courses,
		});

		// Calculate ATS score based on parsed data
		const atsScore = calculateATSScore(parsedResumeData, experienceLevel);

		// Build analysis result
		const analysisResult = {
			userId,
			experienceLevel,
			fileName,
			filePath,
			uploadedAt: new Date().toISOString(),
			atsScore,
			status: "analyzed",
			message: "Resume analyzed successfully",
			parsedData: parsedResumeData,
			recommendations: generateRecommendations(parsedResumeData, atsScore),
		};

		console.log("Resume analysis completed. ATS Score:", atsScore);

		// Optional: Delete the temporary file after analysis
		// await deleteResumeFile(filePath);

		return analysisResult;
	} catch (error) {
		console.error("Error in analyzeResume service:", error);
		throw new Error("Failed to analyze resume: " + error.message);
	}
};

/**
 * Calculate ATS score based on parsed resume data
 * @param {object} parsedData - Parsed resume data
 * @param {string} experienceLevel - Experience level
 * @returns {number} ATS score (0-100)
 */
function calculateATSScore(parsedData, experienceLevel) {
	let score = 0;

	// 1. Contact Information (15 points)
	if (parsedData.personalDetails.firstName) score += 3;
	if (parsedData.personalDetails.lastName) score += 3;
	if (parsedData.personalDetails.email) score += 5;
	if (parsedData.personalDetails.phone) score += 4;

	// 2. Employment History (25 points)
	if (parsedData.employment.length > 0) {
		score += 10;
		// Additional points for detailed entries
		const detailedEntries = parsedData.employment.filter(
			(job) => job.bullets && job.startDate && job.endDate
		);
		score += Math.min(detailedEntries.length * 3, 15);
	}

	// 3. Education (15 points)
	if (parsedData.education.length > 0) {
		score += 10;
		const detailedEducation = parsedData.education.filter(
			(edu) => edu.degree && edu.school
		);
		score += Math.min(detailedEducation.length * 2.5, 5);
	}

	// 4. Skills (20 points)
	if (parsedData.skills.length > 0) {
		score += 10;
		score += Math.min(parsedData.skills.length * 0.5, 10);
	}

	// 5. Profile Summary (10 points)
	if (
		parsedData.profileSummary.info &&
		parsedData.profileSummary.info.length > 50
	) {
		score += 10;
	} else if (parsedData.profileSummary.info) {
		score += 5;
	}

	// 6. Additional Sections (15 points)
	if (parsedData.languages.length > 0) score += 3;
	if (parsedData.courses.length > 0) score += 4;
	if (parsedData.certificates.length > 0) score += 4;
	if (parsedData.websitesAndSocialLinks.length > 0) score += 4;

	// Ensure score is within 0-100 range
	score = Math.min(Math.max(score, 0), 100);

	return Math.round(score);
}

/**
 * Generate recommendations based on parsed data and score
 * @param {object} parsedData - Parsed resume data
 * @param {number} score - ATS score
 * @returns {array} Array of recommendation strings
 */
function generateRecommendations(parsedData, score) {
	const recommendations = [];

	// Contact information recommendations
	if (!parsedData.personalDetails.email) {
		recommendations.push("Add a professional email address");
	}
	if (!parsedData.personalDetails.phone) {
		recommendations.push("Include a phone number for contact");
	}

	// Employment recommendations
	if (parsedData.employment.length === 0) {
		recommendations.push("Add work experience to strengthen your resume");
	} else {
		const withoutBullets = parsedData.employment.filter(
			(job) => !job.bullets || job.bullets.length < 50
		);
		if (withoutBullets.length > 0) {
			recommendations.push(
				"Add detailed descriptions and achievements for all work experiences"
			);
		}
	}

	// Education recommendations
	if (parsedData.education.length === 0) {
		recommendations.push("Add your educational background");
	}

	// Skills recommendations
	if (parsedData.skills.length < 5) {
		recommendations.push(
			"Add more relevant skills (aim for at least 8-10 skills)"
		);
	}

	// Profile summary recommendations
	if (
		!parsedData.profileSummary.info ||
		parsedData.profileSummary.info.length < 50
	) {
		recommendations.push(
			"Add a professional summary or objective statement (3-4 sentences)"
		);
	}

	// Additional sections recommendations
	if (parsedData.websitesAndSocialLinks.length === 0) {
		recommendations.push(
			"Add professional social links (LinkedIn, GitHub, portfolio)"
		);
	}

	if (parsedData.certificates.length === 0 && parsedData.courses.length === 0) {
		recommendations.push(
			"Consider adding relevant certifications or courses to stand out"
		);
	}

	// Overall recommendations based on score
	if (score < 60) {
		recommendations.unshift(
			"Your resume needs significant improvements to pass ATS systems"
		);
	} else if (score < 80) {
		recommendations.unshift("Your resume is good but has room for improvement");
	} else {
		recommendations.unshift("Your resume is well-optimized for ATS systems!");
	}

	return recommendations;
}

/**
 * Delete temporary resume file after analysis
 * @param {string} filePath - Path to the file
 */
const deleteResumeFile = async (filePath) => {
	try {
		await fs.unlink(filePath);
		console.log(`Deleted temporary file: ${filePath}`);
	} catch (error) {
		console.error(`Error deleting file ${filePath}:`, error);
		// Don't throw error, just log it
	}
};

/**
 * Get ATS analysis by ID (for future use)
 * @param {string} analysisId - Analysis ID
 */
const getAnalysisById = async (analysisId) => {
	// TODO: Implement fetching from database
	throw new Error("Not implemented yet");
};

module.exports = {
	analyzeResume,
	deleteResumeFile,
	getAnalysisById,
};
