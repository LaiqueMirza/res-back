/**
 * Text Analysis Utilities for ATS Scoring
 * Provides functions to analyze resume text for various quality metrics
 */

// ============================================================================
// WEAK VERB DETECTION
// ============================================================================

/**
 * List of weak/vague action verbs that should be replaced with stronger alternatives
 * Categorized by type for better suggestions
 */
const WEAK_VERBS = {
	passive: [
		"worked",
		"helped",
		"assisted",
		"supported",
		"contributed",
		"participated",
		"involved",
	],
	vague: [
		"handled",
		"managed",
		"responsible",
		"dealt",
		"performed",
		"conducted",
		"did",
		"made",
	],
	weak_starters: [
		"was",
		"were",
		"had",
		"have",
		"been",
		"being",
		"got",
		"getting",
	],
	overused: [
		"utilized",
		"leveraged",
		"facilitated",
		"spearheaded",
		"synergized",
	],
};

/**
 * Strong verb replacements organized by context
 */
const STRONG_VERB_SUGGESTIONS = {
	development: ["Built", "Developed", "Engineered", "Architected", "Created"],
	leadership: ["Led", "Directed", "Managed", "Coordinated", "Supervised"],
	improvement: ["Optimized", "Enhanced", "Improved", "Streamlined", "Refined"],
	achievement: [
		"Achieved",
		"Delivered",
		"Accomplished",
		"Completed",
		"Exceeded",
	],
	analysis: ["Analyzed", "Evaluated", "Assessed", "Investigated", "Researched"],
};

/**
 * Find weak verbs in text and return matches with suggestions
 * @param {string} text - Text to analyze
 * @returns {Array} Array of findings with matched words and suggestions
 */
function findWeakVerbs(text) {
	const findings = [];
	const lowerText = text.toLowerCase();

	Object.entries(WEAK_VERBS).forEach(([category, verbs]) => {
		verbs.forEach((verb) => {
			// Use word boundary matching
			const regex = new RegExp(`\\b${verb}\\b`, "gi");
			const matches = text.match(regex);

			if (matches) {
				matches.forEach((match) => {
					// Find the sentence containing this verb
					const sentenceMatch = text.match(
						new RegExp(`[^.•\\n]*\\b${verb}\\b[^.•\\n]*`, "i")
					);
					const snippet = sentenceMatch
						? sentenceMatch[0].trim().substring(0, 100)
						: match;

					findings.push({
						matchedWords: [match.toLowerCase()],
						textSnippet: snippet,
						suggestion: getSuggestionForVerb(verb, category),
						category,
						severity: category === "passive" ? "high" : "medium",
					});
				});
			}
		});
	});

	return findings;
}

/**
 * Get replacement suggestion for a weak verb
 * @param {string} verb - The weak verb
 * @param {string} category - Category of the weak verb
 * @returns {string} Suggestion text
 */
function getSuggestionForVerb(verb, category) {
	const suggestions = {
		passive: `Replace "${verb}" with action verbs like ${STRONG_VERB_SUGGESTIONS.achievement.slice(0, 3).join(", ")}`,
		vague: `Use specific verbs like ${STRONG_VERB_SUGGESTIONS.development.slice(0, 3).join(", ")} instead of "${verb}"`,
		weak_starters: `Start with a strong action verb instead of "${verb}"`,
		overused: `Replace overused "${verb}" with concrete alternatives`,
	};
	return suggestions[category] || `Replace "${verb}" with a stronger verb`;
}

// ============================================================================
// IMPACT & METRICS DETECTION
// ============================================================================

/**
 * Patterns to detect measurable impact in text
 */
const METRIC_PATTERNS = [
	/\d+%/g, // Percentages: 30%, 55%
	/\$[\d,]+/g, // Dollar amounts: $50,000
	/\d+\+?\s*(users?|customers?|clients?)/gi, // User counts: 10,000+ users
	/\d+\+?\s*(million|M|billion|B|thousand|K)/gi, // Scale: 2M, 5K
	/\d+x/gi, // Multipliers: 3x improvement
	/reduced\s+by\s+\d+/gi, // Reduced by X
	/increased\s+by\s+\d+/gi, // Increased by X
	/\d+\s*(hours?|days?|weeks?|months?)/gi, // Time metrics
];

/**
 * Detect metrics and quantifiable achievements in text
 * @param {string} text - Text to analyze
 * @returns {Object} Metrics analysis result
 */
