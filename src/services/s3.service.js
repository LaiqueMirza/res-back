/**
 * AWS S3 Service for file uploads and retrieval
 * Handles storing resume files in S3 bucket
 */

const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");

// Configure AWS S3
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_USER_ACCESS_KEY,
	secretAccessKey: process.env.AWS_USER_SECRET_KEY,
	region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "resumaye-user-resumes";

/**
 * Upload file to S3
 * @param {string} filePath - Path to the file to upload
 * @param {number} userId - User ID for organizing files
 * @param {string} fileName - Original file name
 * @returns {Promise<string>} S3 file key (path)
 */
async function uploadResumeToS3(filePath, userId, fileName) {
	try {
		// Check if file exists
		if (!fs.existsSync(filePath)) {
			throw new Error(`File not found: ${filePath}`);
		}

		// Read file from disk
		const fileContent = fs.readFileSync(filePath);

		// Generate S3 key with user ID folder structure
		// Format: resumes/{userId}/{timestamp}-{originalFileName}
		const timestamp = Date.now();
		const cleanFileName = fileName
			.replace(/[^a-zA-Z0-9.-]/g, "_")
			.toLowerCase();
		const s3Key = `resumes/${userId}/${timestamp}-${cleanFileName}`;

		// S3 upload parameters
		const uploadParams = {
			Bucket: BUCKET_NAME,
			Key: s3Key,
			Body: fileContent,
			ContentType: "application/pdf",
			Metadata: {
				userId: String(userId),
				uploadedAt: new Date().toISOString(),
				originalFileName: fileName,
			},
		};

		console.log(`Uploading file to S3: ${s3Key}`);

		// Upload to S3
		const result = await s3.upload(uploadParams).promise();

		console.log(`File uploaded successfully to S3: ${result.Location}`);

		// Return S3 file key for database storage
		return {
			s3Key: s3Key,
			s3Url: result.Location,
			s3Etag: result.ETag,
		};
	} catch (error) {
		console.error("Error uploading file to S3:", error);
		throw new Error(`Failed to upload file to S3: ${error.message}`);
	}
}

/**
 * Get presigned URL for downloading file from S3
 * @param {string} s3Key - S3 file key
 * @param {number} expirationSeconds - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Presigned download URL
 */
async function getPresignedDownloadUrl(s3Key, expirationSeconds = 3600) {
	try {
		const params = {
			Bucket: BUCKET_NAME,
			Key: s3Key,
			Expires: expirationSeconds,
		};

		console.log(`Generating presigned URL for: ${s3Key}`);
		const presignedUrl = await s3.getSignedUrlPromise("getObject", params);

		console.log("Presigned URL generated successfully");
		return presignedUrl;
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		throw new Error(
			`Failed to generate presigned download URL: ${error.message}`
		);
	}
}

/**
 * Download file from S3 to local temp directory
 * @param {string} s3Key - S3 file key
 * @returns {Promise<string>} Path to downloaded file in temp directory
 */
async function downloadResumeFromS3(s3Key) {
	try {
		const params = {
			Bucket: BUCKET_NAME,
			Key: s3Key,
		};

		console.log(`Downloading file from S3: ${s3Key}`);

		const data = await s3.getObject(params).promise();

		// Save to temporary location
		const tempDir = path.join(__dirname, "../../temp");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		const fileName = path.basename(s3Key);
		const localFilePath = path.join(tempDir, fileName);

		fs.writeFileSync(localFilePath, data.Body);

		console.log(`File downloaded to: ${localFilePath}`);
		return localFilePath;
	} catch (error) {
		console.error("Error downloading file from S3:", error);
		throw new Error(`Failed to download file from S3: ${error.message}`);
	}
}

/**
 * Delete file from S3
 * @param {string} s3Key - S3 file key
 * @returns {Promise<void>}
 */
async function deleteResumeFromS3(s3Key) {
	try {
		const params = {
			Bucket: BUCKET_NAME,
			Key: s3Key,
		};

		console.log(`Deleting file from S3: ${s3Key}`);

		await s3.deleteObject(params).promise();

		console.log("File deleted successfully from S3");
	} catch (error) {
		console.error("Error deleting file from S3:", error);
		throw new Error(`Failed to delete file from S3: ${error.message}`);
	}
}

/**
 * Get file info from S3
 * @param {string} s3Key - S3 file key
 * @returns {Promise<object>} File metadata
 */
async function getResumeFileInfo(s3Key) {
	try {
		const params = {
			Bucket: BUCKET_NAME,
			Key: s3Key,
		};

		console.log(`Getting file info from S3: ${s3Key}`);

		const metadata = await s3.headObject(params).promise();

		return {
			size: metadata.ContentLength,
			contentType: metadata.ContentType,
			lastModified: metadata.LastModified,
			etag: metadata.ETag,
			metadata: metadata.Metadata,
		};
	} catch (error) {
		console.error("Error getting file info from S3:", error);
		throw new Error(`Failed to get file info from S3: ${error.message}`);
	}
}

/**
 * List all resumes for a user in S3
 * @param {number} userId - User ID
 * @returns {Promise<array>} List of files for user
 */
async function listUserResumes(userId) {
	try {
		const params = {
			Bucket: BUCKET_NAME,
			Prefix: `resumes/${userId}/`,
		};

		console.log(`Listing resumes for user: ${userId}`);

		const data = await s3.listObjectsV2(params).promise();

		if (!data.Contents) {
			return [];
		}

		return data.Contents.map((obj) => ({
			key: obj.Key,
			size: obj.Size,
			lastModified: obj.LastModified,
			fileName: path.basename(obj.Key),
		}));
	} catch (error) {
		console.error("Error listing user resumes from S3:", error);
		throw new Error(`Failed to list user resumes: ${error.message}`);
	}
}

module.exports = {
	uploadResumeToS3,
	getPresignedDownloadUrl,
	downloadResumeFromS3,
	deleteResumeFromS3,
	getResumeFileInfo,
	listUserResumes,
};
