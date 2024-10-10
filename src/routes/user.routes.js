const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
router.get("/data", async (req, res) => {
try {
	 const pool = require("../models/index");
		const data = await pool.query("SELECT * FROM users");

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