function detectMetrics(text) {
	const metricsFound = [];
	const bulletsWithMetrics = new Set();

	// Split into bullets
	const bullets = splitIntoBullets(text);

	bullets.forEach((bullet, index) => {
		let hasMetric = false;

		METRIC_PATTERNS.forEach((pattern) => {
			const matches = bullet.match(pattern);
			if (matches) {
				hasMetric = true;
				metricsFound.push({
					metric: matches[0],
					context: bullet.substring(0, 100),
					bulletIndex: index,
				});
			}
		});

		if (hasMetric) {
			bulletsWithMetrics.add(index);
		}
	});

	const bulletsWithoutMetrics = bullets.filter(
		(_, i) => !bulletsWithMetrics.has(i) && _.length > 20
	);

	return {
		totalMetricsFound: metricsFound.length,
		bulletsWithMetrics: bulletsWithMetrics.size,
		bulletsWithoutMetrics: bulletsWithoutMetrics.length,
		metricDetails: metricsFound,
		findingsForMissingMetrics: bulletsWithoutMetrics
			.slice(0, 5)
			.map((bullet) => ({
				matchedWords: [],
				textSnippet: bullet.substring(0, 100),
				suggestion: "Add measurable result (%, count, or time saved)",
			})),
	};
}

/**
 * Detect impact statements (results-oriented language)
 * @param {string} text - Text to analyze
 * @returns {Object} Impact analysis
 */
function detectImpactStatements(text) {
	const impactKeywords = [
		"resulted in",
		"leading to",
		"achieved",
		"delivered",
		"increased",
		"decreased",
		"reduced",
		"improved",
		"saved",
		"generated",
		"drove",
		"boosted",
		"enhanced",
		"streamlined",
		"accelerated",
	];

	const bullets = splitIntoBullets(text);
	const bulletsWithImpact = [];
	const bulletsWithoutImpact = [];

	bullets.forEach((bullet) => {
		const lowerBullet = bullet.toLowerCase();
		const hasImpact = impactKeywords.some((keyword) =>
			lowerBullet.includes(keyword)
		);

		if (hasImpact || /\d+%/.test(bullet)) {
			bulletsWithImpact.push(bullet);
		} else if (bullet.length > 30) {
			bulletsWithoutImpact.push(bullet);
		}
	});

	return {
		impactBulletCount: bulletsWithImpact.length,
		lowImpactBulletCount: bulletsWithoutImpact.length,
		totalBullets: bullets.length,
		impactRatio:
			bullets.length > 0 ? bulletsWithImpact.length / bullets.length : 0,
		lowImpactBullets: bulletsWithoutImpact.slice(0, 5),
	};
}

// ============================================================================
// GRAMMAR & TENSE ANALYSIS
// ============================================================================

/**
 * Common grammar issues patterns in resumes
 */
const GRAMMAR_ISSUES = [
	{
		pattern: /\bhas\s+(develop|create|build|implement|design)/gi,
		issue: "Incorrect verb form after 'has'",
		suggestion: "Use past participle: has developed, has created",
	},
	{
		pattern: /\bhave\s+(develop|create|build|implement|design)/gi,
		issue: "Incorrect verb form after 'have'",
		suggestion: "Use past participle: have developed, have created",
	},
	{
		pattern: /\bresponsible\s+for\s+(develop|create|build)/gi,
		issue: "Incorrect form after 'responsible for'",
		suggestion: "Use gerund: responsible for developing",
	},
	{
		pattern: /\bi\s+(have|am|was|worked)/gi,
		issue: "First person pronoun detected",
		suggestion: "Remove personal pronouns in resume bullets",
	},
	{
		pattern: /\b(very|really|extremely|highly)\s+\w+/gi,
		issue: "Unnecessary intensifiers",
		suggestion: "Remove filler words and be more specific",
	},
];

/**
 * Detect tense inconsistencies in employment descriptions
 * @param {string} text - Text to analyze
 * @param {boolean} isCurrentRole - Whether this is a current position
 * @returns {Object} Tense analysis result
 */
