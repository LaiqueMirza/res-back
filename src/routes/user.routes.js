const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
const {db } = require("../../db/models/index");
router.get("/data", async (req, res) => {
try {
		const data = await db.query("SELECT * FROM users");

		return res.status(200).json({
			success: true,
			error: false,
			message: data.rows,
		});
} catch (error) {
	console.log(error);
}
   
});

module.exports = router;
