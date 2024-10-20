const express = require('express');
const router = express.Router();
const user = require('./user.routes');
const auth = require("./auth.routes");
const createResume = require("./createResume.routes.js");
const resumeTemplate = require("./resumeTemplate.routes.js");
const health = require("./health.routes");
const routes = [
	{
		path: "/",
		route: health,
	},
	{
		path: "/user",
		route: user,
	},
	{
		path: "/auth",
		route: auth,
	},
	{
		path: "/create-resume",
		route: createResume,
	},

	{
		path: "/resume-template",
		route: resumeTemplate,
	},
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;