function analyzeTenseConsistency(text, isCurrentRole = false) {
	const bullets = splitIntoBullets(text);
	const findings = [];

	// Common verb patterns
	const presentTenseStarters = /^(develop|create|build|manage|lead|design|work)/i;
	const pastTenseStarters = /^(developed|created|built|managed|led|designed|worked)/i;

	let presentCount = 0;
	let pastCount = 0;

	bullets.forEach((bullet) => {
		const firstWord = bullet.split(/\s+/)[0];
		if (presentTenseStarters.test(firstWord)) presentCount++;
		if (pastTenseStarters.test(firstWord)) pastCount++;
	});

	// For past roles, all should be past tense
	// For current roles, present tense is acceptable
	const isInconsistent =
		presentCount > 0 && pastCount > 0 && Math.min(presentCount, pastCount) > 1;
	const wrongTense = !isCurrentRole && presentCount > pastCount;

	if (isInconsistent || wrongTense) {
		bullets.forEach((bullet) => {
			const firstWord = bullet.split(/\s+/)[0];
			if (!isCurrentRole && presentTenseStarters.test(firstWord)) {
				findings.push({
					matchedWords: [firstWord],
					textSnippet: bullet.substring(0, 80),
					suggestion: `Use past tense for previous roles: ${firstWord}ed`,
				});
			}
		});
	}

	return {
		presentTenseCount: presentCount,
		pastTenseCount: pastCount,
		isConsistent: !isInconsistent && !wrongTense,
		findings: findings.slice(0, 3),
	};
}

/**
 * Detect grammar issues in text
 * @param {string} text - Text to analyze
 * @returns {Array} Array of grammar findings
 */
function detectGrammarIssues(text) {
	const findings = [];

	GRAMMAR_ISSUES.forEach(({ pattern, issue, suggestion }) => {
		const matches = text.match(pattern);
		if (matches) {
			matches.forEach((match) => {
				const context = text.match(
					new RegExp(`[^.•\\n]*${escapeRegex(match)}[^.•\\n]*`, "i")
				);
				findings.push({
					matchedWords: [match],
					textSnippet: context ? context[0].trim().substring(0, 100) : match,
					suggestion,
					issue,
				});
			});
		}
	});

	return findings;
}

// ============================================================================
// READABILITY & SENTENCE ANALYSIS
// ============================================================================

/**
 * Analyze sentence complexity and readability
 * @param {string} text - Text to analyze
 * @returns {Object} Readability metrics
 */
function analyzeReadability(text) {
	const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
	const bullets = splitIntoBullets(text);

	let totalWords = 0;
	let longSentences = [];
	let complexSentences = [];

	// Complexity indicators
	const complexPhrases = [
		"in order to",
		"with respect to",
		"for the purpose of",
		"in terms of",
		"as a result of",
		"in conjunction with",
		"in accordance with",
	];

	bullets.forEach((bullet) => {
		const words = bullet.split(/\s+/).length;
		totalWords += words;

		// Long bullets (more than 25 words) are harder to read
		if (words > 25) {
			longSentences.push({
				text: bullet.substring(0, 100),
				wordCount: words,
			});
		}

		// Check for complex phrases
		const lowerBullet = bullet.toLowerCase();
		complexPhrases.forEach((phrase) => {
			if (lowerBullet.includes(phrase)) {
				complexSentences.push({
					text: bullet.substring(0, 100),
					complexPhrase: phrase,
				});
			}
		});
	});

	const avgWordsPerBullet =
		bullets.length > 0 ? totalWords / bullets.length : 0;

	return {
		totalWords,
		bulletCount: bullets.length,
		avgWordsPerBullet: Math.round(avgWordsPerBullet * 10) / 10,
		longBulletCount: longSentences.length,
		complexSentenceCount: complexSentences.length,
		longBullets: longSentences.slice(0, 3),
		complexSentences: complexSentences.slice(0, 3),
		readabilityScore: calculateReadabilityScore(
			avgWordsPerBullet,
			longSentences.length,
			bullets.length
		),
	};
}

/**
 * Calculate readability score (0-100)
 */
