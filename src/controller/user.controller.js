const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const commonService = require("../services/common.js");

// review pending for below code

// Get user profile
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Remove sensitive information
  const userProfile = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    mobile: user.mobile || "",
    profile_picture: user.profile_picture || "",
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  return res.status(200).json({
    success: true,
    error: false,
    message: "User profile fetched successfully",
    data: userProfile
  });
});

// Update user profile
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.user_id;
  const { name, mobile, profile_picture } = req.body;

  // Prepare update data
  const updateData = {
		updated_at: new Date(),
	};
  if (name) updateData.name = name;
  if (mobile) updateData.mobile = mobile;
  if (profile_picture) updateData.profile_picture = profile_picture;

  // Update user profile
  await commonService.update("user", updateData, { user_id: userId });

  // Get updated user profile
  const updatedUser = await commonService.findOne("user", { user_id: userId });

  // Remove sensitive information
  const userProfile = {
    user_id: updatedUser.user_id,
    name: updatedUser.name,
    email: updatedUser.email,
    mobile: updatedUser.mobile || "",
    profile_picture: updatedUser.profile_picture || "",
    updated_at: updatedUser.updated_at
  };

  return res.status(200).json({
    success: true,
    error: false,
    message: "User profile updated successfully",
    data: userProfile
  });
});