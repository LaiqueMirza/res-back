/**
 * NLP Pipeline for ATS Resume Analysis
 * Uses compromise.js for POS tagging, NER, and contextual analysis
 * 
 * This module provides structured feature extraction from resume text,
 * feeding into the scoring engine with linguistic context.
 */

const nlp = require("compromise");

// ============================================================================
// WEAK VERB CONTEXT ANALYSIS (POS-Based)
// ============================================================================

/**
 * Context patterns that justify normally-weak verbs
 * If a weak verb is followed by these patterns, it's acceptable
 */
const ACCEPTABLE_WEAK_VERB_CONTEXTS = [
	// Scale/impact patterns
	/\b(million|billion|thousand|[0-9]+[kmb])\b/i,
	/\b\d+%/,
	/\b\d+\+?\s*(users?|customers?|clients?|transactions?|requests?)/i,
	/\bscal(e|ed|ing)\b/i,
	/\b(enterprise|production|global|distributed)\b/i,
	
	// Technical complexity patterns
	/\b(architect|design|implement|infrastructure|system)/i,
	/\b(microservices?|kubernetes|docker|aws|gcp|azure)/i,
	/\b(migration|transformation|modernization)/i,
	
	// Leadership patterns
	/\b(team|cross-functional|stakeholder|executive)/i,
	/\b(mentor|coach|train|lead|direct)/i,
];

/**
 * Weak verbs that are context-dependent
 * These are only flagged if NOT followed by strong context
 */
const CONTEXT_DEPENDENT_WEAK_VERBS = [
	"worked",
	"helped",
	"assisted",
	"supported",
	"contributed",
	"participated",
	"involved",
	"handled",
	"managed",
	"utilized",
];

/**
 * Always-weak verbs that should be flagged regardless of context
 */
const ALWAYS_WEAK_VERBS = [
	"was",
	"were",
	"had",
	"have",
	"been",
	"being",
	"got",
	"did",
	"made",
];

/**
 * Analyze weak verbs with NLP context awareness
 * @param {string} text - Text to analyze
 * @returns {object} Analysis result with contextual findings
 */
function analyzeWeakVerbsWithContext(text) {
	const doc = nlp(text);
	const findings = [];
	const verbAnalysis = [];

	// Get all verbs from the text
	const verbs = doc.verbs();
	
	// Split text into sentences/bullets for context analysis
	const sentences = text.split(/[.•\n]+/).filter(s => s.trim().length > 10);

	sentences.forEach((sentence) => {
		const sentenceDoc = nlp(sentence);
		const sentenceVerbs = sentenceDoc.verbs().out("array");
		const lowerSentence = sentence.toLowerCase();

		sentenceVerbs.forEach((verb) => {
			const lowerVerb = verb.toLowerCase().trim();
			const verbRoot = nlp(verb).verbs().toInfinitive().out("text").toLowerCase() || lowerVerb;

			// Check if it's an always-weak verb
			if (ALWAYS_WEAK_VERBS.some(wv => lowerVerb.includes(wv))) {
				findings.push({
					verb: verb,
					verbRoot: verbRoot,
					sentence: sentence.substring(0, 100),
					severity: "high",
					contextJustified: false,
					suggestion: `Start with a strong action verb instead of "${verb}"`,
				});
				verbAnalysis.push({ verb, isWeak: true, contextJustified: false });
				return;
			}

			// Check if it's a context-dependent weak verb
			const isContextDependent = CONTEXT_DEPENDENT_WEAK_VERBS.some(
				wv => lowerVerb.includes(wv) || verbRoot.includes(wv)
			);

			if (isContextDependent) {
				// Check if context justifies the weak verb
				const hasStrongContext = ACCEPTABLE_WEAK_VERB_CONTEXTS.some(
					pattern => pattern.test(sentence)
				);

				if (!hasStrongContext) {
					findings.push({
						verb: verb,
						verbRoot: verbRoot,
						sentence: sentence.substring(0, 100),
						severity: "medium",
						contextJustified: false,
						suggestion: `Replace "${verb}" with a stronger action verb showing ownership`,
					});
					verbAnalysis.push({ verb, isWeak: true, contextJustified: false });
				} else {
					// Weak verb but justified by context
					verbAnalysis.push({ verb, isWeak: true, contextJustified: true });
				}
			} else {
				verbAnalysis.push({ verb, isWeak: false, contextJustified: true });
			}
		});
	});

	return {
		findings,
		verbAnalysis,
		totalVerbs: verbAnalysis.length,
		weakVerbCount: findings.length,
		contextJustifiedCount: verbAnalysis.filter(v => v.isWeak && v.contextJustified).length,
	};
}

