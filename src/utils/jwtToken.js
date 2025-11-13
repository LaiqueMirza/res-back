// Create Token and saving in cookie
const jwt = require("jsonwebtoken");

const sendToken = (payload, statusCode, res, message, providerAuth) => {
	const expires = new Date(
		Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
	);
	const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_EXPIRE,
	});

	// Detect environment and determine cookie configuration
	const isDev = process.env.NODE_ENV === "dev";
	const isProd = !isDev; // Everything else is treated as production

	// Cookie options based on environment
	let options;

	if (isDev) {
		// Development: localhost to localhost
		options = {
			expires,
			httpOnly: false, // Allow JS access for development
			secure: false, // HTTP localhost
			sameSite: "lax", // Same-site for localhost
			path: "/",
		};
	} else {
		// Production: HTTPS to HTTPS, same domain (.resumaye.com)
		options = {
			expires,
			httpOnly: true, // Secure for production
			secure: true, // HTTPS required
			sameSite: "none", // Cross-site cookies for subdomain
			domain: ".resumaye.com", // Allow sharing between subdomains
			path: "/",
		};
	}

	const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

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
