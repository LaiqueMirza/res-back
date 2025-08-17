const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
const { db } = require("../../db/models/index");
const { isAuthenticatedUser } = require("../middleware/auth.middleware");
const { getUserProfile, updateUserProfile } = require("../controller/user.controller");

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

// User profile routes
router.get("/profile", isAuthenticatedUser, getUserProfile);
router.put("/profile", isAuthenticatedUser, updateUserProfile);

module.exports = router;
