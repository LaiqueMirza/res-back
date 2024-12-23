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
} = require("../controller/createResume.controller");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/data", isAuthenticatedUser, getResumeData);
router.post("/data", isAuthenticatedUser, createResumeData);
router.post("/download", createResumeDownload);

const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./previousResumeFile");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + file.originalname;
		cb(null, uniqueSuffix);
	},
});

const upload = multer({ storage: storage });
router.post(
	"/upload-previous-resume-file",
	upload.single("file"),
	uploadPreviousResumeFile
);

module.exports = router;
