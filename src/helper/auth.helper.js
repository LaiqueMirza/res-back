const axios = require("axios");

exports.getAccessToken= async (authCode) => {
	try {
		const response = await axios.post(
			"https://www.linkedin.com/oauth/v2/accessToken",
			null,
			{
				params: {
					grant_type: "authorization_code",
					code: authCode,
					redirect_uri: process.env.LINKEDIN_REDIRECT_URL,
					client_id: process.env.LINKEDIN_CLIENT_ID,
					client_secret: process.env.LINKEDIN_CLIENT_SECRET,
				},
			}
		);

		// Log the response body
		console.log(response.data);

		// Return the parsed response
		return response.data;
	} catch (err) {
		console.error(err);
		throw err; // or handle error as needed
	}
}

// Function to get LinkedIn profile data
exports.callMeAPI = async (accessToken) => {
	try {
        // const response = await axios.get("https://api.linkedin.com/v2/me", {
		const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
            
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		console.log(response.data);
		return response.data; // Returns the profile data
	} catch (err) {
		console.error(err);
		throw err; // Propagate the error
	}
}

// Function to get LinkedIn email data
exports.callEmailAPI = async (accessToken) => {
	try {
		const response = await axios.get(
			"https://api.linkedin.com/v2/emailAddress",
			{
				params: {
					q: "members",
					projection: "(elements*(handle~))",
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		console.log(response.data);
		return response.data; // Returns the email data
	} catch (err) {
		console.error(err);
		throw err; // Propagate the error
	}
}

