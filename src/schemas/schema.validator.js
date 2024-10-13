exports.validate = (schema) => async (req, res, next) => {
	try {
		await schema.validate({
			body: req.body,
			query: req.query,
			params: req.params,
			headers: req.headers,
			files: req.files,
			...req.body,
		});
		return next();
	} catch (err) {
		return res
			.status(400)
			.json({ success: false, type: err.name, message: err.message });
	}
};
