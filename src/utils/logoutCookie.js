// Utility function for logout cookie options
const getLogoutCookieOptions = () => {
	const isDev = process.env.NODE_ENV === 'dev';
	const isProd = !isDev; // Everything else is treated as production
	
	if (isDev) {
		// Development: localhost to localhost
		return {
			expires: new Date(Date.now()),
			httpOnly: false,          // Allow JS access for development
			secure: false,            // HTTP localhost
			sameSite: 'lax',          // Same-site for localhost
			path: "/",
		};
	} else {
		// Production: HTTPS to HTTPS, same domain (.resumaye.com)
		return {
			expires: new Date(Date.now()),
			httpOnly: true,           // Secure for production
			secure: true,             // HTTPS required
			sameSite: 'none',         // Cross-site cookies for subdomain
			domain: '.resumaye.com',  // Allow sharing between subdomains
			path: "/",
		};
	}
};

module.exports = getLogoutCookieOptions;