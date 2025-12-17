const express = require("express");
const { logInValidate } = require("../schemas/request.schema");
const { validate } = require("../schemas/schema.validator");
const {
	loginUser,
	signUpUser,
	logout,
	linkedInAuth,
} = require("../controller/auth.controller");
const {
	createResumeData,
	getResumeData,
	createResumeDownload,
	uploadPreviousResumeFile,
	updateResumeTemplateId,
	// getResumeTemplateId,
} = require("../controller/createResume.controller");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/data", isAuthenticatedUser, getResumeData);
router.post("/data", isAuthenticatedUser, createResumeData);
router.post("/download", createResumeDownload);
router.patch(
	"/update-resume-template-id",
	isAuthenticatedUser,
	updateResumeTemplateId
);
// router.get("/resume-template-id", getResumeTemplateId);

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "../../previousResumeFile");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + file.originalname;
		cb(null, uniqueSuffix);
	},
});

const upload = multer({ storage: storage });
router.post(
	"/upload-previous-resume-file",
	isAuthenticatedUser,
	upload.single("file"),
	uploadPreviousResumeFile
);

module.exports = router;