function calculateReadabilityScore(avgWords, longCount, totalBullets) {
	let score = 100;

	// Penalty for average words per bullet being too high
	if (avgWords > 20) score -= (avgWords - 20) * 2;

	// Penalty for long bullets
	if (totalBullets > 0) {
		const longRatio = longCount / totalBullets;
		score -= longRatio * 30;
	}

	return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================================================
// BUZZWORD & CLICHE DETECTION
// ============================================================================

const BUZZWORDS = [
	"team player",
	"hard worker",
	"detail-oriented",
	"self-starter",
	"go-getter",
	"think outside the box",
	"synergy",
	"passionate",
	"driven",
	"motivated",
	"fast learner",
	"results-driven",
	"dynamic",
	"innovative",
	"proactive",
	"strategic",
	"cutting-edge",
	"best-in-class",
	"world-class",
	"ninja",
	"rockstar",
	"guru",
];

/**
 * Detect buzzwords and clichés in text
 * @param {string} text - Text to analyze
 * @returns {Object} Buzzword analysis
 */
function detectBuzzwords(text) {
	const findings = [];
	const lowerText = text.toLowerCase();

	BUZZWORDS.forEach((buzzword) => {
		if (lowerText.includes(buzzword)) {
			const context = text.match(
				new RegExp(`[^.•\\n]*${escapeRegex(buzzword)}[^.•\\n]*`, "i")
			);
			findings.push({
				matchedWords: [buzzword],
				textSnippet: context ? context[0].trim().substring(0, 100) : buzzword,
				suggestion: `Replace "${buzzword}" with specific, measurable achievements`,
			});
		}
	});

	return {
		buzzwordCount: findings.length,
		findings,
	};
}

// ============================================================================
// REPETITION DETECTION
// ============================================================================

/**
 * Detect repeated phrases and words across bullets
 * @param {string[]} allBullets - Array of bullet strings
 * @returns {Object} Repetition analysis
 */
function detectRepetition(allBullets) {
	const wordFrequency = {};
	const phraseFrequency = {};
	const starterFrequency = {};

	// Ignore common words
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"and",
		"or",
		"to",
		"in",
		"for",
		"of",
		"with",
		"on",
		"at",
		"by",
		"from",
		"as",
	]);

	allBullets.forEach((bullet) => {
		const words = bullet
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 3 && !stopWords.has(w));

		// Track first word (starter verb)
		if (words[0]) {
			starterFrequency[words[0]] = (starterFrequency[words[0]] || 0) + 1;
		}

		// Track word frequency
		words.forEach((word) => {
			wordFrequency[word] = (wordFrequency[word] || 0) + 1;
		});

		// Track 3-word phrases
		for (let i = 0; i < words.length - 2; i++) {
			const phrase = words.slice(i, i + 3).join(" ");
			if (phrase.length > 10) {
				phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
			}
		}
	});

	// Find repeated starters
	const repeatedStarters = Object.entries(starterFrequency)
		.filter(([_, count]) => count > 2)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 3);

	// Find repeated phrases
	const repeatedPhrases = Object.entries(phraseFrequency)
		.filter(([_, count]) => count > 1)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	return {
		hasRepetition: repeatedStarters.length > 0 || repeatedPhrases.length > 0,
		repeatedStarters: repeatedStarters.map(([word, count]) => ({
			word,
			count,
			suggestion: `"${word}" appears ${count} times as a starting verb. Vary your language.`,
		})),
		repeatedPhrases: repeatedPhrases.map(([phrase, count]) => ({
			phrase,
			count,
		})),
	};
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Split text into bullet points
 * @param {string} text - Raw text
 * @returns {string[]} Array of bullets
 */
function splitIntoBullets(text) {
	if (!text) return [];

	// Split by common bullet patterns
	const bullets = text
		.split(/(?:^|\n)\s*[•▪\-\*]\s*/g)
		.map((b) => b.trim())
		.filter((b) => b.length > 5);

	// If no bullets found, try splitting by newlines
	if (bullets.length <= 1) {
		return text
			.split(/\n+/)
			.map((b) => b.trim())
			.filter((b) => b.length > 10);
	}

	return bullets;
}

/**
 * Escape regex special characters
 */
function escapeRegex(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Calculate overall word count from text
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
function countWords(text) {
	if (!text) return 0;
	return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Extract all bullets from employment data
 * @param {Array} employment - Employment entries
 * @returns {string[]} All bullets
 */
function extractAllBullets(employment) {
	const allBullets = [];

	employment.forEach((job) => {
		if (job.description) {
			const bullets = splitIntoBullets(job.description);
			allBullets.push(...bullets);
		}
	});

	return allBullets;
}

module.exports = {
	findWeakVerbs,
	detectMetrics,
	detectImpactStatements,
	analyzeTenseConsistency,
	detectGrammarIssues,
	analyzeReadability,
	detectBuzzwords,
	detectRepetition,
	splitIntoBullets,
	countWords,
	extractAllBullets,
	WEAK_VERBS,
	STRONG_VERB_SUGGESTIONS,
};