// ============================================================================
// NAMED ENTITY RECOGNITION (NER)
// ============================================================================

/**
 * Common tech companies for NER
 */
const KNOWN_COMPANIES = new Set([
	"google", "meta", "facebook", "amazon", "apple", "microsoft", "netflix",
	"uber", "airbnb", "stripe", "shopify", "salesforce", "oracle", "ibm",
	"twitter", "linkedin", "github", "atlassian", "slack", "dropbox",
	"spotify", "adobe", "intuit", "paypal", "square", "coinbase",
]);

/**
 * Common job title patterns
 */
const JOB_TITLE_PATTERNS = [
	/\b(senior|junior|lead|principal|staff|chief|head|director|vp|cto|ceo|cfo|coo)\s+\w+/gi,
	/\b(software|frontend|backend|full[- ]?stack|devops|data|ml|ai|cloud|security|qa|test)\s+engineer/gi,
	/\b(product|project|program|engineering|technical)\s+manager/gi,
	/\b(data|research|business|systems?)\s+(scientist|analyst|engineer)/gi,
	/\b(developer|architect|consultant|specialist|coordinator|administrator)/gi,
	/\b(intern|associate|assistant|executive)\b/gi,
];

/**
 * Technology and skill patterns
 */
const TECH_PATTERNS = {
	languages: [
		/\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|golang|rust|swift|kotlin|php|scala|perl|r)\b/gi,
	],
	frameworks: [
		/\b(react|angular|vue|next\.?js|node\.?js|express|django|flask|spring|rails|laravel|fastapi)\b/gi,
	],
	databases: [
		/\b(mysql|postgresql|postgres|mongodb|redis|elasticsearch|dynamodb|cassandra|sqlite|oracle|sql server)\b/gi,
	],
	cloud: [
		/\b(aws|azure|gcp|google cloud|heroku|vercel|netlify|digitalocean|cloudflare)\b/gi,
	],
	devops: [
		/\b(docker|kubernetes|k8s|jenkins|terraform|ansible|ci\/cd|github actions|gitlab|circleci)\b/gi,
	],
	tools: [
		/\b(git|jira|confluence|figma|sketch|postman|webpack|vite|babel|eslint|jest|cypress)\b/gi,
	],
};

/**
 * Extract named entities from resume text
 * @param {string} text - Text to analyze
 * @returns {object} Extracted entities
 */
function extractNamedEntities(text) {
	const doc = nlp(text);
	
	const entities = {
		organizations: [],
		jobTitles: [],
		technologies: {
			languages: [],
			frameworks: [],
			databases: [],
			cloud: [],
			devops: [],
			tools: [],
		},
		people: [],
		places: [],
		dates: [],
		metrics: [],
	};

	// Extract organizations using compromise
	const orgs = doc.organizations().out("array");
	entities.organizations = [...new Set(orgs.map(o => o.trim()).filter(Boolean))];

	// Extract people names
	const people = doc.people().out("array");
	entities.people = [...new Set(people.map(p => p.trim()).filter(Boolean))];

	// Extract places
	const places = doc.places().out("array");
	entities.places = [...new Set(places.map(p => p.trim()).filter(Boolean))];

	// Extract dates using regex patterns (compromise doesn't have .dates())
	const datePatterns = [
		/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/gi,
		/\b\d{4}\s*[-–]\s*(?:\d{4}|Present|Current)\b/gi,
		/\b\d{1,2}\/\d{4}\b/g,
	];
	datePatterns.forEach(pattern => {
		const matches = text.match(pattern);
		if (matches) {
			entities.dates.push(...matches);
		}
	});
	entities.dates = [...new Set(entities.dates)];

	// Extract job titles using patterns
	JOB_TITLE_PATTERNS.forEach(pattern => {
		const matches = text.match(pattern);
		if (matches) {
			entities.jobTitles.push(...matches.map(m => m.trim()));
		}
	});
	entities.jobTitles = [...new Set(entities.jobTitles)];

	// Extract technologies by category
	Object.entries(TECH_PATTERNS).forEach(([category, patterns]) => {
		patterns.forEach(pattern => {
			const matches = text.match(pattern);
			if (matches) {
				entities.technologies[category].push(...matches.map(m => m.toLowerCase().trim()));
			}
		});
		entities.technologies[category] = [...new Set(entities.technologies[category])];
	});

	// Extract metrics (numbers with context)
	const metricPatterns = [
		/\d+%/g,
		/\$[\d,]+[kmb]?/gi,
		/\d+[kmb]\+?\s*(users?|customers?|requests?|transactions?)/gi,
		/\d+x\s+\w+/gi,
	];
	metricPatterns.forEach(pattern => {
		const matches = text.match(pattern);
		if (matches) {
			entities.metrics.push(...matches);
		}
	});
	entities.metrics = [...new Set(entities.metrics)];

	// Add known companies if mentioned
	const lowerText = text.toLowerCase();
	KNOWN_COMPANIES.forEach(company => {
		if (lowerText.includes(company) && !entities.organizations.some(o => o.toLowerCase() === company)) {
			entities.organizations.push(company.charAt(0).toUpperCase() + company.slice(1));
		}
	});

	return entities;
}

