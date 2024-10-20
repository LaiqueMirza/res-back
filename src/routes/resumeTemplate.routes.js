const express = require("express");
const { validate } = require("../schemas/schema.validator");

const {
	getResumeTemplates,
} = require("../controller/resumeTemplate.controller.js");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/data", isAuthenticatedUser, getResumeTemplates);
// router.post("/data", isAuthenticatedUser, createResumeData);

module.exports = router;
