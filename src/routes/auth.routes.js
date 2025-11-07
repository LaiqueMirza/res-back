const express = require("express");
const { logInValidate } = require("../schemas/request.schema");
const { validate } = require("../schemas/schema.validator");
const {
	loginUser,
	signUpUser,
	logout,
	linkedInAuth,
} = require("../controller/auth.controller");
const { authLimiter } = require("../middleware/security");
const { validators } = require("../middleware/validation");
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

module.exports = router;