// ============================================================================
// SENTENCE STRUCTURE ANALYSIS
// ============================================================================

/**
 * Analyze sentence structure for quality metrics
 * @param {string} text - Text to analyze
 * @returns {object} Sentence analysis
 */
function analyzeSentenceStructure(text) {
	const doc = nlp(text);
	const sentences = doc.sentences().out("array");
	
	const analysis = {
		totalSentences: sentences.length,
		avgWordsPerSentence: 0,
		passiveVoiceCount: 0,
		passiveVoiceSentences: [],
		complexSentences: [],
		questionCount: 0,
	};

	let totalWords = 0;

	sentences.forEach(sentence => {
		const sentDoc = nlp(sentence);
		const wordCount = sentDoc.wordCount();
		totalWords += wordCount;

		// Detect passive voice
		if (sentDoc.has("#Passive")) {
			analysis.passiveVoiceCount++;
			analysis.passiveVoiceSentences.push(sentence.substring(0, 80));
		}

		// Detect complex sentences (many clauses)
		if (wordCount > 30) {
			analysis.complexSentences.push({
				text: sentence.substring(0, 100),
				wordCount,
			});
		}

		// Count questions
		if (sentDoc.has("#QuestionWord") || sentence.trim().endsWith("?")) {
			analysis.questionCount++;
		}
	});

	analysis.avgWordsPerSentence = sentences.length > 0 
		? Math.round(totalWords / sentences.length) 
		: 0;

	return analysis;
}

// ============================================================================
// IMPACT STATEMENT ANALYSIS (NLP-Enhanced)
// ============================================================================

/**
 * Action verbs that indicate impact
 */
const IMPACT_VERBS = [
	"achieved", "delivered", "increased", "decreased", "reduced", "improved",
	"saved", "generated", "drove", "boosted", "enhanced", "streamlined",
	"accelerated", "launched", "built", "created", "developed", "designed",
	"implemented", "architected", "led", "managed", "directed", "orchestrated",
	"transformed", "optimized", "automated", "scaled", "pioneered", "established",
];

/**
 * Analyze impact statements with NLP
 * @param {string} text - Text to analyze
 * @returns {object} Impact analysis
 */
