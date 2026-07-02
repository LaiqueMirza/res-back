/**
 * ATS Module Index
 * Exports all ATS scoring functionality
 */

const { generateATSScore, runFullAnalysis } = require("./scoringEngine");
const {
	findWeakVerbs,
	detectMetrics,
	detectImpactStatements,
	analyzeReadability,
	detectBuzzwords,
	detectRepetition,
} = require("./textAnalyzer");
const { SCORE_CARD_TEMPLATES, buildScoreCard } = require("./scoreCardTemplates");

module.exports = {
	// Main scoring function
	generateATSScore,
	runFullAnalysis,

	// Text analysis utilities
	findWeakVerbs,
	detectMetrics,
	detectImpactStatements,
	analyzeReadability,
	detectBuzzwords,
	detectRepetition,

	// Score card utilities
	SCORE_CARD_TEMPLATES,
	buildScoreCard,
};
