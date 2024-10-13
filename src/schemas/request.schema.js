const Joi = require("joi");

exports.logInValidate = Joi.object({
	body: Joi.object({
		email: Joi.string().email(),
		password: Joi.string()
			.min(5)
			.max(20)
			.required(),
	}),
});


// const Joi = require("joi");

// const schema = Joi.object({
// 	name: Joi.string().required(),
// 	age: Joi.number().min(18).required(),
// 	email: Joi.string().email().required(),
// });

// const { error, value } = schema.validate({
// 	name: "John",
// 	age: 25,
// 	email: "john@example.com",
// });

// if (error) {
// 	console.error("Validation failed:", error.details);
// } else {
// 	console.log("Validation successful:", value);
// }
