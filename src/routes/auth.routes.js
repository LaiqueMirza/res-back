const express = require("express");
const router = express.Router();



router.get("/login/sucess", async (req, res) => {
	if (req.user) {
		res.status(200).json({ message: "user Login", user: req.user });
	} else {
		res.status(400).json({ message: "Not Authorized" });
	}
});

router.get("/logout", (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect("http://localhost:3001");
	});
});

module.exports = router;
