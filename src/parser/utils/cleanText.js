/**
 * Text cleaning and normalization utilities
 */

/**
 * Clean and normalize raw PDF text
 * @param {string} text - Raw text from PDF
 * @returns {string} Cleaned text
 */
function cleanText(text) {
	if (!text) return "";

	let cleaned = text;

	// Remove excessive whitespace and normalize
	cleaned = cleaned.replace(/\r\n/g, "\n"); // Normalize line endings
	cleaned = cleaned.replace(/\r/g, "\n"); // Handle old Mac line endings
	cleaned = cleaned.replace(/\t/g, " "); // Replace tabs with spaces
	cleaned = cleaned.replace(/\u00a0/g, " "); // Replace non-breaking spaces
	cleaned = cleaned.replace(/\u2022/g, "•"); // Normalize bullet points
	cleaned = cleaned.replace(/[\u2013\u2014]/g, "-"); // Normalize dashes

	// Remove excessive blank lines (more than 2 consecutive)
	cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

	// Remove multiple spaces
	cleaned = cleaned.replace(/ {2,}/g, " ");

	// Trim each line
	cleaned = cleaned
		.split("\n")
		.map((line) => line.trim())
		.join("\n");

	// Remove leading/trailing whitespace
	cleaned = cleaned.trim();

	return cleaned;
}

/**
 * Normalize date strings to consistent format
 * @param {string} dateStr - Date string to normalize
 * @returns {string} ISO 8601 date or original string
 */
function normalizeDate(dateStr) {
	if (!dateStr) return null;

	const str = dateStr.trim().toLowerCase();

	// Check for "present" or similar
	if (
		str === "present" ||
		str === "current" ||
		str === "now" ||
		str === "ongoing"
	) {
		return "Present";
	}

	// Try to parse common date formats
	const monthMap = {
		jan: "01",
		january: "01",
		feb: "02",
		february: "02",
		mar: "03",
		march: "03",
		apr: "04",
		april: "04",
		may: "05",
		jun: "06",
		june: "06",
		jul: "07",
		july: "07",
		aug: "08",
		august: "08",
		sep: "09",
		sept: "09",
		september: "09",
		oct: "10",
		october: "10",
		nov: "11",
		november: "11",
		dec: "12",
		december: "12",
	};

	// Match patterns like "Jan 2020", "January 2020", etc.
	const monthYearMatch = str.match(
		/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{4})/i
	);
	if (monthYearMatch) {
		const month = monthMap[monthYearMatch[1].toLowerCase()];
		const year = monthYearMatch[2];
		return `${year}-${month}-01`;
	}

	// Match year only (e.g., "2020")
	const yearMatch = str.match(/^(\d{4})$/);
	if (yearMatch) {
		return `${yearMatch[1]}-01-01`;
	}

	// Match MM/YYYY or MM-YYYY
	const mmYyyyMatch = str.match(/^(\d{1,2})[\/-](\d{4})$/);
	if (mmYyyyMatch) {
		const month = mmYyyyMatch[1].padStart(2, "0");
		const year = mmYyyyMatch[2];
		return `${year}-${month}-01`;
	}

	// Return original if no pattern matches
	return dateStr;
}

/**
 * Extract skill level from text
 * @param {string} text - Text that may contain skill level
 * @returns {object} {level: string, levelId: number}
 */
function extractSkillLevel(text) {
	if (!text) return { level: null, levelId: null };

	const lowerText = text.toLowerCase();

	const levels = [
		{ keywords: ["expert", "mastery"], level: "Expert", levelId: 5 },
		{ keywords: ["specialist", "proficient"], level: "Specialist", levelId: 4 },
		{ keywords: ["advanced", "experienced"], level: "Advanced", levelId: 3 },
		{
			keywords: ["intermediate", "competent"],
			level: "Intermediate",
			levelId: 2,
		},
		{ keywords: ["beginner", "basic", "novice"], level: "Beginner", levelId: 1 },
	];

	for (const levelDef of levels) {
		for (const keyword of levelDef.keywords) {
			if (lowerText.includes(keyword)) {
				return { level: levelDef.level, levelId: levelDef.levelId };
			}
		}
	}

	return { level: null, levelId: null };
}

/**
 * Extract language level from text
 * @param {string} text - Text that may contain language level
 * @returns {object} {level: string, levelId: number}
 */
function extractLanguageLevel(text) {
	if (!text) return { level: null, levelId: null };

	const lowerText = text.toLowerCase();

	const levels = [
		{ keywords: ["native", "fluent", "c2"], level: "Native", levelId: 5 },
		{
			keywords: ["proficient", "advanced", "c1"],
			level: "Proficient",
			levelId: 4,
		},
		{
			keywords: ["intermediate", "b2", "b1"],
			level: "Intermediate",
			levelId: 3,
		},
		{ keywords: ["elementary", "a2", "a1"], level: "Elementary", levelId: 2 },
		{ keywords: ["beginner", "basic"], level: "Beginner", levelId: 1 },
	];

	for (const levelDef of levels) {
		for (const keyword of levelDef.keywords) {
			if (lowerText.includes(keyword)) {
				return { level: levelDef.level, levelId: levelDef.levelId };
			}
		}
	}

	return { level: null, levelId: null };
}

/**
 * Convert bullet points to HTML paragraphs
 * @param {string} text - Text with bullet points
 * @returns {string} HTML formatted text
 */
function bulletsToHtml(text) {
	if (!text) return "";

	const lines = text.split("\n").filter((line) => line.trim());
	const htmlLines = lines.map((line) => {
		const trimmed = line.trim();
		// Remove leading bullet characters
		const cleaned = trimmed.replace(/^[•\-\*]\s*/, "");
		return `<p>${cleaned}</p>`;
	});

	return htmlLines.join("");
}

/**
 * Extract email from text
 * @param {string} text - Text to search
 * @returns {string|null} Email address or null
 */
function extractEmail(text) {
	if (!text) return null;
	const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
	const match = text.match(emailRegex);
	return match ? match[0] : null;
}

/**
 * Extract phone number from text
 * @param {string} text - Text to search
 * @returns {string|null} Phone number or null
 */
function extractPhone(text) {
	if (!text) return null;
	// Match various phone formats
	const phoneRegex =
		/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
	const match = text.match(phoneRegex);
	return match ? match[0].trim() : null;
}

/**
 * Extract URL from text
 * @param {string} text - Text to search
 * @returns {string|null} URL or null
 */
function extractUrl(text) {
	if (!text) return null;
	const urlRegex =
		/(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/;
	const match = text.match(urlRegex);
	if (match) {
		let url = match[0];
		// Add protocol if missing
		if (!url.startsWith("http")) {
			url = "https://" + url;
		}
		return url;
	}
	return null;
}

module.exports = {
	cleanText,
	normalizeDate,
	extractSkillLevel,
	extractLanguageLevel,
	bulletsToHtml,
	extractEmail,
	extractPhone,
	extractUrl,
};
