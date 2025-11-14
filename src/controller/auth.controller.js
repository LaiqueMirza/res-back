const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs"); // Import bcryptjs
const commonService = require("../services/common.js");
const error = require("../middleware/error.js");
const getLogoutCookieOptions = require("../utils/logoutCookie");
const {
	getAccessToken,
	callMeAPI,
	callEmailAPI,
} = require("../helper/auth.helper.js");
// const crypto = require("crypto");

// signUp a User

exports.signUpUser = catchAsyncErrors(async (req, res, next) => {
	console.log(req.cookies.token);
	const { name, email, password } = req.body;
	const alreadyUser = await commonService.findOne("user", { email });
	if (alreadyUser) {
		const isPasswordMatched = await bcrypt.compare(
			password,
			alreadyUser.password
		);
		if (!isPasswordMatched) {
			return next(
				new ErrorHander(
					"The email is already registered, But the password provided is incorrect",
					401
				)
			);
		}
		return await sendToken(
			{
				id: alreadyUser.user_id,
			},
			200,
			res,
			"You have been logged in, as you had an account"
		);
	}

	const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds, you can adjust it
	const user = await commonService.create("user", {
		name,
		email,
		password: hashedPassword,
	});

	return await sendToken(
		{
			id: user.user_id,
		},
		201,
		res,
		"Successfully Signed Up"
	);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;

	// Find the user by email
	const user = await commonService.findOne("user", { email });

	// If user not found
	if (!user) {
		return next(
			new ErrorHander("Invalid email or password, new here then sign up", 401)
		);
	}
	if (user?.auth_through?.provider) {
		return next(
			new ErrorHander(
				`You have signed up using ${user.auth_through.provider}, do login through it too`,
				401
			)
		);
	}
	// Compare the provided password with the hashed password stored in the DB
	const isPasswordMatched = await bcrypt.compare(password, user.password);

	// If password does not match
	if (!isPasswordMatched) {
		return next(new ErrorHander("Invalid email or password", 401));
	}

	return await sendToken(
		{
			id: user.user_id,
		},
		201,
		res,
		"Successfully Logged In"
	);
});

exports.linkedInAuth = catchAsyncErrors(async (req, res, next) => {
	let { state, code } = req.query;
	state = decodeURIComponent(state);
	code = decodeURIComponent(code);

	const { access_token, expires_in } = await getAccessToken(code);
	const { localizedFirstName } = await callMeAPI(access_token);
	const emailData = await callEmailAPI(access_token);
	const email = emailData.elements[0]["handle~"].emailAddress;

	console.log(access_token, expires_in, email);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
	const options = getLogoutCookieOptions();
	res.status(200).cookie("token", null, options).json({
		success: true,
		error: false,
		message: "Logged Out",
	});
});

// Get current user (requires authentication)
exports.getMe = catchAsyncErrors(async (req, res, next) => {
	// req.user is set by isAuthenticatedUser middleware
	const user = req.user;
	
	// Remove sensitive data
	const { password, ...userWithoutPassword } = user;
	
	res.status(200).json({
		success: true,
		error: false,
		user: userWithoutPassword,
	});
});

// // Forgot Password
// exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
// 	const user = await User.findOne({ email: req.body.email });

// 	if (!user) {
// 		return next(new ErrorHander("User not found", 404));
// 	}

// 	// Get ResetPassword Token
// 	const resetToken = user.getResetPasswordToken();

// 	await user.save({ validateBeforeSave: false });

// 	const resetPasswordUrl = `${req.protocol}://${req.get(
// 		"host"
// 	)}/password/reset/${resetToken}`;

// 	const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

// 	try {
// 		await sendEmail({
// 			email: user.email,
// 			subject: `Ecommerce Password Recovery`,
// 			message,
// 		});

// 		res.status(200).json({
// 			success: true,
// 			message: `Email sent to ${user.email} successfully`,
// 		});
// 	} catch (error) {
// 		user.resetPasswordToken = undefined;
// 		user.resetPasswordExpire = undefined;

// 		await user.save({ validateBeforeSave: false });

// 		return next(new ErrorHander(error.message, 500));
// 	}
// });

// // Reset Password
// exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
// 	// creating token hash
// 	const resetPasswordToken = crypto
// 		.createHash("sha256")
// 		.update(req.params.token)
// 		.digest("hex");

// 	const user = await User.findOne({
// 		resetPasswordToken,
// 		resetPasswordExpire: { $gt: Date.now() },
// 	});

// 	if (!user) {
// 		return next(
// 			new ErrorHander(
// 				"Reset Password Token is invalid or has been expired",
// 				400
// 			)
// 		);
// 	}

// 	if (req.body.password !== req.body.confirmPassword) {
// 		return next(new ErrorHander("Password does not password", 400));
// 	}

// 	user.password = req.body.password;
// 	user.resetPasswordToken = undefined;
// 	user.resetPasswordExpire = undefined;

// 	await user.save();

// 	sendToken(user, 200, res);
// });

// // Get User Detail
// exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
// 	const user = await User.findById(req.user.id);

// 	res.status(200).json({
// 		success: true,
// 		user,
// 	});
// });

// // update User password
// exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
// 	const user = await User.findById(req.user.id).select("+password");

// 	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

// 	if (!isPasswordMatched) {
// 		return next(new ErrorHander("Old password is incorrect", 400));
// 	}

// 	if (req.body.newPassword !== req.body.confirmPassword) {
// 		return next(new ErrorHander("password does not match", 400));
// 	}

// 	user.password = req.body.newPassword;

// 	await user.save();

// 	sendToken(user, 200, res);
// });

// // update User Profile
// exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
// 	const newUserData = {
// 		name: req.body.name,
// 		email: req.body.email,
// 	};

// 	if (req.body.avatar !== "") {
// 		const user = await User.findById(req.user.id);

// 		const imageId = user.avatar.public_id;

// 		await cloudinary.v2.uploader.destroy(imageId);

// 		const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
// 			folder: "avatars",
// 			width: 150,
// 			crop: "scale",
// 		});

// 		newUserData.avatar = {
// 			public_id: myCloud.public_id,
// 			url: myCloud.secure_url,
// 		};
// 	}

// 	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
// 		new: true,
// 		runValidators: true,
// 		useFindAndModify: false,
// 	});

// 	res.status(200).json({
// 		success: true,
// 	});
// });

// // Get all users(admin)
// exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
// 	const users = await User.find();

// 	res.status(200).json({
// 		success: true,
// 		users,
// 	});
// });

// // Get single user (admin)
// exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
// 	const user = await User.findById(req.params.id);

// 	if (!user) {
// 		return next(
// 			new ErrorHander(`User does not exist with Id: ${req.params.id}`)
// 		);
// 	}

// 	res.status(200).json({
// 		success: true,
// 		user,
// 	});
// });

// // update User Role -- Admin
// exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
// 	const newUserData = {
// 		name: req.body.name,
// 		email: req.body.email,
// 		role: req.body.role,
// 	};

// 	await User.findByIdAndUpdate(req.params.id, newUserData, {
// 		new: true,
// 		runValidators: true,
// 		useFindAndModify: false,
// 	});

// 	res.status(200).json({
// 		success: true,
// 	});
// });

// // Delete User --Admin
// exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
// 	const user = await User.findById(req.params.id);

// 	if (!user) {
// 		return next(
// 			new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
// 		);
// 	}

// 	const imageId = user.avatar.public_id;

// 	await cloudinary.v2.uploader.destroy(imageId);

// 	await user.remove();

// 	res.status(200).json({
// 		success: true,
// 		message: "User Deleted Successfully",
// 	});
// });
