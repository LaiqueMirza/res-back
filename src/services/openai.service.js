/**
 * AI Service for Resume Parsing
 * Supports both OpenAI GPT-4o-mini and Google Vertex AI Gemini 2.5 Flash
 * Currently using: Vertex AI Gemini (more reliable with better uptime)
 */

const { VertexAI } = require("@google-cloud/vertexai");
const { 
	ACTIVE_GEMINI_MODEL, 
	AI_CONFIG,
} = require("../config/aiConstants");

// Initialize OpenAI client (COMMENTED - keeping for future use)
// const openai = new OpenAI({
// 	apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize Vertex AI client
const vertexAI = new VertexAI({
	project: process.env.GOOGLE_CLOUD_PROJECT_ID || "resumaye",
	location: process.env.GOOGLE_CLOUD_REGION || "us-central1",
});

const generativeModel = vertexAI.getGenerativeModel({
	model: ACTIVE_GEMINI_MODEL || process.env.VERTEX_AI_MODEL || "gemini-2.5-flash",
});

// Define the JSON schema for structured outputs
const resumeSchema = {
	type: "object",
	properties: {
		skills: {
			type: "array",
			items: {
				type: "object",
				properties: {
					skill: { type: "string" },
					level: { type: "string" },
					position: { type: "number" },
				},
				required: ["skill", "position"],
				additionalProperties: false,
			},
		},
		courses: {
			type: "array",
			items: {
				type: "object",
				properties: {
					course: { type: "string" },
					institution: { type: "string" },
					startDate: { type: "string" },
					endDate: { type: "string" },
					isPresent: { type: "boolean" },
					description: { type: "string" },
					position: { type: "number" },
				},
				required: ["course", "position"],
				additionalProperties: false,
			},
		},
		education: {
			type: "array",
			items: {
				type: "object",
				properties: {
					degree: { type: "string" },
					school: { type: "string" },
					location: { type: "string" },
					city: { type: "string" },
					startDate: { type: "string" },
					endDate: { type: "string" },
					isPresent: { type: "boolean" },
					description: { type: "string" },
					isDistancedLearning: { type: "boolean" },
					position: { type: "number" },
				},
				required: ["position"],
				additionalProperties: false,
			},
		},
		languages: {
			type: "array",
			items: {
				type: "object",
				properties: {
					language: { type: "string" },
					level: { type: "string" },
					position: { type: "number" },
				},
				required: ["language", "position"],
				additionalProperties: false,
			},
		},
		employment: {
			type: "array",
			items: {
				type: "object",
				properties: {
					jobTitle: { type: "string" },
					employer: { type: "string" },
					location: { type: "string" },
					startDate: { type: "string" },
					endDate: { type: "string" },
					isPresent: { type: "boolean" },
					isRemote: { type: "boolean" },
					description: { type: "string" },
					position: { type: "number" },
				},
				required: ["position"],
				additionalProperties: false,
			},
		},
		certificates: {
			type: "array",
			items: {
				type: "object",
				properties: {
					certificateName: { type: "string" },
					issuer: { type: "string" },
					link: { type: "string" },
					position: { type: "number" },
				},
				required: ["position"],
				additionalProperties: false,
			},
		},
		profileSummary: {
			type: "object",
			properties: {
				info: { type: "string" },
			},
			required: ["info"],
			additionalProperties: false,
		},
		personalDetails: {
			type: "object",
			properties: {
				firstName: { type: "string" },
				lastName: { type: "string" },
				email: { type: "string" },
				phone: { type: "string" },
				city: { type: "string" },
				country: { type: "string" },
				postalCode: { type: "string" },
				Address: { type: "string" },
				dateOfBirth: { type: "string" },
				nationality: { type: "string" },
				placeOfBirth: { type: "string" },
				jobTitle: { type: "string" },
			},
			additionalProperties: false,
		},
		websitesAndSocialLinks: {
			type: "array",
			items: {
				type: "object",
				properties: {
					label: { type: "string" },
					link: { type: "string" },
					position: { type: "number" },
				},
				required: ["link", "position"],
				additionalProperties: false,
			},
		},
	},
	required: [
		"skills",
		"courses",
		"education",
		"languages",
		"employment",
		"certificates",
		"profileSummary",
		"personalDetails",
		"websitesAndSocialLinks",
	],
	additionalProperties: false,
};

