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
} = require("../controller/createResume.controller");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/data", isAuthenticatedUser, getResumeData);
router.post("/data", isAuthenticatedUser, createResumeData);
router.post("/download", createResumeDownload);

module.exports = router;
