/**
 * ATS Scoring Configuration
 * Centralized weights and thresholds for the scoring engine
 * 
 * All weights are configurable here — no magic numbers in the scoring logic.
 * Weights should sum to 1.0 (100%) for proper weighted average calculation.
 */

// ============================================================================
// ANALYZER WEIGHTS
// ============================================================================

/**
 * Weight configuration for each analyzer category
 * Each category contains sub-analyzers with their own weights
 * 
 * Structure:
 * - categoryWeight: Weight of this category in overall score (0-1)
 * - analyzers: Individual analyzer weights within the category (should sum to 1)
 */
const SCORING_WEIGHTS = {
	// Writing Quality — Grammar, clarity, tense, readability
	writingQuality: {
		categoryWeight: 0.20, // 20% of total score
		analyzers: {
			grammar: 0.35,
			sentenceClarity: 0.20,
			tenseConsistency: 0.25,
			readability: 0.20,
		},
	},

	// Bullet Quality — Action verbs, impact, metrics, conciseness
	bulletQuality: {
		categoryWeight: 0.30, // 30% of total score (most important for ATS)
		analyzers: {
			weakVerbs: 0.30,
			impactScore: 0.30,
			metricsQuality: 0.25,
			conciseness: 0.15,
		},
	},

	// Resume Structure — Sections, ordering, contact info
	resumeStructure: {
		categoryWeight: 0.20, // 20% of total score
		analyzers: {
			sectionCompleteness: 0.35,
			contactDetails: 0.25,
			summaryEffectiveness: 0.20,
			lengthAndDensity: 0.10,
			sectionOrdering: 0.10,
		},
	},

	// ATS Compatibility — Formatting, bullet consistency
	atsCompatibility: {
		categoryWeight: 0.10, // 10% of total score
		analyzers: {
			formatting: 0.40,
			bulletConsistency: 0.30,
			atsReadability: 0.30,
		},
	},

	// Experience Relevance — Role depth, seniority, progression
	experienceRelevance: {
		categoryWeight: 0.10, // 10% of total score
		analyzers: {
			roleDepth: 0.30,
			seniorityAlignment: 0.25,
			careerProgression: 0.20,
			skillRelevance: 0.15,
			skillGrouping: 0.10,
		},
	},

	// Content Redundancy — Repetition, buzzwords, duplicates
	contentRedundancy: {
		categoryWeight: 0.10, // 10% of total score
		analyzers: {
			repeatedPhrases: 0.25,
			duplicateBullets: 0.20,
			repetitionScore: 0.15,
			buzzwordsAndCliches: 0.25,
			toneAndProfessionalism: 0.15,
		},
	},
};

// ============================================================================
// ANALYZER SCORING THRESHOLDS
// ============================================================================

/**
 * Thresholds for converting raw findings into scores
 * Each analyzer defines:
 * - maxIssues: Number of issues that results in 0 score
 * - penaltyPerIssue: Score reduction per issue found
 * - baseScore: Starting score (usually 100)
 */
const ANALYZER_THRESHOLDS = {
	grammar: {
		baseScore: 100,
		penaltyPerIssue: 12,
		maxPenalty: 100,
		minScore: 0,
	},
	sentenceClarity: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 60,
		minScore: 40,
	},
	tenseConsistency: {
		baseScore: 100,
		penaltyPerIssue: 15,
		maxPenalty: 75,
		minScore: 25,
	},
	readability: {
		baseScore: 100,
		penaltyPerIssue: 8,
		maxPenalty: 50,
		minScore: 50,
	},
	weakVerbs: {
		baseScore: 100,
		penaltyPerIssue: 8,
		maxPenalty: 80,
		minScore: 20,
	},
	impactScore: {
		// This is calculated differently — ratio-based
		baseScore: 100,
		// Score = impactRatio * 100
	},
	metricsQuality: {
		baseScore: 100,
		penaltyPerIssue: 6,
		maxPenalty: 60,
		minScore: 40,
	},
	conciseness: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 50,
		minScore: 50,
	},
	sectionCompleteness: {
		baseScore: 100,
		penaltyPerIssue: 20,
		maxPenalty: 80,
		minScore: 20,
	},
	contactDetails: {
		baseScore: 100,
		penaltyPerIssue: 15,
		maxPenalty: 45,
		minScore: 55,
	},
	summaryEffectiveness: {
		baseScore: 100,
		penaltyPerIssue: 15,
		maxPenalty: 60,
		minScore: 40,
	},
	lengthAndDensity: {
		baseScore: 100,
		penaltyPerIssue: 12,
		maxPenalty: 36,
		minScore: 64,
	},
	sectionOrdering: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 30,
		minScore: 70,
	},
	formatting: {
		baseScore: 100,
		penaltyPerIssue: 15,
		maxPenalty: 60,
		minScore: 40,
	},
	bulletConsistency: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 30,
		minScore: 70,
	},
	atsReadability: {
		baseScore: 85, // Default for builder resumes
		penaltyPerIssue: 10,
		maxPenalty: 40,
		minScore: 45,
	},
	roleDepth: {
		baseScore: 100,
		penaltyPerIssue: 15,
		maxPenalty: 60,
		minScore: 40,
	},
	seniorityAlignment: {
		baseScore: 100,
		penaltyPerIssue: 12,
		maxPenalty: 48,
		minScore: 52,
	},
	careerProgression: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 30,
		minScore: 70,
	},
	skillRelevance: {
		baseScore: 100,
		penaltyPerIssue: 8,
		maxPenalty: 40,
		minScore: 60,
	},
	skillGrouping: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 30,
		minScore: 70,
	},
	repeatedPhrases: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 50,
		minScore: 50,
	},
	duplicateBullets: {
		baseScore: 100,
		penaltyPerIssue: 15,
		maxPenalty: 60,
		minScore: 40,
	},
	repetitionScore: {
		baseScore: 100,
		penaltyPerIssue: 8,
		maxPenalty: 40,
		minScore: 60,
	},
	buzzwordsAndCliches: {
		baseScore: 100,
		penaltyPerIssue: 8,
		maxPenalty: 40,
		minScore: 60,
	},
	toneAndProfessionalism: {
		baseScore: 100,
		penaltyPerIssue: 10,
		maxPenalty: 40,
		minScore: 60,
	},
};

