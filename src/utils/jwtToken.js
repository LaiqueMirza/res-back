// Create Token and saving in cookie
const jwt = require("jsonwebtoken");

const sendToken = (payload, statusCode, res, message, providerAuth) => {
	const expires = new Date(
		Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
	);
	const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	// options for cookie
	const options = {
		expires,
		httpOnly: false,
		sameSite: "lax",
		secure: false,
	};
	if(providerAuth){
		return res.cookie("token", token, options).redirect("http://localhost:3000/create-resume")
	}
	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		error: false,
		message,
	});
};

module.exports = sendToken;
