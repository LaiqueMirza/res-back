const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs"); // Import bcryptjs
const commonService = require("../services/common.js");
const error = require("../middleware/error.js");
const {
	getAccessToken,
	callMeAPI,
	callEmailAPI,
} = require("../helper/auth.helper.js");
// const crypto = require("crypto");


exports.getResumeTemplates = catchAsyncErrors(async (req, res, next) => {
	const { resume_template_id } = req.query;
	const getResumeTemplates = await commonService.findOne("resume_template", {
		resume_template_id,
	});

	res.status(200).json({
		success: true,
		data: getResumeTemplates,
		message: "Fetched resume template successfully",
	});
});

;


exports.getResumeTemplatesDefaultSettings = catchAsyncErrors(
	async (req, res, next) => {
		const { resume_template_id } = req.query;
		const getResumeTemplates = await commonService.findOne(
			"resume_template",
			{
				resume_template_id,
			},
			["default_settings"]
		);

		return res.status(200).json({
			success: true,
			data: getResumeTemplates.default_settings,
			message: "Fetched resume template default settings successfully",
		});
	}
);