// ============================================================================
// EXPERIENCE LEVEL ADJUSTMENTS
// ============================================================================

/**
 * Adjustments to thresholds based on experience level
 * Higher levels have stricter expectations
 */
const EXPERIENCE_LEVEL_MODIFIERS = {
	junior: {
		// More lenient for juniors
		impactPenaltyMultiplier: 0.7,
		metricsPenaltyMultiplier: 0.6,
		seniorityPenaltyMultiplier: 0.5,
		minBulletsPerRole: 2,
		maxBulletsPerRole: 4,
	},
	mid: {
		// Standard expectations
		impactPenaltyMultiplier: 1.0,
		metricsPenaltyMultiplier: 1.0,
		seniorityPenaltyMultiplier: 1.0,
		minBulletsPerRole: 3,
		maxBulletsPerRole: 5,
	},
	senior: {
		// Stricter for senior roles
		impactPenaltyMultiplier: 1.3,
		metricsPenaltyMultiplier: 1.2,
		seniorityPenaltyMultiplier: 1.5,
		minBulletsPerRole: 4,
		maxBulletsPerRole: 6,
	},
};

// ============================================================================
// VERDICT THRESHOLDS
// ============================================================================

const VERDICT_THRESHOLDS = {
	excellent: 85,
	good: 70,
	needsImprovement: 55,
	// Below 55 = "Significant changes needed"
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate score for an analyzer based on occurrence count
 * @param {string} analyzerKey - Key of the analyzer
 * @param {number} occurrenceCount - Number of issues found
 * @returns {number} Score between 0-100
 */
function calculateAnalyzerScore(analyzerKey, occurrenceCount) {
	const config = ANALYZER_THRESHOLDS[analyzerKey];
	if (!config) {
		console.warn(`No threshold config for analyzer: ${analyzerKey}`);
		return 100;
	}

	const penalty = Math.min(
		occurrenceCount * config.penaltyPerIssue,
		config.maxPenalty
	);
	const score = Math.max(config.baseScore - penalty, config.minScore);

	return Math.round(score);
}

/**
 * Get weight for a specific analyzer
 * @param {string} category - Category name
 * @param {string} analyzerKey - Analyzer key
 * @returns {number} Weight value
 */
function getAnalyzerWeight(category, analyzerKey) {
	const cat = SCORING_WEIGHTS[category];
	if (!cat) return 0;
	return cat.analyzers[analyzerKey] || 0;
}

/**
 * Get category weight
 * @param {string} category - Category name
 * @returns {number} Category weight
 */
function getCategoryWeight(category) {
	return SCORING_WEIGHTS[category]?.categoryWeight || 0;
}

/**
 * Validate that all weights sum to 1.0
 * @returns {object} Validation result
 */
function validateWeights() {
	const categorySum = Object.values(SCORING_WEIGHTS).reduce(
		(sum, cat) => sum + cat.categoryWeight,
		0
	);

	const analyzerSums = {};
	Object.entries(SCORING_WEIGHTS).forEach(([catKey, cat]) => {
		analyzerSums[catKey] = Object.values(cat.analyzers).reduce(
			(sum, w) => sum + w,
			0
		);
	});

	const isValid =
		Math.abs(categorySum - 1.0) < 0.01 &&
		Object.values(analyzerSums).every((sum) => Math.abs(sum - 1.0) < 0.01);

	return {
		isValid,
		categorySum,
		analyzerSums,
	};
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
	SCORING_WEIGHTS,
	ANALYZER_THRESHOLDS,
	EXPERIENCE_LEVEL_MODIFIERS,
	VERDICT_THRESHOLDS,
	calculateAnalyzerScore,
	getAnalyzerWeight,
	getCategoryWeight,
	validateWeights,
};
