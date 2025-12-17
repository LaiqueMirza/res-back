const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const { analyzeResume } = require("../controller/ats.controller");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Create ats-files directory if it doesn't exist
const atsFilesDir = "./ats-files";
if (!fs.existsSync(atsFilesDir)) {
	fs.mkdirSync(atsFilesDir, { recursive: true });
}

// Configure multer storage for ATS PDF uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, atsFilesDir);
	},
	filename: function (req, file, cb) {
		// Generate random ID and append to filename
		const randomId = crypto.randomBytes(16).toString("hex");
		const fileExtension = path.extname(file.originalname);
		const originalName = path.basename(file.originalname, fileExtension);
		const uniqueFilename = `${originalName}-${randomId}${fileExtension}`;
		cb(null, uniqueFilename);
	},
});

// File filter to only accept PDFs
const fileFilter = (req, file, cb) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Only PDF files are allowed"), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// POST /v1/ats/analyze - Analyze resume for ATS score
router.post(
	"/analyze",
	isAuthenticatedUser,
	upload.single("file"),
	analyzeResume
);

module.exports = router;
