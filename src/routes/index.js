const express = require('express');
const router = express.Router();
const user = require('./user.routes');
const auth = require("./auth.routes");
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
];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;