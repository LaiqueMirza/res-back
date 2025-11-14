const express = require("express");
const { logInValidate } = require("../schemas/request.schema");
const { validate } = require("../schemas/schema.validator");
const {
	loginUser,
	signUpUser,
	logout,
	linkedInAuth,
	getMe,
} = require("../controller/auth.controller");
const { authLimiter } = require("../middleware/security");
const { validators } = require("../middleware/validation");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const router = express.Router();

// Apply strict rate limiting to auth routes
router.use(authLimiter);

// Use new validation middleware alongside existing validation
router.post("/login", validators.login, validate(logInValidate), loginUser);
router.post(
	"/signup",
	validators.register,
	validate(logInValidate),
	signUpUser
);

router.get("/linkedin", linkedInAuth);
router.post("/logout", logout);

// Get current authenticated user
router.get("/me", isAuthenticatedUser, getMe);

module.exports = router;
