module.exports = googleAuthFun = (app) => {
	const session = require("express-session");
    const passport = require("passport");
    const commonService = require("../services/common.js");
	const OAuth2Strategy = require("passport-google-oauth2").Strategy;

	// setup session
	app.use(
		session({
			secret: process.env.GOOGLE_SESSION_KEY_SECRET_CREATED,
			resave: false,
			saveUninitialized: true,
		})
	);

	// setuppassport
	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(
		new OAuth2Strategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: "/auth/google/callback",
				scope: ["profile", "email"],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					console.log(accessToken, refreshToken, profile, done);
					console.log(
						"profile",
						profile.email,
						profile.given_name,
						profile.picture
					);
					let user = await commonService.findOne("user", {
						email: profile.email,
					});
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
					}

					return done(null, user);
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	app.get(
		"/auth/google",
		passport.authenticate("google", { scope: ["profile", "email"] })
	);

	app.get(
		"/auth/google/callback",
		passport.authenticate("google", {
			successRedirect: "http://localhost:3000/create-resume",
			failureRedirect: "http://localhost:3000/login",
		})
	);
};
