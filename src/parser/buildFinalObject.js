/**
 * Build final resume object from parsed sections
 */

/**
 * Build the final resume object with consistent structure
 * @param {object} parsedSections - Object containing all parsed sections
 * @returns {object} Final structured resume object
 */
function buildFinalObject(parsedSections) {
	return {
		skills: parsedSections.skills || [],
		courses: parsedSections.courses || [],
		education: parsedSections.education || [],
		languages: parsedSections.languages || [],
		employment: parsedSections.employment || [],
		certificates: parsedSections.certificates || [],
		profileSummary: parsedSections.profileSummary || { info: "" },
		personalDetails: parsedSections.personalDetails || {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			city: "",
			country: "",
			postalCode: "",
			dateOfBirth: "",
			nationality: "",
			placeOfBirth: "",
			Address: "",
			jobTitle: "",
		},
		websitesAndSocialLinks: parsedSections.websitesAndSocialLinks || [],
	};
}

/**
 * Validate and sanitize the final resume object
 * @param {object} resumeObject - Resume object to validate
 * @returns {object} Validated resume object
 */
function validateResumeObject(resumeObject) {
	// Ensure all required fields exist
	const validated = {
		skills: Array.isArray(resumeObject.skills) ? resumeObject.skills : [],
		courses: Array.isArray(resumeObject.courses) ? resumeObject.courses : [],
		education: Array.isArray(resumeObject.education)
			? resumeObject.education
			: [],
		languages: Array.isArray(resumeObject.languages)
			? resumeObject.languages
			: [],
		employment: Array.isArray(resumeObject.employment)
			? resumeObject.employment
			: [],
		certificates: Array.isArray(resumeObject.certificates)
			? resumeObject.certificates
			: [],
		profileSummary:
			resumeObject.profileSummary &&
			typeof resumeObject.profileSummary === "object"
				? resumeObject.profileSummary
				: { info: "" },
		personalDetails:
			resumeObject.personalDetails &&
			typeof resumeObject.personalDetails === "object"
				? resumeObject.personalDetails
				: {
						firstName: "",
						lastName: "",
						email: "",
						phone: "",
						city: "",
						country: "",
						postalCode: "",
						dateOfBirth: "",
						nationality: "",
						placeOfBirth: "",
						Address: "",
						jobTitle: "",
					},
		websitesAndSocialLinks: Array.isArray(resumeObject.websitesAndSocialLinks)
			? resumeObject.websitesAndSocialLinks
			: [],
	};

	// Remove any items with empty required fields and fix position values
	validated.employment = validated.employment
		.filter((item) => item && (item.jobTitle || item.employer))
		.map((item, index) => ({ ...item, position: index }));

	validated.education = validated.education
		.filter((item) => item && (item.degree || item.school))
		.map((item, index) => ({ ...item, position: index }));

	validated.skills = validated.skills
		.filter((item) => item && item.skill)
		.map((item, index) => ({ ...item, position: index }));

	validated.languages = validated.languages
		.filter((item) => item && item.language)
		.map((item, index) => ({ ...item, position: index }));

	validated.courses = validated.courses
		.filter((item) => item && item.course)
		.map((item, index) => ({ ...item, position: index }));

	validated.certificates = validated.certificates
		.filter((item) => item && (item.certificateName || item.course))
		.map((item, index) => ({ ...item, position: index }));

	validated.websitesAndSocialLinks = validated.websitesAndSocialLinks
		.filter((item) => item && (item.link || item.label))
		.map((item, index) => ({ ...item, position: index }));

	return validated;
}

module.exports = {
	buildFinalObject,
	validateResumeObject,
};