function analyzeImpactStatements(text) {
	const doc = nlp(text);
	const sentences = text.split(/[.•\n]+/).filter(s => s.trim().length > 10);
	
	const impactBullets = [];
	const lowImpactBullets = [];

	sentences.forEach(sentence => {
		const sentDoc = nlp(sentence);
		const verbs = sentDoc.verbs().toInfinitive().out("array").map(v => v.toLowerCase());
		
		// Check for impact verbs
		const hasImpactVerb = verbs.some(v => IMPACT_VERBS.includes(v));
		
		// Check for metrics
		const hasMetric = /\d+%|\$[\d,]+|\d+[kmb]/i.test(sentence);
		
		// Check for result phrases
		const hasResultPhrase = /result(ed|ing)?\s+in|leading to|which\s+\w+/i.test(sentence);

		if (hasImpactVerb || hasMetric || hasResultPhrase) {
			impactBullets.push({
				text: sentence.substring(0, 100),
				hasMetric,
				hasImpactVerb,
				hasResultPhrase,
				impactScore: (hasImpactVerb ? 1 : 0) + (hasMetric ? 2 : 0) + (hasResultPhrase ? 1 : 0),
			});
		} else if (sentence.length > 30) {
			lowImpactBullets.push({
				text: sentence.substring(0, 100),
				suggestion: "Add measurable outcome or start with an impact verb",
			});
		}
	});

	const totalBullets = impactBullets.length + lowImpactBullets.length;
	
	return {
		impactBullets,
		lowImpactBullets,
		totalBullets,
		impactRatio: totalBullets > 0 ? impactBullets.length / totalBullets : 0,
		avgImpactScore: impactBullets.length > 0
			? impactBullets.reduce((sum, b) => sum + b.impactScore, 0) / impactBullets.length
			: 0,
	};
}

// ============================================================================
// FULL NLP PIPELINE
// ============================================================================

/**
 * Run full NLP analysis pipeline on resume text
 * @param {string} text - Full resume text
 * @param {object} parsedData - Parsed resume data for context
 * @returns {object} Complete NLP analysis results
 */
function runNLPPipeline(text, parsedData = {}) {
	// Extract employment text specifically
	const employmentText = (parsedData.employment || [])
		.map(job => job.description || "")
		.join("\n");

	const summaryText = parsedData.profileSummary?.info || "";
	const allText = `${summaryText}\n${employmentText}`.trim();

	// Run all analyses
	const weakVerbAnalysis = analyzeWeakVerbsWithContext(employmentText || text);
	const entities = extractNamedEntities(allText || text);
	const sentenceAnalysis = analyzeSentenceStructure(employmentText || text);
	const impactAnalysis = analyzeImpactStatements(employmentText || text);

	// Calculate derived metrics
	const totalTechnologies = Object.values(entities.technologies)
		.reduce((sum, arr) => sum + arr.length, 0);

	return {
		// Weak verb analysis (context-aware)
		weakVerbs: {
			findings: weakVerbAnalysis.findings,
			totalVerbs: weakVerbAnalysis.totalVerbs,
			weakVerbCount: weakVerbAnalysis.weakVerbCount,
			contextJustifiedCount: weakVerbAnalysis.contextJustifiedCount,
			// Score adjustment: don't penalize context-justified weak verbs
			adjustedWeakVerbCount: weakVerbAnalysis.weakVerbCount,
		},

		// Named entities
		entities: {
			organizations: entities.organizations,
			jobTitles: entities.jobTitles,
			technologies: entities.technologies,
			totalTechnologies,
			metrics: entities.metrics,
			metricsCount: entities.metrics.length,
		},

		// Sentence structure
		sentenceStructure: {
			totalSentences: sentenceAnalysis.totalSentences,
			avgWordsPerSentence: sentenceAnalysis.avgWordsPerSentence,
			passiveVoiceCount: sentenceAnalysis.passiveVoiceCount,
			passiveVoiceSentences: sentenceAnalysis.passiveVoiceSentences,
			complexSentences: sentenceAnalysis.complexSentences,
		},

		// Impact analysis
		impact: {
			impactRatio: impactAnalysis.impactRatio,
			avgImpactScore: impactAnalysis.avgImpactScore,
			highImpactCount: impactAnalysis.impactBullets.length,
			lowImpactCount: impactAnalysis.lowImpactBullets.length,
			lowImpactBullets: impactAnalysis.lowImpactBullets.slice(0, 5),
		},

		// Raw data for further processing
		_raw: {
			employmentText,
			summaryText,
			allText,
		},
	};
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
	// Main pipeline
	runNLPPipeline,

	// Individual analyzers
	analyzeWeakVerbsWithContext,
	extractNamedEntities,
	analyzeSentenceStructure,
	analyzeImpactStatements,

	// Constants (for testing/extension)
	ACCEPTABLE_WEAK_VERB_CONTEXTS,
	CONTEXT_DEPENDENT_WEAK_VERBS,
	ALWAYS_WEAK_VERBS,
	IMPACT_VERBS,
	TECH_PATTERNS,
	JOB_TITLE_PATTERNS,
};
