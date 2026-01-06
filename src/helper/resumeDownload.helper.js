/**
 * Helper utilities for serving resumes via GET API
 * Used to retrieve and serve resume files from S3
 */

const s3Service = require("../services/s3.service");
const commonService = require("../services/common");

/**
 * Get resume file for user and serve as download
 * @param {number} userId - User ID
 * @returns {Promise<object>} {s3Url, presignedUrl, fileName}
 */
async function getUserResumeForDownload(userId) {
	try {
		console.log(`Fetching resume for user: ${userId}`);

		// Get resume record from database
		const resume = await commonService.findOne(
			"resume",
			{ user_id: userId },
			["resume_id", "s3_file_key", "s3_file_url", "created_at"]
		);

		if (!resume) {
			throw new Error("No resume found for this user");
		}

		if (!resume.s3_file_key) {
			throw new Error("Resume file is not stored in S3");
		}

		console.log(`Resume found. S3 key: ${resume.s3_file_key}`);

		// Generate presigned URL for downloading (valid for 1 hour)
		const presignedUrl = await s3Service.getPresignedDownloadUrl(
			resume.s3_file_key,
			3600
		);

		return {
			success: true,
			resumeId: resume.resume_id,
			s3FileKey: resume.s3_file_key,
			s3Url: resume.s3_file_url,
			presignedUrl: presignedUrl,
			uploadedAt: resume.created_at,
			message: "Resume download link generated successfully",
		};
	} catch (error) {
		console.error("Error getting resume for download:", error);
		throw new Error("Failed to get resume: " + error.message);
	}
}

/**
 * List all resumes for a user
 * @param {number} userId - User ID
 * @returns {Promise<array>} List of resume files
 */
async function listUserResumes(userId) {
	try {
		console.log(`Listing resumes for user: ${userId}`);

		// Get resume records from database
		const resumes = await commonService.findAll(
			"resume",
			{ user_id: userId },
			["resume_id", "s3_file_key", "s3_file_url", "title", "ats_score", "created_at", "updated_at"]
		);

		if (!resumes || resumes.length === 0) {
			return {
				success: true,
				resumes: [],
				message: "No resumes found for this user",
			};
		}

		// For each resume, generate presigned URL
		const resumeList = await Promise.all(
			resumes.map(async (resume) => {
				let presignedUrl = null;
				if (resume.s3_file_key) {
					try {
						presignedUrl = await s3Service.getPresignedDownloadUrl(
							resume.s3_file_key,
							3600
						);
					} catch (error) {
						console.warn(`Could not generate presigned URL for ${resume.s3_file_key}:`, error.message);
					}
				}

				return {
					resumeId: resume.resume_id,
					s3FileKey: resume.s3_file_key,
					s3Url: resume.s3_file_url,
					presignedUrl: presignedUrl,
					title: resume.title,
					atsScore: resume.ats_score,
					createdAt: resume.created_at,
					updatedAt: resume.updated_at,
				};
			})
		);

		return {
			success: true,
			resumes: resumeList,
			totalCount: resumeList.length,
			message: "Resumes fetched successfully",
		};
	} catch (error) {
		console.error("Error listing user resumes:", error);
		throw new Error("Failed to list resumes: " + error.message);
	}
}

/**
 * Get resume file info (size, type, etc)
 * @param {number} userId - User ID
 * @returns {Promise<object>} File metadata
 */
async function getResumeFileInfo(userId) {
	try {
		console.log(`Getting resume file info for user: ${userId}`);

		// Get resume record from database
		const resume = await commonService.findOne(
			"resume",
			{ user_id: userId },
			["resume_id", "s3_file_key", "created_at"]
		);

		if (!resume) {
			throw new Error("No resume found for this user");
		}

		if (!resume.s3_file_key) {
			throw new Error("Resume file is not stored in S3");
		}

		// Get file info from S3
		const fileInfo = await s3Service.getResumeFileInfo(resume.s3_file_key);

		return {
			success: true,
			resumeId: resume.resume_id,
			s3FileKey: resume.s3_file_key,
			fileSize: fileInfo.size,
			contentType: fileInfo.contentType,
			lastModified: fileInfo.lastModified,
			uploadedAt: resume.created_at,
			message: "File info retrieved successfully",
		};
	} catch (error) {
		console.error("Error getting resume file info:", error);
		throw new Error("Failed to get file info: " + error.message);
	}
}

module.exports = {
	getUserResumeForDownload,
	listUserResumes,
	getResumeFileInfo,
};
