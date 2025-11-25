const sendToken = require("../utils/jwtToken.js");

module.exports = googleAuthFun = (app) => {
	const session = require("express-session");
	const passport = require("passport");
	const commonService = require("../services/common.js");
	const OAuth2Strategy = require("passport-google-oauth2").Strategy;

	// If the app is behind a proxy (load balancer / TLS terminator), enable trust proxy
	// so Express can correctly determine the original protocol (http/https).
	if (typeof app.set === "function") {
		app.set("trust proxy", true);
	}

	// setup session
	app.use(
		session({
			secret: process.env.GOOGLE_SESSION_KEY_SECRET_CREATED,
			resave: false,
			saveUninitialized: true,
		})
	);

	// set up passport
	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(
		new OAuth2Strategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/v1/auth/google/callback",
				scope: ["profile", "email"],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					console.log(accessToken, refreshToken, profile, done);
					console.log(
						"profile",
						profile.email,
						profile.given_name,
						profile.picture,
						profile.id,
						profile.provider
					);
					let user = await commonService.findOne("user", {
						email: profile.email,
					});
					let statusCode = 200;
					let message = "Successfully Logged In";
					console.log(user);
					if (!user) {
						user = await commonService.create("user", {
							name: profile.given_name,
							email: profile.email,
							image: profile.picture,
							auth_through: {
								provider: "google",
								provider_id: profile.id,
							},
						});
						statusCode = 201;
						message = "Successfully Signed Up";
					}

					// Pass the user and statusCode to the next middleware
					return done(null, { user, statusCode, message });
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);

	passport.serializeUser((data, done) => {
		done(null, data);
	});

	passport.deserializeUser((data, done) => {
		done(null, data);
	});

	// Route for Google authentication
	app.get(
		"/v1/auth/google",
		passport.authenticate("google", { scope: ["profile", "email"] })
	);

	// Middleware for Google OAuth callback
	app.get(
		"/v1/auth/google/callback",
		passport.authenticate("google", {
			session: false,
			failureRedirect: process.env.FRONTEND_URL
				? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/login`
				: "http://localhost:3000/login",
		}),
		async (req, res) => {
			// Access the user, statusCode, and message from req.user
			const { user, statusCode, message } = req.user;

			// Call sendToken to set the cookie and send the response
			return await sendToken(
				{
					id: user.user_id,
				},
				statusCode,
				res,
				message,
				true
			);
		}
	);
};
