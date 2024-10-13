const express = require("express");
const { logInValidate } = require("../schemas/request.schema");
const { validate } = require("../schemas/schema.validator");
const {
	loginUser,
	signUpUser,
	logout,
	linkedInAuth,
} = require("../controller/auth.controller");
const router = express.Router();

router.post("/login", validate(logInValidate), loginUser);
router.post("/signup", validate(logInValidate), signUpUser);

router.get("/linkedin", linkedInAuth);
router.post("/logout", logout);

module.exports = router;