/**
 * Parse resume text using Vertex AI Gemini 2.5 Flash with JSON mode
 * @param {string} rawText - Raw resume text extracted from PDF
 * @returns {Promise<object>} Parsed resume object
 */
async function parseResumeWithGemini(rawText) {
	try {
		console.log(
			`Sending resume text to Vertex AI Gemini (${ACTIVE_GEMINI_MODEL}) for parsing`
		);

		const prompt = `You are an advanced resume data extraction engine. Extract structured information from resume text.

EXTRACTION RULES:
1. Extract all content EXACTLY as written - no rewording, no improvements
2. If a section is missing, return empty array []
3. Do NOT infer or fabricate missing information
4. Normalize dates to ISO format (YYYY-MM-DD), use "-01" if day/month unknown
5. Preserve original bullet points and descriptions verbatim
6. Detect sections with flexible headings (e.g., "Work Experience", "Experience", "Professional Background")
7. Position values start from 0 and increment sequentially (0, 1, 2, 3...)
8. Keep multi-line employment descriptions exactly as they appear
9. Extract phone/email raw values without formatting changes
10. Goal: EXTRACTION not enhancement

JSON SCHEMA (return ONLY valid JSON matching this structure):
{
  "skills": [{"skill": "string", "level": "string", "position": 0}],
  "courses": [{"course": "string", "institution": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "isPresent": false, "description": "string", "position": 0}],
  "education": [{"degree": "string", "school": "string", "location": "string", "city": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "isPresent": false, "description": "string", "isDistancedLearning": false, "position": 0}],
  "languages": [{"language": "string", "level": "string", "position": 0}],
  "employment": [{"jobTitle": "string", "employer": "string", "location": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "isPresent": false, "isRemote": false, "description": "string", "position": 0}],
  "certificates": [{"certificateName": "string", "issuer": "string", "link": "string", "position": 0}],
  "profileSummary": {"info": "string"},
  "personalDetails": {"firstName": "string", "lastName": "string", "email": "string", "phone": "string", "city": "string", "country": "string", "postalCode": "string", "Address": "string", "dateOfBirth": "string", "nationality": "string", "placeOfBirth": "string", "jobTitle": "string"},
  "websitesAndSocialLinks": [{"label": "string", "link": "string", "position": 0}]
}

Extract resume data from the following text:

${rawText}`;

		console.log("Calling Vertex AI Generative Model...");

		const result = await generativeModel.generateContent({
			contents: [
				{
					role: "user",
					parts: [
						{
							text: prompt,
						},
					],
				},
			],
			generationConfig: {
				temperature: AI_CONFIG.TEMPERATURE,
				responseMimeType: "application/json",
			},
		});

		console.log("Received response from Vertex AI");

		// Extract the content from the response
		const response = result.response;
		if (!response) {
			throw new Error("No response returned from Vertex AI");
		}

		const content = response.candidates[0].content.parts[0].text;

		// Parse the JSON response
		const parsedData = JSON.parse(content);
		console.log("parsedData", parsedData);

		// Validate that we got the expected structure
		if (!parsedData || typeof parsedData !== "object") {
			throw new Error("Invalid response format from Vertex AI");
		}

		console.log(
			`Successfully parsed resume with Vertex AI Gemini (${ACTIVE_GEMINI_MODEL})`
		);
		console.log("Extracted sections:", {
			skills: parsedData.skills?.length || 0,
			employment: parsedData.employment?.length || 0,
			education: parsedData.education?.length || 0,
			languages: parsedData.languages?.length || 0,
			courses: parsedData.courses?.length || 0,
			certificates: parsedData.certificates?.length || 0,
		});

		return parsedData;
	} catch (error) {
		console.error("Error parsing resume with Vertex AI:", error);

		// Check for specific Vertex AI errors
		if (
			error.message?.includes("authentication") ||
			error.message?.includes("credentials") ||
			error.message?.includes("401")
		) {
			throw new Error(
				"Invalid Vertex AI credentials. Please check your GOOGLE_APPLICATION_CREDENTIALS or GCP authentication."
			);
		}

		if (
			error.message?.includes("permission denied") ||
			error.message?.includes("403")
		) {
			throw new Error(
				"Insufficient permissions for Vertex AI. Ensure the service account has Vertex AI User role."
			);
		}

		if (error.message?.includes("quota") || error.message?.includes("limit")) {
			throw new Error(
				"Vertex AI quota exceeded. Please check your usage limits."
			);
		}

		if (
			error.message?.includes("overloaded") ||
			error.message?.includes("503")
		) {
			throw new Error(
				"Vertex AI service is temporarily overloaded. Please try again later."
			);
		}

		if (error instanceof SyntaxError) {
			throw new Error("Failed to parse Vertex AI response as JSON");
		}

		throw new Error("Failed to parse resume with Vertex AI: " + error.message);
	}
}

