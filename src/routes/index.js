const express = require('express');
const router = express.Router();
const health = require('./health.route');
const routes = [ 
    {
        path: '/',
        route: health
    }
]

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;