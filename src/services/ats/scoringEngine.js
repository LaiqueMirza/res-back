/**
 * ATS Scoring Engine
 * Main orchestration layer that transforms parsed resume data into ATS score response
 */

const {
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
} = require("./textAnalyzer");

const { buildScoreCard } = require("./scoreCardTemplates");

// ============================================================================
// MAIN SCORING ENGINE
// ============================================================================

/**
 * Transform parsed resume data into full ATS score response
 * @param {Object} parsedData - Parsed resume data from parser
 * @param {string} userId - User ID
 * @param {string} experienceLevel - Experience level: "junior" | "mid" | "senior"
 * @param {Object} options - Additional options
 * @returns {Object} Complete ATS score response
 */
function generateATSScore(parsedData, userId, experienceLevel = "mid", options = {}) {
	// Validate input
	if (!parsedData) {
		throw new Error("Parsed resume data is required");
	}

	// Generate unique result ID
	const atsResultId = `ats_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

	// Run all analyses
	const analysisResults = runFullAnalysis(parsedData, experienceLevel);

	// Calculate overall scores
	const scores = calculateOverallScores(analysisResults);

	// Build score cards
	const scoreCards = buildAllScoreCards(analysisResults);

	// Generate summary
	const summary = generateSummary(scores, analysisResults);

	// Build metadata
	const metadata = buildMetadata(parsedData, analysisResults);

	// Assemble final response
	return {
		atsResultId,
		userId,
		experienceLevel,
		resumeSource: options.resumeSource || "upload",
		pdfUrl: options.pdfUrl || "",
		overallScore: scores.overall,
		scoreBreakdown: {
			grammarScore: scores.grammar,
			weakVerbScore: scores.weakVerb,
			impactScore: scores.impact,
			sectionCompletenessScore: scores.sectionCompleteness,
		},
		summary,
		score_cards: scoreCards,
		metadata,
	};
}

// ============================================================================
// FULL ANALYSIS RUNNER
// ============================================================================

/**
 * Run comprehensive analysis on all resume sections
 * @param {Object} parsedData - Parsed resume data
 * @param {string} experienceLevel - Experience level
 * @returns {Object} All analysis results
 */
function runFullAnalysis(parsedData, experienceLevel) {
	const {
		employment = [],
		education = [],
		skills = [],
		profileSummary = {},
		personalDetails = {},
		websitesAndSocialLinks = [],
		certificates = [],
		courses = [],
		languages = [],
	} = parsedData;

	// Extract all text content
	const allBullets = extractAllBullets(employment);
	const allEmploymentText = employment
		.map((job) => job.description || "")
		.join("\n");
	const summaryText = profileSummary?.info || "";

	// -------------------------------------------------------------------------
	// WRITING QUALITY ANALYSIS
	// -------------------------------------------------------------------------

	// Grammar analysis
	const grammarFindings = detectGrammarIssues(allEmploymentText);

	// Tense consistency (analyze by job)
	const tenseAnalysis = employment.map((job) =>
		analyzeTenseConsistency(job.description || "", job.isPresent)
	);
	const tenseFindings = tenseAnalysis.flatMap((t) => t.findings);
	const tenseInconsistentCount = tenseAnalysis.filter(
		(t) => !t.isConsistent
	).length;

	// Readability analysis
	const readabilityAnalysis = analyzeReadability(allEmploymentText);

	// Sentence clarity (based on complex sentences)
	const clarityIssues = readabilityAnalysis.complexSentences.map((s) => ({
		matchedWords: [s.complexPhrase],
		textSnippet: s.text,
		suggestion: `Simplify "${s.complexPhrase}" for better readability`,
	}));

	// -------------------------------------------------------------------------
	// BULLET QUALITY ANALYSIS
	// -------------------------------------------------------------------------

	// Weak verbs
	const weakVerbFindings = findWeakVerbs(allEmploymentText);

	// Impact statements
	const impactAnalysis = detectImpactStatements(allEmploymentText);
	const impactFindings = impactAnalysis.lowImpactBullets
		.slice(0, 5)
		.map((bullet) => ({
			matchedWords: [],
			textSnippet: bullet.substring(0, 100),
			suggestion:
				"Add measurable outcome or achievement to show impact",
		}));

	// Metrics detection
	const metricsAnalysis = detectMetrics(allEmploymentText);

	// Conciseness (long bullets)
	const concisenessFindings = readabilityAnalysis.longBullets.map((b) => ({
		matchedWords: [],
		textSnippet: b.text,
		suggestion: `Too long (${b.wordCount} words). Keep bullets under 25 words.`,
	}));

	// -------------------------------------------------------------------------
	// RESUME STRUCTURE ANALYSIS
	// -------------------------------------------------------------------------

	const sectionAnalysis = analyzeRequiredSections(parsedData, experienceLevel);
	const contactAnalysis = analyzeContactDetails(personalDetails, websitesAndSocialLinks);
	const summaryAnalysis = analyzeSummary(summaryText, experienceLevel);
	const orderingAnalysis = analyzeSectionOrdering(parsedData, experienceLevel);
	const lengthAnalysis = analyzeLengthAndDensity(parsedData, allBullets, experienceLevel);

	// -------------------------------------------------------------------------
	// ATS COMPATIBILITY ANALYSIS
	// -------------------------------------------------------------------------

	const formattingAnalysis = analyzeFormatting(allEmploymentText);
	const bulletConsistencyAnalysis = analyzeBulletConsistency(employment);

	// -------------------------------------------------------------------------
	// EXPERIENCE RELEVANCE ANALYSIS
	// -------------------------------------------------------------------------

	const roleDepthAnalysis = analyzeRoleDepth(employment);
	const seniorityAnalysis = analyzeSeniorityAlignment(employment, experienceLevel);
	const progressionAnalysis = analyzeCareerProgression(employment);
	const skillAnalysis = analyzeSkills(skills, employment);

	// -------------------------------------------------------------------------
	// CONTENT REDUNDANCY ANALYSIS
	// -------------------------------------------------------------------------

	const repetitionAnalysis = detectRepetition(allBullets);
	const buzzwordAnalysis = detectBuzzwords(allEmploymentText + " " + summaryText);
	const duplicateAnalysis = findDuplicateBullets(allBullets);
	const toneAnalysis = analyzeTone(allEmploymentText);

	// Combine all results
	return {
		// Writing Quality
		grammar: {
			occurrenceCount: grammarFindings.length,
			affectedBulletsCount: Math.min(grammarFindings.length, allBullets.length),
			findings: grammarFindings,
		},
		sentenceClarity: {
			occurrenceCount: clarityIssues.length,
			affectedBulletsCount: clarityIssues.length,
			findings: clarityIssues,
		},
		tenseConsistency: {
			occurrenceCount: tenseInconsistentCount,
			affectedBulletsCount: tenseFindings.length,
			findings: tenseFindings,
		},
		readability: {
			occurrenceCount: readabilityAnalysis.longBulletCount,
			affectedBulletsCount: readabilityAnalysis.longBulletCount,
			findings: readabilityAnalysis.longBullets.slice(0, 3).map((b) => ({
				matchedWords: [],
				textSnippet: b.text,
				suggestion: "Shorten to improve readability",
			})),
			score: readabilityAnalysis.readabilityScore,
		},

		// Bullet Quality
		weakVerbs: {
			occurrenceCount: weakVerbFindings.length,
			affectedBulletsCount: Math.min(weakVerbFindings.length, allBullets.length),
			findings: weakVerbFindings,
		},
		impactScore: {
			occurrenceCount: impactAnalysis.lowImpactBulletCount,
			affectedBulletsCount: impactAnalysis.lowImpactBulletCount,
			findings: impactFindings,
			impactRatio: impactAnalysis.impactRatio,
		},
		conciseness: {
			occurrenceCount: concisenessFindings.length,
			affectedBulletsCount: concisenessFindings.length,
			findings: concisenessFindings,
		},
		metricsQuality: {
			occurrenceCount: metricsAnalysis.bulletsWithoutMetrics,
			affectedBulletsCount: metricsAnalysis.bulletsWithoutMetrics,
			findings: metricsAnalysis.findingsForMissingMetrics,
			metricsFound: metricsAnalysis.totalMetricsFound,
		},

		// Resume Structure
		sectionCompleteness: sectionAnalysis,
		sectionOrdering: orderingAnalysis,
		summaryEffectiveness: summaryAnalysis,
		contactDetails: contactAnalysis,
		lengthAndDensity: lengthAnalysis,

		// ATS Compatibility
		formatting: formattingAnalysis,
		bulletConsistency: bulletConsistencyAnalysis,
		atsReadability: {
			occurrenceCount: 0, // Would require PDF analysis
			affectedBulletsCount: 0,
			findings: [],
			score: 85, // Default good score for builder resumes
		},

		// Experience Relevance
		roleDepth: roleDepthAnalysis,
		seniorityAlignment: seniorityAnalysis,
		careerProgression: progressionAnalysis,
		skillRelevance: skillAnalysis.relevance,
		skillGrouping: skillAnalysis.grouping,

		// Content Redundancy
		repeatedPhrases: {
			occurrenceCount: repetitionAnalysis.repeatedStarters.length,
			affectedBulletsCount: repetitionAnalysis.repeatedStarters.reduce(
				(sum, r) => sum + r.count,
				0
			),
			findings: repetitionAnalysis.repeatedStarters.map((r) => ({
				matchedWords: [r.word],
				textSnippet: r.suggestion,
				suggestion: `Vary starting verb — "${r.word}" used ${r.count} times`,
			})),
		},
		duplicateBullets: duplicateAnalysis,
		repetitionScore: {
			occurrenceCount: repetitionAnalysis.hasRepetition ? 1 : 0,
			affectedBulletsCount: 0,
			findings: repetitionAnalysis.repeatedPhrases.slice(0, 3).map((p) => ({
				matchedWords: [p.phrase],
				textSnippet: `"${p.phrase}" used ${p.count} times`,
				suggestion: "Vary your phrasing",
			})),
		},
		buzzwordsAndCliches: {
			occurrenceCount: buzzwordAnalysis.buzzwordCount,
			affectedBulletsCount: buzzwordAnalysis.buzzwordCount,
			findings: buzzwordAnalysis.findings,
		},
		toneAndProfessionalism: toneAnalysis,

		// Raw data for score calculation
		_rawMetrics: {
			totalBullets: allBullets.length,
			totalWords: readabilityAnalysis.totalWords,
			avgWordsPerBullet: readabilityAnalysis.avgWordsPerBullet,
			impactRatio: impactAnalysis.impactRatio,
			metricsFound: metricsAnalysis.totalMetricsFound,
		},
	};
}

// ============================================================================
// SECTION-SPECIFIC ANALYZERS
// ============================================================================

/**
 * Analyze if all required sections are present
 */
function analyzeRequiredSections(parsedData, experienceLevel) {
	const missingSections = [];
	const findings = [];

	// Check required sections
	if (!parsedData.profileSummary?.info || parsedData.profileSummary.info.length < 50) {
		missingSections.push("Professional Summary");
		findings.push({
			matchedWords: [],
			textSnippet: "No professional summary or summary is too short",
			suggestion: "Add a 3-4 sentence professional summary",
		});
	}

	if (!parsedData.employment || parsedData.employment.length === 0) {
		missingSections.push("Work Experience");
		findings.push({
			matchedWords: [],
			textSnippet: "No work experience section found",
			suggestion: "Add your work experience with detailed descriptions",
		});
	}

	if (!parsedData.skills || parsedData.skills.length === 0) {
		missingSections.push("Skills");
		findings.push({
			matchedWords: [],
			textSnippet: "No skills section found",
			suggestion: "Add a skills section with relevant technical and soft skills",
		});
	}

	if (experienceLevel === "junior" && (!parsedData.education || parsedData.education.length === 0)) {
		missingSections.push("Education");
		findings.push({
			matchedWords: [],
			textSnippet: "No education section found",
			suggestion: "Add your educational background",
		});
	}

	return {
		occurrenceCount: missingSections.length,
		affectedBulletsCount: 0,
		findings,
		missingSections,
	};
}

/**
 * Analyze contact details completeness
 */
function analyzeContactDetails(personalDetails, socialLinks) {
	const missing = [];
	const findings = [];

	if (!personalDetails.email) {
		missing.push("email");
		findings.push({
			matchedWords: [],
			textSnippet: "Email address not found",
			suggestion: "Add a professional email address",
		});
	}

	if (!personalDetails.phone) {
		missing.push("phone");
		findings.push({
			matchedWords: [],
			textSnippet: "Phone number not found",
			suggestion: "Add a phone number for recruiters to contact you",
		});
	}

	// Check for LinkedIn
	const hasLinkedIn = socialLinks.some(
		(link) =>
			link.link?.toLowerCase().includes("linkedin") ||
			link.label?.toLowerCase().includes("linkedin")
	);
	if (!hasLinkedIn) {
		missing.push("linkedin");
		findings.push({
			matchedWords: [],
			textSnippet: "LinkedIn profile not found",
			suggestion: "Add your LinkedIn profile URL",
		});
	}

	return {
		occurrenceCount: missing.length,
		affectedBulletsCount: 0,
		findings,
		missingItems: missing,
	};
}

/**
 * Analyze professional summary quality
 */
function analyzeSummary(summaryText, experienceLevel) {
	const findings = [];
	let issues = 0;

	if (!summaryText || summaryText.length < 50) {
		issues++;
		findings.push({
			matchedWords: [],
			textSnippet: summaryText || "No summary found",
			suggestion: "Add a professional summary with 3-4 sentences",
		});
	} else {
		// Check for specificity
		const hasYearsExperience = /\d+\+?\s*(years?|yrs?)/i.test(summaryText);
		const hasRole = /developer|engineer|manager|designer|analyst/i.test(summaryText);

		if (!hasYearsExperience) {
			issues++;
			findings.push({
				matchedWords: [],
				textSnippet: summaryText.substring(0, 80),
				suggestion: "Include years of experience in your summary",
			});
		}

		if (!hasRole) {
			issues++;
			findings.push({
				matchedWords: [],
				textSnippet: summaryText.substring(0, 80),
				suggestion: "Clearly state your role/title in the summary",
			});
		}

		// Check for vague language
		const buzzwordAnalysis = detectBuzzwords(summaryText);
		if (buzzwordAnalysis.buzzwordCount > 0) {
			issues++;
			findings.push(...buzzwordAnalysis.findings.slice(0, 2));
		}
	}

	return {
		occurrenceCount: issues,
		affectedBulletsCount: 0,
		findings,
	};
}

/**
 * Analyze section ordering for experience level
 */
function analyzeSectionOrdering(parsedData, experienceLevel) {
	// For mid/senior, experience should come before education
	// For junior, education can come first
	const findings = [];
	let issues = 0;

	// This would require section position data from parser
	// For now, return minimal analysis
	if (experienceLevel !== "junior" && parsedData.education?.length > 0 && parsedData.employment?.length > 0) {
		// Check if education has dates more recent than employment
		// This is a simplified heuristic
		const hasRecentEducation = parsedData.education.some((edu) => {
			const eduYear = parseInt(edu.endDate?.substring(0, 4) || "0");
			return eduYear > 2020;
		});

		if (hasRecentEducation && experienceLevel === "senior") {
			issues++;
			findings.push({
				matchedWords: [],
				textSnippet: "Education appears prominent",
				suggestion: "For senior roles, emphasize experience over education",
			});
		}
	}

	return {
		occurrenceCount: issues,
		affectedBulletsCount: 0,
		findings,
	};
}

/**
 * Analyze resume length and content density
 */
function analyzeLengthAndDensity(parsedData, allBullets, experienceLevel) {
	const findings = [];
	let issues = 0;

	const bulletCount = allBullets.length;
	const jobCount = parsedData.employment?.length || 0;

	// Heuristics based on experience level
	const idealBulletsPerJob = {
		junior: { min: 2, max: 4 },
		mid: { min: 3, max: 5 },
		senior: { min: 4, max: 6 },
	};

	const ideal = idealBulletsPerJob[experienceLevel] || idealBulletsPerJob.mid;
	const avgBulletsPerJob = jobCount > 0 ? bulletCount / jobCount : 0;

	if (avgBulletsPerJob < ideal.min) {
		issues++;
		findings.push({
			matchedWords: [],
			textSnippet: `Average ${Math.round(avgBulletsPerJob)} bullets per role`,
			suggestion: `Add more bullet points (aim for ${ideal.min}-${ideal.max} per role)`,
		});
	} else if (avgBulletsPerJob > ideal.max + 2) {
		issues++;
		findings.push({
			matchedWords: [],
			textSnippet: `Average ${Math.round(avgBulletsPerJob)} bullets per role`,
			suggestion: `Reduce bullets to focus on key achievements (aim for ${ideal.min}-${ideal.max} per role)`,
		});
	}

	// Check total bullets for experience level
	const maxBullets = { junior: 15, mid: 25, senior: 35 };
	if (bulletCount > maxBullets[experienceLevel]) {
		issues++;
		findings.push({
			matchedWords: [],
			textSnippet: `${bulletCount} total bullets`,
			suggestion: "Resume may be too long. Focus on most impactful achievements.",
		});
	}

	return {
		occurrenceCount: issues,
		affectedBulletsCount: 0,
		findings,
	};
}

/**
 * Analyze formatting for ATS compatibility
 */
function analyzeFormatting(text) {
	const findings = [];

	// Check for problematic spacing (spaced out letters like "H D F C")
	const spacedText = text.match(/\b([A-Z]\s){2,}[A-Z]\b/g);
	if (spacedText) {
		findings.push({
			matchedWords: spacedText.slice(0, 2),
			textSnippet: spacedText[0],
			suggestion: "Remove extra spacing between letters (ATS cannot parse)",
		});
	}

	// Check for unusual characters
	const unusualChars = text.match(/[▪▸►◆●○■□]/g);
	if (unusualChars && unusualChars.length > 2) {
		findings.push({
			matchedWords: [...new Set(unusualChars)],
			textSnippet: "Non-standard bullet characters detected",
			suggestion: "Use simple bullet points (• or -) for ATS compatibility",
		});
	}

	return {
		occurrenceCount: findings.length,
		affectedBulletsCount: 0,
		findings,
	};
}

/**
 * Analyze bullet style consistency
 */
function analyzeBulletConsistency(employment) {
	const bulletStyles = new Set();
	const allText = employment.map((job) => job.description || "").join("\n");

	// Detect different bullet types
	if (/^•/m.test(allText)) bulletStyles.add("•");
	if (/^-\s/m.test(allText)) bulletStyles.add("-");
	if (/^▪/m.test(allText)) bulletStyles.add("▪");
	if (/^\*/m.test(allText)) bulletStyles.add("*");

	const findings = [];
	if (bulletStyles.size > 1) {
		findings.push({
			matchedWords: [...bulletStyles],
			textSnippet: `Multiple bullet styles detected: ${[...bulletStyles].join(", ")}`,
			suggestion: "Use consistent bullet formatting throughout",
		});
	}

	return {
		occurrenceCount: bulletStyles.size > 1 ? bulletStyles.size - 1 : 0,
		affectedBulletsCount: 0,
		findings,
	};
}

/**
 * Analyze role description depth
 */
function analyzeRoleDepth(employment) {
	const findings = [];
	let shallowRoles = 0;

	employment.forEach((job) => {
		const bullets = splitIntoBullets(job.description || "");
		if (bullets.length < 2) {
			shallowRoles++;
			findings.push({
				matchedWords: [],
				textSnippet: `${job.jobTitle || "Role"} at ${job.employer || "Company"}: ${bullets.length} bullet(s)`,
				suggestion: "Add more detail about responsibilities and achievements",
			});
		}
	});

	return {
		occurrenceCount: shallowRoles,
		affectedBulletsCount: 0,
		findings: findings.slice(0, 3),
	};
}

/**
 * Analyze seniority alignment in language
 */
function analyzeSeniorityAlignment(employment, experienceLevel) {
	const findings = [];
	let misalignments = 0;

	const seniorKeywords = ["led", "architected", "designed", "managed", "directed", "mentored", "spearheaded"];
	const juniorKeywords = ["assisted", "helped", "supported", "learned", "trained"];

	const allText = employment.map((job) => job.description || "").join(" ").toLowerCase();

	if (experienceLevel === "senior" || experienceLevel === "mid") {
		// Check for junior language
		juniorKeywords.forEach((keyword) => {
			if (allText.includes(keyword)) {
				misalignments++;
				findings.push({
					matchedWords: [keyword],
					textSnippet: `Using "${keyword}" — suggests junior level`,
					suggestion: `Replace "${keyword}" with ownership language like Led, Designed, or Built`,
				});
			}
		});
	}

	return {
		occurrenceCount: Math.min(misalignments, 3),
		affectedBulletsCount: misalignments,
		findings: findings.slice(0, 3),
	};
}

/**
 * Analyze career progression visibility
 */
function analyzeCareerProgression(employment) {
	const findings = [];
	let issues = 0;

	// Check if roles show progression
	if (employment.length >= 2) {
		const titles = employment.map((job) => (job.jobTitle || "").toLowerCase());
		const hasVariety = new Set(titles).size > 1;

		if (!hasVariety) {
			issues++;
			findings.push({
				matchedWords: [],
				textSnippet: "Same job title across all roles",
				suggestion: "Highlight increased responsibilities even with same title",
			});
		}

		// Check for date gaps (simplified)
		// This would need more detailed date parsing
	}

	return {
		occurrenceCount: issues,
		affectedBulletsCount: 0,
		findings,
	};
}

/**
 * Analyze skills section
 */
function analyzeSkills(skills, employment) {
	const skillNames = skills.map((s) => s.skill?.toLowerCase() || "");
	const findings = [];
	let relevanceIssues = 0;
	let groupingIssues = 0;

	// Check for irrelevant skills (non-tech in tech resume)
	const nonProfessionalSkills = ["cooking", "photography", "singing", "dancing", "gaming"];
	const irrelevant = skillNames.filter((s) =>
		nonProfessionalSkills.some((np) => s.includes(np))
	);

	if (irrelevant.length > 0) {
		relevanceIssues = irrelevant.length;
	}

	// Check if skills have levels defined
	const skillsWithoutLevels = skills.filter((s) => !s.level || s.level === "");
	if (skillsWithoutLevels.length > skills.length * 0.5 && skills.length > 5) {
		groupingIssues++;
	}

	return {
		relevance: {
			occurrenceCount: relevanceIssues,
			affectedBulletsCount: 0,
			findings: irrelevant.map((s) => ({
				matchedWords: [s],
				textSnippet: s,
				suggestion: "Consider removing non-professional skills",
			})),
		},
		grouping: {
			occurrenceCount: groupingIssues,
			affectedBulletsCount: 0,
			findings: groupingIssues > 0
				? [
						{
							matchedWords: [],
							textSnippet: "Skills listed without proficiency levels",
							suggestion: "Add skill levels or group by category",
						},
				  ]
				: [],
		},
	};
}

/**
 * Find duplicate or very similar bullets
 */
function findDuplicateBullets(bullets) {
	const findings = [];
	const seen = new Map();

	bullets.forEach((bullet) => {
		// Normalize for comparison
		const normalized = bullet.toLowerCase().replace(/\s+/g, " ").trim();
		const key = normalized.substring(0, 50); // First 50 chars as key

		if (seen.has(key)) {
			findings.push({
				matchedWords: [],
				textSnippet: bullet.substring(0, 80),
				suggestion: "This bullet is similar to another. Consider merging or removing.",
			});
		} else {
			seen.set(key, bullet);
		}
	});

	return {
		occurrenceCount: findings.length,
		affectedBulletsCount: findings.length,
		findings: findings.slice(0, 3),
	};
}

/**
 * Analyze tone and professionalism
 */
function analyzeTone(text) {
	const findings = [];
	let issues = 0;

	// Casual language indicators
	const casualPatterns = [
		{ pattern: /\bstuff\b/gi, suggestion: "Replace 'stuff' with specific terms" },
		{ pattern: /\bthings\b/gi, suggestion: "Be specific instead of 'things'" },
		{ pattern: /\bretty much\b/gi, suggestion: "Remove hedging language" },
		{ pattern: /\bkind of\b/gi, suggestion: "Be direct instead of 'kind of'" },
		{ pattern: /\bhelped\s+(a lot|out)\b/gi, suggestion: "Quantify your help" },
	];

	casualPatterns.forEach(({ pattern, suggestion }) => {
		if (pattern.test(text)) {
			issues++;
			findings.push({
				matchedWords: [],
				textSnippet: text.match(pattern)?.[0] || "",
				suggestion,
			});
		}
	});

	return {
		occurrenceCount: issues,
		affectedBulletsCount: issues,
		findings: findings.slice(0, 3),
	};
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

/**
 * Calculate all individual and overall scores
 * @param {Object} analysisResults - Results from runFullAnalysis
 * @returns {Object} Score breakdown
 */
function calculateOverallScores(analysisResults) {
	const { _rawMetrics } = analysisResults;

	// Base score starts at 100, deductions are made for issues
	let overallScore = 100;

	// Grammar score (0-100)
	const grammarIssues = analysisResults.grammar.occurrenceCount;
	const grammarScore = Math.max(0, 100 - grammarIssues * 8);

	// Weak verb score (0-100)
	const weakVerbCount = analysisResults.weakVerbs.occurrenceCount;
	const totalBullets = _rawMetrics.totalBullets || 1;
	const weakVerbRatio = weakVerbCount / totalBullets;
	const weakVerbScore = Math.max(0, Math.round(100 - weakVerbRatio * 100));

	// Impact score (0-100)
	const impactRatio = analysisResults.impactScore.impactRatio || 0;
	const impactScore = Math.round(impactRatio * 100);

	// Section completeness score (0-100)
	const missingSections = analysisResults.sectionCompleteness.occurrenceCount;
	const sectionCompletenessScore = Math.max(0, 100 - missingSections * 25);

	// Calculate overall deductions
	const deductions = {
		grammar: Math.min(10, grammarIssues * 2),
		weakVerbs: Math.min(15, weakVerbCount * 1.5),
		impact: Math.min(15, (1 - impactRatio) * 15),
		metrics: Math.min(10, analysisResults.metricsQuality.occurrenceCount * 2),
		sections: missingSections * 5,
		contact: analysisResults.contactDetails.occurrenceCount * 4,
		readability: Math.min(8, analysisResults.readability.occurrenceCount * 2),
		repetition: Math.min(8, analysisResults.repeatedPhrases.occurrenceCount * 2),
		buzzwords: Math.min(6, analysisResults.buzzwordsAndCliches.occurrenceCount * 1.5),
	};

	const totalDeduction = Object.values(deductions).reduce((a, b) => a + b, 0);
	overallScore = Math.max(0, Math.round(100 - totalDeduction));

	return {
		overall: overallScore,
		grammar: grammarScore,
		weakVerb: weakVerbScore,
		impact: impactScore,
		sectionCompleteness: sectionCompletenessScore,
		_deductions: deductions,
	};
}

// ============================================================================
// SCORE CARD BUILDER
// ============================================================================

/**
 * Build all score cards from analysis results
 * @param {Object} analysisResults - Analysis results
 * @returns {Object} Score cards grouped by category
 */
function buildAllScoreCards(analysisResults) {
	return {
		writingQuality: {
			grammar: buildScoreCard("grammar", analysisResults.grammar),
			sentenceClarity: buildScoreCard("sentenceClarity", analysisResults.sentenceClarity),
			tenseConsistency: buildScoreCard("tenseConsistency", analysisResults.tenseConsistency),
			readability: buildScoreCard("readability", analysisResults.readability),
		},
		bulletQuality: {
			weakVerbs: buildScoreCard("weakVerbs", analysisResults.weakVerbs),
			impactScore: buildScoreCard("impactScore", analysisResults.impactScore),
			conciseness: buildScoreCard("conciseness", analysisResults.conciseness),
			metricsQuality: buildScoreCard("metricsQuality", analysisResults.metricsQuality),
		},
		resumeStructure: {
			sectionCompleteness: buildScoreCard("sectionCompleteness", analysisResults.sectionCompleteness),
			sectionOrdering: buildScoreCard("sectionOrdering", analysisResults.sectionOrdering),
			summaryEffectiveness: buildScoreCard("summaryEffectiveness", analysisResults.summaryEffectiveness),
			contactDetails: buildScoreCard("contactDetails", analysisResults.contactDetails),
			lengthAndDensity: buildScoreCard("lengthAndDensity", analysisResults.lengthAndDensity),
		},
		atsCompatibility: {
			formatting: buildScoreCard("formatting", analysisResults.formatting),
			bulletConsistency: buildScoreCard("bulletConsistency", analysisResults.bulletConsistency),
			atsReadability: buildScoreCard("atsReadability", analysisResults.atsReadability),
		},
		experienceRelevance: {
			roleDepth: buildScoreCard("roleDepth", analysisResults.roleDepth),
			seniorityAlignment: buildScoreCard("seniorityAlignment", analysisResults.seniorityAlignment),
			careerProgression: buildScoreCard("careerProgression", analysisResults.careerProgression),
			skillRelevance: buildScoreCard("skillRelevance", analysisResults.skillRelevance),
			skillGrouping: buildScoreCard("skillGrouping", analysisResults.skillGrouping),
		},
		contentRedundancy: {
			repeatedPhrases: buildScoreCard("repeatedPhrases", analysisResults.repeatedPhrases),
			duplicateBullets: buildScoreCard("duplicateBullets", analysisResults.duplicateBullets),
			repetitionScore: buildScoreCard("repetitionScore", analysisResults.repetitionScore),
			buzzwordsAndCliches: buildScoreCard("buzzwordsAndCliches", analysisResults.buzzwordsAndCliches),
			toneAndProfessionalism: buildScoreCard("toneAndProfessionalism", analysisResults.toneAndProfessionalism),
		},
	};
}

// ============================================================================
// SUMMARY GENERATOR
// ============================================================================

/**
 * Generate summary with verdict, highlights, and improvements
 * @param {Object} scores - Calculated scores
 * @param {Object} analysisResults - Analysis results
 * @returns {Object} Summary object
 */
function generateSummary(scores, analysisResults) {
	const { overall } = scores;

	// Determine verdict
	let verdict;
	if (overall >= 85) {
		verdict = "Excellent";
	} else if (overall >= 70) {
		verdict = "Good";
	} else if (overall >= 55) {
		verdict = "Needs improvement";
	} else {
		verdict = "Significant changes needed";
	}

	// Generate highlights (positive aspects)
	const highlights = [];

	if (scores.sectionCompleteness >= 75) {
		highlights.push("Most essential sections are included");
	}
	if (analysisResults.contactDetails.occurrenceCount === 0) {
		highlights.push("Contact information is complete");
	}
	if (analysisResults.weakVerbs.occurrenceCount < 3) {
		highlights.push("Good use of action verbs");
	}
	if (analysisResults.grammar.occurrenceCount === 0) {
		highlights.push("No grammar issues detected");
	}
	if (analysisResults._rawMetrics.metricsFound > 3) {
		highlights.push("Good use of quantifiable metrics");
	}
	if (analysisResults.formatting.occurrenceCount === 0) {
		highlights.push("ATS-friendly formatting");
	}

	// Default highlight if none
	if (highlights.length === 0) {
		highlights.push("Resume structure is parseable by ATS systems");
	}

	// Generate improvements (areas to fix)
	const improvements = [];

	// Sort issues by severity/impact
	const issueAreas = [
		{ key: "weakVerbs", text: "Replace weak action verbs with stronger alternatives", threshold: 3 },
		{ key: "impactScore", text: "Add measurable results and achievements to bullets", threshold: 3 },
		{ key: "grammar", text: "Fix grammar and spelling issues", threshold: 1 },
		{ key: "metricsQuality", text: "Add quantifiable metrics to show impact", threshold: 4 },
		{ key: "contactDetails", text: "Complete missing contact information", threshold: 1 },
		{ key: "sectionCompleteness", text: "Add missing resume sections", threshold: 1 },
		{ key: "summaryEffectiveness", text: "Strengthen your professional summary", threshold: 1 },
		{ key: "repeatedPhrases", text: "Vary your language to avoid repetition", threshold: 2 },
		{ key: "buzzwordsAndCliches", text: "Replace buzzwords with concrete achievements", threshold: 2 },
		{ key: "conciseness", text: "Shorten verbose bullet points", threshold: 2 },
	];

	issueAreas.forEach(({ key, text, threshold }) => {
		if (analysisResults[key]?.occurrenceCount >= threshold) {
			improvements.push(text);
		}
	});

	// Limit to top 4 improvements
	return {
		verdict,
		highlights: highlights.slice(0, 3),
		improvements: improvements.slice(0, 4),
	};
}

// ============================================================================
// METADATA BUILDER
// ============================================================================

/**
 * Build metadata from parsed data and analysis
 * @param {Object} parsedData - Original parsed data
 * @param {Object} analysisResults - Analysis results
 * @returns {Object} Metadata object
 */
function buildMetadata(parsedData, analysisResults) {
	const { _rawMetrics } = analysisResults;

	// Detect which sections are present
	const sectionsDetected = [];
	if (parsedData.profileSummary?.info) sectionsDetected.push("summary");
	if (parsedData.employment?.length > 0) sectionsDetected.push("employment");
	if (parsedData.education?.length > 0) sectionsDetected.push("education");
	if (parsedData.skills?.length > 0) sectionsDetected.push("skills");
	if (parsedData.certificates?.length > 0) sectionsDetected.push("certifications");
	if (parsedData.courses?.length > 0) sectionsDetected.push("courses");
	if (parsedData.languages?.length > 0) sectionsDetected.push("languages");

	// Determine missing recommended sections
	const missingRecommendedSections = [];
	if (!parsedData.profileSummary?.info) missingRecommendedSections.push("summary");
	const hasLinkedIn = parsedData.websitesAndSocialLinks?.some(
		(l) => l.link?.toLowerCase().includes("linkedin") || l.label?.toLowerCase().includes("linkedin")
	);
	if (!hasLinkedIn) missingRecommendedSections.push("linkedin_url");

	return {
		wordCount: _rawMetrics.totalWords,
		bulletCount: _rawMetrics.totalBullets,
		weakVerbCount: analysisResults.weakVerbs.occurrenceCount,
		grammarErrorCount: analysisResults.grammar.occurrenceCount,
		impactBulletCount: Math.round(_rawMetrics.totalBullets * analysisResults.impactScore.impactRatio),
		metricsFoundCount: analysisResults.metricsQuality.metricsFound || 0,
		sectionCount: sectionsDetected.length,
		sectionsDetected,
		missingRecommendedSections,
		averageBulletLength: _rawMetrics.avgWordsPerBullet,
		parsedAt: new Date().toISOString(),
		analysisVersion: "2.1.0",
	};
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
	generateATSScore,
	runFullAnalysis,
	calculateOverallScores,
	buildAllScoreCards,
	generateSummary,
	buildMetadata,
};