/**
 * Parse resume text using OpenAI GPT-4o-mini with Structured Outputs
 * COMMENTED OUT - Keeping for future use if needed
 * @param {string} rawText - Raw resume text extracted from PDF
 * @returns {Promise<object>} Parsed resume object
 */
/*
async function parseResumeWithOpenAI(rawText) {
	try {
		console.log("Sending resume text to OpenAI for parsing...");

		const systemPrompt = `You are an advanced resume data extraction engine. Extract structured information from resume text.

EXTRACTION RULES:
1. Extract all content EXACTLY as written - no rewording, no improvements
2. If a section is missing, return empty array []
3. Do NOT infer or fabricate missing information
4. Normalize dates to ISO format (YYYY-MM-DD), use "-01" if day/month unknown
5. Preserve original bullet points and descriptions verbatim
6. Detect sections with flexible headings (e.g., "Work Experience", "Experience", "Professional Background")
7. Position values start from 0 and increment sequentially (0, 1, 2, 3...)
8. Keep multi-line employment descriptions exactly as they appear
9. Extract phone/email raw values without formatting changes
10. Goal: EXTRACTION not enhancement`;

		const userPrompt = `Extract resume data from the following text:\n\n${rawText}`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			temperature: 0.2,
			response_format: {
				type: "json_schema",
				json_schema: {
					name: "resume_extraction",
					strict: true,
					schema: resumeSchema,
				},
			},
		});

		const content = response.choices[0].message.content;
		console.log("Received response from OpenAI", content);

		// Parse the JSON response
		const parsedData = JSON.parse(content);

		// Validate that we got the expected structure
		if (!parsedData || typeof parsedData !== "object") {
			throw new Error("Invalid response format from OpenAI");
		}

		console.log("Successfully parsed resume with OpenAI");
		console.log("Extracted sections:", {
			skills: parsedData.skills?.length || 0,
			employment: parsedData.employment?.length || 0,
			education: parsedData.education?.length || 0,
			languages: parsedData.languages?.length || 0,
			courses: parsedData.courses?.length || 0,
			certificates: parsedData.certificates?.length || 0,
		});

		return parsedData;
	} catch (error) {
		console.error("Error parsing resume with OpenAI:", error);

		// Check for specific OpenAI errors
		if (error.code === "insufficient_quota") {
			throw new Error(
				"OpenAI API quota exceeded. Please check your billing settings."
			);
		}

		if (error.code === "invalid_api_key") {
			throw new Error(
				"Invalid OpenAI API key. Please check your configuration."
			);
		}

		if (error instanceof SyntaxError) {
			throw new Error("Failed to parse OpenAI response as JSON");
		}

		throw new Error("Failed to parse resume with OpenAI: " + error.message);
	}
}
*/

module.exports = {
	parseResumeWithGemini,
	// parseResumeWithOpenAI, // Commented - uncomment if switching back to OpenAI
};
