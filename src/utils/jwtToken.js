// Create Token and saving in cookie
const jwt = require("jsonwebtoken");

const sendToken = (payload, statusCode, res, message, providerAuth) => {
	const expires = new Date(
		Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
	);
	const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	// Detect environment and cross-origin scenarios
	const isProduction = process.env.NODE_ENV === "production";
	const allowCrossOrigin = process.env.ALLOW_CROSS_ORIGIN === "true";
	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

	// Determine if we're in a cross-origin scenario
	// Production: frontend on Vercel (HTTPS) + backend on localhost (HTTP) = cross-origin
	// Development: both on localhost = same-origin
	const isCrossOrigin =
		allowCrossOrigin || (isProduction && frontendUrl.includes("vercel.app"));

	// Cookie options based on environment
	const options = {
		expires,
		httpOnly: false, // Allow JavaScript access to the cookie
		sameSite: isCrossOrigin ? "none" : "lax",
		// secure must be true with sameSite: 'none' BUT this only works if backend is HTTPS
		// For localhost backend with Vercel frontend, cookies won't work - use response body token instead
		secure: isCrossOrigin && isProduction, // Only true if both backend and frontend are HTTPS
		path: "/",
	};

	if (providerAuth) {
		return res
			.cookie("token", token, options)
			.redirect(`${frontendUrl}/create-resume`);
	}
	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		error: false,
		message,
		token, // Include token in response body as fallback
	});
};

module.exports = sendToken;
