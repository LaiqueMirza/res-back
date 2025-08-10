const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const app = express();
const upload = multer({ dest: "uploads/" });

// Function to extract detailed data from PDF
async function extractDataFromPDF(filePath) {
	try {
		// Read the file into a buffer
		const buffer = fs.readFileSync(filePath);

		// Parse the PDF content
		const pdfData = await pdfParse(buffer);

		// Extract the raw text
		const text = pdfData.text;

		// Initialize the structured data
		const extractedData = {
			skills: [],
			courses: [],
			education: [],
			languages: [],
			employment: [],
			certificates: [],
			profileSummary: {
				info: "",
			},
			personalDetails: {
				city: "",
				email: "",
				phone: "",
				Address: "",
				country: "",
				jobTitle: "",
				lastName: "",
				firstName: "",
				postalCode: "",
				dateOfBirth: "",
				nationality: "",
				placeOfBirth: "",
			},
			appearanceSettings: {
				fontSize: 7,
				dateFormat: "MM/YYYY",
				fontFamily: "Garamond",
				lineHeight: 19,
				resumeWidth: 816,
				primaryColor: "#22726d",
				resumeFormat: "Letter",
				resumeHeight: 1056,
				secondaryColor: "#382f98",
			},
			donotShowSkillLevel: false,
			donotShowLanguageLevel: false,
			websitesAndSocialLinks: [],
		};

		// Extract data using patterns
		const lines = text.split("\n");

		// Example extraction logic (you can refine this further)
		extractedData.personalDetails.firstName = "Laique"; // Replace with actual logic
		extractedData.personalDetails.lastName = "Mirza";
		extractedData.personalDetails.email =
			text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
		extractedData.personalDetails.phone =
			text.match(
				/\+?[0-9]{1,4}[-.\s]?\(?[0-9]{1,3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4,6}/
			)?.[0] || "";

		extractedData.profileSummary.info =
			"<p>Full Stack Developer with over 3.3 years of experience specializing in React, Next.js, Node.js, MongoDB, SQL, and AWS. Proven leadership in managing a team of 8 software developers. Experienced in delivering high-impact projects, driving innovation, and optimizing performance across three major projects</p>";

		extractedData.education = [
			{
				city: "",
				degree: "BSC IT",
				school: "Gr patil Mumbai university",
				endDate: "2021-08-14T18:30:00.000Z",
				location: "Mumbra",
				position: 1,
				isPresent: false,
				startDate: "2018-09-14T18:30:00.000Z",
				description: "<p>jhjkasdhkjhfajskdhf</p>",
				isDistancedLearning: false,
			},
			{
				city: "",
				degree: "HSC",
				school: "mesco",
				endDate: "2018-07-14T18:30:00.000Z",
				location: "Mumbra",
				position: 2,
				isPresent: false,
				startDate: "2005-05-14T18:30:00.000Z",
				description: "<p>i aworked then i createed a performacne optin;ie</p>",
				isDistancedLearning: false,
			},
		];

		extractedData.skills = [
			{
				level: "Specialist",
				skill: "Node",
				position: 1,
			},
			{
				level: "Specialist",
				skill: "React",
				position: 2,
			},
			{
				level: "Specialist",
				skill: "MongoDB",
				position: 3,
			},
		];

		extractedData.languages = [
			{
				level: "Elementary",
				language: "Gujarati",
				position: 1,
			},
			{
				level: "Professional",
				language: "English",
				position: 2,
			},
			{
				level: "Elementary",
				language: "Hindi",
				position: 3,
			},
		];

		extractedData.websitesAndSocialLinks = [
			{
				link: "http://laique.site/",
				label: "Website",
				position: 1,
			},
			{
				link: "http://github.com/laiquemirza",
				label: "GitHub",
				position: 2,
			},
		];

		return extractedData;
	} catch (error) {
		console.error("Error extracting data from PDF:", error);
		throw new Error("Failed to extract data from PDF");
	}
}

// API endpoint to handle file upload and extract data
app.post("/api/upload", upload.single("resume"), async (req, res) => {
	const filePath = req.file.path;

	try {
		const data = await extractDataFromPDF(filePath);

		// Clean up uploaded file after processing
		fs.unlinkSync(filePath);

		res.json({ success: true, data });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});



<script>
	// Data destructuring for template rendering const{" "}
	{
		(personalDetails,
		profileSummary,
		skills,
		employment,
		education,
		languages,
		courses,
		certificates,
		websitesAndSocialLinks,
		appearanceSettings,
		donotShowSkillLevel,
		donotShowLanguageLevel)
	}{" "}
	= data;
</script>;


// Pre-process the template to fix octal escape sequences
template = template.replace(/\\([0-7]{1,3})/g, (match, p1) => {
    console.log("match", match)

    // Convert octal escape to unicode escape
    const codePoint = parseInt(p1, 8);
    console.log("first", `\\u${codePoint.toString(16).padStart(4, "0")}`);
    return `\\u${codePoint.toString(16).padStart(4, '0')}`;
});