const atsService = require("../services/ats.service.js");

/**
 * Analyze resume for ATS score
 * @route POST /v1/ats/analyze
 * @access Private
 */
const analyzeResume = async (req, res) => {
	try {
		const userId = req.user.user_id;
		const { experienceLevel } = req.body;
		const file = req.file;

		// Validate required fields
		if (!file) {
			return res.status(400).json({
				success: false,
				message: "Resume file is required",
			});
		}

		if (!experienceLevel) {
			return res.status(400).json({
				success: false,
				message: "Experience level is required",
			});
		}

		// Validate experience level
		const validLevels = ["junior", "mid", "senior"];
		if (!validLevels.includes(experienceLevel)) {
			return res.status(400).json({
				success: false,
				message: "Invalid experience level. Must be: junior, mid, or senior",
			});
		}

		// Analyze the resume
		const analysisResult = await atsService.analyzeResume(
			userId,
			experienceLevel,
			file
		);

		return res.status(200).json({
			success: true,
			message: "Resume analyzed successfully",
			data: analysisResult,
		});
	} catch (error) {
		console.error("Error in analyzeResume controller:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to analyze resume",
		});
	}
};

module.exports = {
	analyzeResume,
};
