/**
 * Score Card Generator Templates for ATS Scoring
 * Generates structured score card objects matching the frontend schema
 */

// ============================================================================
// SCORE CARD TEMPLATES - STATIC CONTENT
// ============================================================================

/**
 * Template definitions for all score card types
 * Contains static text content that doesn't change based on analysis
 */
const SCORE_CARD_TEMPLATES = {
	// -------------------------------------------------------------------------
	// WRITING QUALITY
	// -------------------------------------------------------------------------
	grammar: {
		id: "sc_grammar",
		type: "grammar",
		trackingKey: "ats_grammar",
		title: "Grammar & spelling issues",
		subtitle: "Fix grammatical errors to improve clarity and professionalism",
		section: "employment",
		description:
			"Your resume contains grammar and spelling mistakes that reduce professionalism and clarity.",
		whyItMatters: {
			title: "Why is grammar important?",
			points: [
				{
					heading: "Professional image",
					text: "Grammar errors make resumes look careless.",
				},
				{
					heading: "Recruiter trust",
					text: "Hiring managers associate grammar with attention to detail.",
				},
				{
					heading: "ATS parsing",
					text: "Grammar mistakes can confuse ATS keyword extraction.",
				},
			],
		},
		recommendedApproach:
			"Review each bullet for spelling and tense errors. Use past tense consistently for previous roles.",
		examples: [
			{
				title: "Grammar correction",
				before: "• Has deliver multiple modules to production",
				after: "• Delivered multiple modules to production",
			},
		],
		userIntentHint:
			"Quick fix — grammar corrections instantly improve credibility.",
		interactionHint: "Click highlighted text to correct grammar.",
	},

	sentenceClarity: {
		id: "sc_sentence_clarity",
		type: "sentence_clarity",
		trackingKey: "ats_sentence_clarity",
		title: "Unclear or complex sentences",
		subtitle: "Make sentences easier to understand",
		section: "employment",
		description:
			"Some sentences are overly complex, making it harder to quickly understand your contributions.",
		whyItMatters: {
			title: "Why does clarity matter?",
			points: [
				{
					heading: "Faster scanning",
					text: "Clear sentences help recruiters grasp impact quickly.",
				},
				{
					heading: "Better ATS parsing",
					text: "Simple sentences are parsed more accurately.",
				},
			],
		},
		recommendedApproach:
			"Simplify sentence structure and avoid unnecessary filler phrases.",
		examples: [
			{
				title: "Sentence simplification",
				before:
					"• Utilized cutting-edge technologies in order to facilitate scalable backend systems",
				after: "• Built scalable backend systems using modern technologies",
			},
		],
		userIntentHint: "Simplifying sentences improves readability instantly.",
		interactionHint: "Click sentences to view simplified versions.",
	},

	tenseConsistency: {
		id: "sc_tense_consistency",
		type: "tense_consistency",
		trackingKey: "ats_tense_consistency",
		title: "Inconsistent verb tense",
		subtitle: "Maintain consistent tense across roles",
		section: "employment",
		description: "Your resume mixes past and present tense inconsistently.",
		whyItMatters: {
			title: "Why tense consistency matters",
			points: [
				{ heading: "Flow", text: "Consistent tense improves reading flow." },
				{
					heading: "Professional polish",
					text: "Consistency signals attention to detail.",
				},
			],
		},
		recommendedApproach:
			"Use past tense for completed roles and present tense only for current roles.",
		examples: [
			{
				title: "Verb tense alignment",
				before: "• Develop REST APIs and handled deployments",
				after: "• Developed REST APIs and handled deployments",
			},
		],
		userIntentHint: "Easy fix — align verb tense for polish.",
		interactionHint: "Click highlighted verbs to fix tense.",
	},

	readability: {
		id: "sc_readability",
		type: "readability",
		trackingKey: "ats_readability",
		title: "Low readability",
		subtitle: "Improve sentence flow and simplicity",
		section: "employment",
		description:
			"Some resume sections are difficult to read due to long or complex sentences.",
		whyItMatters: {
			title: "Why readability matters",
			points: [
				{
					heading: "Recruiter experience",
					text: "Readable resumes are easier to skim.",
				},
				{
					heading: "ATS success",
					text: "Simple language improves keyword recognition.",
				},
			],
		},
		recommendedApproach:
			"Shorten long sentences and remove unnecessary phrases.",
		examples: [
			{
				title: "Improving readability",
				before:
					"• Responsible for end to end development, testing, deployment, monitoring, debugging and maintenance",
				after:
					"• Developed and maintained applications across the full lifecycle",
			},
		],
		userIntentHint: "Readable resumes perform better with ATS and humans.",
		interactionHint: "Click long sentences to simplify.",
	},

	// -------------------------------------------------------------------------
	// BULLET QUALITY
	// -------------------------------------------------------------------------
	weakVerbs: {
		id: "sc_weak_verbs",
		type: "weak_verb",
		trackingKey: "ats_weak_verbs",
		title: "Weak action verbs used",
		subtitle: "Replace vague verbs with strong, outcome-driven language",
		section: "employment",
		description:
			"Your resume uses weak or generic action verbs that fail to communicate your contributions effectively.",
		whyItMatters: {
			title: "Why are weak action verbs a problem?",
			points: [
				{
					heading: "Low impact",
					text: "Weak verbs like 'worked' or 'handled' do not show ownership.",
				},
				{
					heading: "Poor differentiation",
					text: "Strong verbs help your resume stand out competitively.",
				},
				{
					heading: "ATS & recruiter scanning",
					text: "Strong verbs signal seniority and capability.",
				},
				{
					heading: "Missed opportunity",
					text: "Every bullet is valuable space for showcasing accomplishments.",
				},
			],
		},
		recommendedApproach:
			"Start each bullet with a strong action verb followed by outcome and measurable result.",
		examples: [
			{
				title: "Frontend development",
				before: "• Worked on frontend features for admin dashboard",
				after:
					"• Built and optimized frontend features for an admin dashboard used by 5,000+ users",
			},
			{
				title: "Backend responsibility",
				before: "• Responsible for backend API integrations",
				after:
					"• Developed and integrated REST APIs supporting 2M+ monthly requests",
			},
		],
		userIntentHint:
			"Quick fix — replacing weak verbs is one of the fastest ways to improve your ATS score.",
		interactionHint: "Click on highlighted verbs to see suggestions.",
	},

	impactScore: {
		id: "sc_impact",
		type: "impact",
		trackingKey: "ats_impact",
		title: "Low-impact bullet points",
		subtitle: "Show achievements instead of responsibilities",
		section: "employment",
		description:
			"Many bullets describe duties rather than outcomes or achievements.",
		whyItMatters: {
			title: "Why impact matters",
			points: [
				{
					heading: "Hiring decisions",
					text: "Recruiters hire based on results, not tasks.",
				},
				{
					heading: "Seniority signal",
					text: "Impactful bullets signal ownership.",
				},
			],
		},
		recommendedApproach: "Rewrite bullets to show measurable outcomes.",
		examples: [
			{
				title: "Adding impact",
				before: "• Responsible for developing APIs",
				after: "• Developed APIs that reduced response time by 35%",
			},
		],
		userIntentHint:
			"High priority — improving impact boosts score significantly.",
		interactionHint: "Click bullets to add achievements.",
	},

	conciseness: {
		id: "sc_conciseness",
		type: "conciseness",
		trackingKey: "ats_conciseness",
		title: "Bullets are too long or verbose",
		subtitle: "Make bullet points concise",
		section: "employment",
		description:
			"Some bullet points are too long or include unnecessary filler.",
		whyItMatters: {
			title: "Why conciseness matters",
			points: [
				{
					heading: "Skimmability",
					text: "Concise bullets are easier to scan.",
				},
			],
		},
		recommendedApproach:
			"Remove filler words and keep bullets under two lines.",
		examples: [
			{
				title: "Reducing verbosity",
				before:
					"• Worked extensively on various different frontend features across multiple dashboards",
				after: "• Built frontend features across multiple dashboards",
			},
		],
		userIntentHint: "Quick win — concise bullets improve clarity.",
		interactionHint: "Click bullets to shorten.",
	},

	metricsQuality: {
		id: "sc_metrics",
		type: "metrics",
		trackingKey: "ats_metrics",
		title: "Missing measurable results",
		subtitle: "Add numbers to prove impact",
		section: "employment",
		description:
			"Several bullets lack measurable results such as percentages or scale.",
		whyItMatters: {
			title: "Why metrics matter",
			points: [
				{ heading: "Credibility", text: "Numbers validate your claims." },
				{
					heading: "Differentiation",
					text: "Metrics separate strong candidates from average ones.",
				},
			],
		},
		recommendedApproach:
			"Add numbers like % improvements, scale, or usage metrics.",
		examples: [
			{
				title: "Adding metrics",
				before: "• Improved application performance",
				after:
					"• Improved application performance, reducing load time by 40%",
			},
		],
		userIntentHint: "Adding metrics significantly improves ATS performance.",
		interactionHint: "Click bullets to add numbers.",
	},

	// -------------------------------------------------------------------------
	// RESUME STRUCTURE
	// -------------------------------------------------------------------------
	sectionCompleteness: {
		id: "sc_section_completeness",
		type: "section_completeness",
		trackingKey: "ats_section_completeness",
		title: "Missing or incomplete sections",
		subtitle: "Ensure all essential resume sections are present",
		section: "overall",
		description:
			"Some essential resume sections are missing or lack sufficient detail.",
		whyItMatters: {
			title: "Why section completeness matters",
			points: [
				{
					heading: "ATS expectations",
					text: "ATS systems expect standard sections.",
				},
				{
					heading: "Recruiter clarity",
					text: "Missing sections reduce context.",
				},
			],
		},
		recommendedApproach:
			"Ensure sections like Summary, Skills, and Education are present.",
		examples: [
			{
				title: "Adding missing summary",
				before: "Resume starts directly with Experience section",
				after:
					"Added Professional Summary highlighting skills and experience",
			},
		],
		userIntentHint: "Completing sections strengthens resume structure.",
		interactionHint: "Add missing sections from the editor.",
	},

	sectionOrdering: {
		id: "sc_section_ordering",
		type: "section_ordering",
		trackingKey: "ats_section_ordering",
		title: "Suboptimal section order",
		subtitle: "Reorder sections to highlight strengths",
		section: "overall",
		description: "Section order is not optimized for your experience level.",
		whyItMatters: {
			title: "Why section order matters",
			points: [
				{
					heading: "First impression",
					text: "Top sections receive the most attention.",
				},
			],
		},
		recommendedApproach:
			"Place Experience and Skills above Education for mid/senior roles.",
		examples: [
			{
				title: "Reordering sections",
				before: "Education listed before Experience",
				after: "Experience placed above Education",
			},
		],
		userIntentHint: "Simple reorder improves resume flow.",
		interactionHint: "Drag sections to reorder.",
	},

	summaryEffectiveness: {
		id: "sc_summary",
		type: "summary_effectiveness",
		trackingKey: "ats_summary",
		title: "Weak professional summary",
		subtitle: "Clarify your value proposition",
		section: "summary",
		description: "The summary is too generic and lacks clear positioning.",
		whyItMatters: {
			title: "Why the summary matters",
			points: [
				{
					heading: "Hook",
					text: "The summary sets the tone for the resume.",
				},
			],
		},
		recommendedApproach:
			"Clearly state role, years of experience, and key achievements.",
		examples: [
			{
				title: "Improving summary",
				before: "Software developer with experience in many technologies",
				after:
					"Full Stack Developer with 4+ years of experience building scalable web apps",
			},
		],
		userIntentHint: "Improving summary increases recruiter engagement.",
		interactionHint: "Edit summary to clarify value.",
	},

	contactDetails: {
		id: "sc_contact_details",
		type: "contact_details",
		trackingKey: "ats_contact_details",
		title: "Missing or incomplete contact details",
		subtitle: "Ensure recruiters can reach you easily",
		section: "header",
		description: "Some essential contact details are missing or unprofessional.",
		whyItMatters: {
			title: "Why contact details matter",
			points: [
				{
					heading: "Reachability",
					text: "Recruiters cannot contact you otherwise.",
				},
			],
		},
		recommendedApproach:
			"Add a professional email, phone number, and LinkedIn URL.",
		examples: [
			{
				title: "Completing contact info",
				before: "Only phone number listed",
				after: "Email, phone number, and LinkedIn added",
			},
		],
		userIntentHint: "Critical fix — recruiters must be able to contact you.",
		interactionHint: "Update contact details in header.",
	},

	lengthAndDensity: {
		id: "sc_length_density",
		type: "length_density",
		trackingKey: "ats_length_density",
		title: "Resume length or density issues",
		subtitle: "Optimize resume length",
		section: "overall",
		description: "Resume length is not ideal for your experience level.",
		whyItMatters: {
			title: "Why length matters",
			points: [
				{
					heading: "Attention span",
					text: "Overlong resumes reduce engagement.",
				},
			],
		},
		recommendedApproach: "Limit resume to 1–2 pages based on experience.",
		examples: [
			{
				title: "Reducing resume length",
				before: "3-page resume with repetitive bullets",
				after: "Condensed to 2 pages with focused achievements",
			},
		],
		userIntentHint: "Optimizing length improves readability.",
		interactionHint: "Trim or expand sections as needed.",
	},

	// -------------------------------------------------------------------------
	// ATS COMPATIBILITY
	// -------------------------------------------------------------------------
	formatting: {
		id: "sc_formatting",
		type: "formatting",
		trackingKey: "ats_formatting",
		title: "ATS-unfriendly formatting",
		subtitle: "Avoid layouts that ATS cannot parse",
		section: "overall",
		description:
			"The resume uses formatting elements that ATS systems may not parse correctly.",
		whyItMatters: {
			title: "Why ATS formatting matters",
			points: [
				{
					heading: "Parsing accuracy",
					text: "Complex layouts confuse ATS systems.",
				},
			],
		},
		recommendedApproach: "Use a single-column layout with standard headings.",
		examples: [
			{
				title: "Fixing ATS formatting",
				before: "Two-column layout with icons",
				after: "Single-column ATS-friendly layout",
			},
		],
		userIntentHint: "Fix formatting to improve ATS parsing.",
		interactionHint: "Switch to ATS-safe template.",
	},

	bulletConsistency: {
		id: "sc_bullet_consistency",
		type: "bullet_consistency",
		trackingKey: "ats_bullet_consistency",
		title: "Inconsistent bullet formatting",
		subtitle: "Keep bullets consistent",
		section: "employment",
		description: "Bullet styles vary across sections.",
		whyItMatters: {
			title: "Why bullet consistency matters",
			points: [
				{
					heading: "Visual clarity",
					text: "Consistency improves readability.",
				},
			],
		},
		recommendedApproach: "Use the same bullet symbol throughout.",
		examples: [
			{
				title: "Standardizing bullets",
				before: "Mixed dashes and dots",
				after: "Uniform dot bullets",
			},
		],
		userIntentHint: "Easy fix — unify bullet formatting.",
		interactionHint: "Normalize bullet styles.",
	},

	atsReadability: {
		id: "sc_ats_readability",
		type: "ats_readability",
		trackingKey: "ats_ats_readability",
		title: "Low ATS readability",
		subtitle: "Improve ATS text extraction",
		section: "overall",
		description: "Some text may not be easily readable by ATS systems.",
		whyItMatters: {
			title: "Why ATS readability matters",
			points: [
				{
					heading: "Keyword matching",
					text: "Unreadable text reduces keyword detection.",
				},
			],
		},
		recommendedApproach: "Use standard fonts and selectable text.",
		examples: [
			{
				title: "Improving ATS readability",
				before: "Text embedded inside images",
				after: "Plain selectable text",
			},
		],
		userIntentHint: "Improving ATS readability increases shortlist chances.",
		interactionHint: "Switch to ATS-optimized layout.",
	},

	// -------------------------------------------------------------------------
	// EXPERIENCE RELEVANCE
	// -------------------------------------------------------------------------
	roleDepth: {
		id: "sc_role_depth",
		type: "role_depth",
		trackingKey: "ats_role_depth",
		title: "Shallow role descriptions",
		subtitle: "Provide more depth in your experience",
		section: "employment",
		description:
			"Some roles lack sufficient detail about responsibilities and impact.",
		whyItMatters: {
			title: "Why role depth matters",
			points: [
				{
					heading: "Experience clarity",
					text: "Depth helps recruiters assess fit.",
				},
			],
		},
		recommendedApproach: "Expand bullets to show scope and responsibilities.",
		examples: [
			{
				title: "Adding role depth",
				before: "• Developed web applications",
				after:
					"• Developed and deployed 5+ web applications serving 10,000+ daily users",
			},
		],
		userIntentHint: "Adding depth improves role evaluation.",
		interactionHint: "Expand role descriptions.",
	},

	seniorityAlignment: {
		id: "sc_seniority_alignment",
		type: "seniority_alignment",
		trackingKey: "ats_seniority",
		title: "Seniority mismatch",
		subtitle: "Align resume with your experience level",
		section: "employment",
		description:
			"Your resume content does not fully reflect your experience level.",
		whyItMatters: {
			title: "Why seniority alignment matters",
			points: [{ heading: "Role fit", text: "Mismatch can hurt shortlisting." }],
		},
		recommendedApproach: "Adjust language and scope to match seniority.",
		examples: [
			{
				title: "Mid-level framing",
				before: "• Assisted in development of REST APIs",
				after:
					"• Led development and optimization of REST APIs handling 5M+ requests monthly",
			},
		],
		userIntentHint: "Aligning seniority improves role matching.",
		interactionHint: "Update bullets to reflect experience.",
	},

	careerProgression: {
		id: "sc_career_progression",
		type: "career_progression",
		trackingKey: "ats_progression",
		title: "Unclear career progression",
		subtitle: "Show growth over time",
		section: "employment",
		description: "Your resume does not clearly show progression or growth.",
		whyItMatters: {
			title: "Why progression matters",
			points: [
				{
					heading: "Growth signal",
					text: "Progression indicates learning and promotion.",
				},
			],
		},
		recommendedApproach: "Highlight increased responsibilities over time.",
		examples: [
			{
				title: "Showing progression",
				before: "Junior Developer → Senior Developer (no impact change shown)",
				after:
					"Progressed from Junior to Senior Developer — expanded team leadership scope",
			},
		],
		userIntentHint: "Showing growth strengthens seniority perception.",
		interactionHint: "Emphasize progression.",
	},

	skillRelevance: {
		id: "sc_skill_relevance",
		type: "skill_relevance",
		trackingKey: "ats_skill_relevance",
		title: "Skills not relevant to role",
		subtitle: "Focus on role-relevant skills",
		section: "skills",
		description: "Some listed skills are not relevant to your target roles.",
		whyItMatters: {
			title: "Why skill relevance matters",
			points: [
				{
					heading: "ATS matching",
					text: "Relevant skills improve keyword matching.",
				},
			],
		},
		recommendedApproach:
			"Remove unrelated skills and focus on core competencies.",
		examples: [
			{
				title: "Focusing skills",
				before: "Skills: Python, Java, Photography, French, Cooking",
				after: "Skills: Python, Java, React, Node.js, AWS, PostgreSQL",
			},
		],
		userIntentHint: "Removing irrelevant skills improves ATS fit.",
		interactionHint: "Edit skills list.",
	},

	skillGrouping: {
		id: "sc_skill_grouping",
		type: "skill_grouping",
		trackingKey: "ats_skill_grouping",
		title: "Poor skill organization",
		subtitle: "Group skills into clear categories",
		section: "skills",
		description: "Skills are not grouped logically, reducing clarity.",
		whyItMatters: {
			title: "Why skill grouping matters",
			points: [
				{ heading: "Clarity", text: "Grouped skills are easier to scan." },
			],
		},
		recommendedApproach:
			"Group skills by domain such as Frontend, Backend, Tools.",
		examples: [
			{
				title: "Organizing skills",
				before: "Skills: React, Python, Node.js, JavaScript, Django, AWS",
				after:
					"Frontend: React, JavaScript | Backend: Python, Node.js, Django | Cloud: AWS",
			},
		],
		userIntentHint: "Quick fix — grouping skills improves clarity.",
		interactionHint: "Organize skills into categories.",
	},

	// -------------------------------------------------------------------------
	// CONTENT REDUNDANCY
	// -------------------------------------------------------------------------
	repeatedPhrases: {
		id: "sc_repeated_phrases",
		type: "repetition",
		trackingKey: "ats_repetition",
		title: "Repeated phrases detected",
		subtitle: "Avoid repeating the same language",
		section: "employment",
		description: "Some phrases are repeated across multiple bullets.",
		whyItMatters: {
			title: "Why repetition matters",
			points: [
				{
					heading: "Perceived depth",
					text: "Repetition makes experience look shallow.",
				},
			],
		},
		recommendedApproach: "Vary language and focus on unique contributions.",
		examples: [
			{
				title: "Varying language",
				before:
					"• Developed features | • Developed APIs | • Developed dashboards",
				after:
					"• Architected features | • Built scalable APIs | • Designed analytics dashboards",
			},
		],
		userIntentHint: "Reducing repetition improves perceived experience.",
		interactionHint: "Rewrite repeated bullets.",
	},

	duplicateBullets: {
		id: "sc_duplicate_bullets",
		type: "duplicate_bullets",
		trackingKey: "ats_duplicate_bullets",
		title: "Duplicate bullet points",
		subtitle: "Remove redundant bullets",
		section: "employment",
		description: "Some bullet points convey nearly identical information.",
		whyItMatters: {
			title: "Why duplicates hurt",
			points: [
				{
					heading: "Wasted space",
					text: "Duplicate bullets waste valuable resume space.",
				},
			],
		},
		recommendedApproach: "Merge or remove redundant bullets.",
		examples: [
			{
				title: "Removing duplicates",
				before: "• Fixed critical bugs | • Resolved bugs in production",
				after:
					"• Fixed 15+ critical bugs in production systems, improving uptime by 2%",
			},
		],
		userIntentHint: "Removing duplicates strengthens resume focus.",
		interactionHint: "Delete or merge bullets.",
	},

	repetitionScore: {
		id: "sc_repetition_score",
		type: "repetition_score",
		trackingKey: "ats_repetition_score",
		title: "Overall content repetition",
		subtitle: "Reduce repetitive language",
		section: "overall",
		description: "Overall content repetition reduces resume effectiveness.",
		whyItMatters: {
			title: "Why repetition score matters",
			points: [
				{ heading: "Perception", text: "Unique content signals depth." },
			],
		},
		recommendedApproach: "Ensure each bullet adds new information.",
		examples: [
			{
				title: "Diversifying content",
				before: "Multiple bullets starting with 'Responsible for'",
				after: "Use varied structures: Built, Designed, Led, Optimized, etc.",
			},
		],
		userIntentHint: "Reducing repetition improves clarity.",
		interactionHint: "Review repeated content.",
	},

	buzzwordsAndCliches: {
		id: "sc_buzzwords",
		type: "buzzwords",
		trackingKey: "ats_buzzwords",
		title: "Buzzwords & clichés detected",
		subtitle: "Replace vague buzzwords with evidence",
		section: "employment",
		description:
			"Your resume uses overused buzzwords that add little value.",
		whyItMatters: {
			title: "Why buzzwords hurt resumes",
			points: [
				{ heading: "Lack of evidence", text: "Buzzwords lack proof." },
				{
					heading: "Recruiter fatigue",
					text: "Overused terms are ignored.",
				},
			],
		},
		recommendedApproach: "Replace buzzwords with concrete achievements.",
		examples: [
			{
				title: "Replacing buzzwords",
				before: "• Team player who is passionate about innovation",
				after:
					"• Collaborated with 5-person team to ship 3 features quarterly, driving 25% user growth",
			},
		],
		userIntentHint: "Replacing buzzwords improves credibility.",
		interactionHint: "Click buzzwords to rewrite.",
	},

	toneAndProfessionalism: {
		id: "sc_tone",
		type: "tone",
		trackingKey: "ats_tone",
		title: "Inconsistent tone or professionalism",
		subtitle: "Maintain a professional and confident tone",
		section: "overall",
		description: "Some language appears too casual or inconsistent.",
		whyItMatters: {
			title: "Why tone matters",
			points: [
				{ heading: "Professional image", text: "Tone affects perception." },
			],
		},
		recommendedApproach: "Use confident, professional language.",
		examples: [
			{
				title: "Professional tone",
				before: "• Helped fix some issues in the app",
				after:
					"• Resolved critical issues, improving user satisfaction by 15%",
			},
		],
		userIntentHint: "Professional tone improves credibility.",
		interactionHint: "Review tone and rewrite casual phrasing.",
	},
};

// ============================================================================
// SEVERITY & PRIORITY MAPPING
// ============================================================================

/**
 * Calculate severity based on issue count and score impact
 * @param {number} issueCount - Number of issues found
 * @param {number} scoreImpact - Score impact (negative number)
 * @returns {string} Severity level: "low" | "medium" | "high"
 */
function calculateSeverity(issueCount, scoreImpact) {
	const impactAbs = Math.abs(scoreImpact);

	if (impactAbs >= 12 || issueCount >= 5) return "high";
	if (impactAbs >= 6 || issueCount >= 3) return "medium";
	return "low";
}

/**
 * Calculate priority based on score impact and effort
 * @param {number} scoreImpact - Score impact
 * @param {string} effortLevel - Effort level
 * @returns {number} Priority (1-10, lower is higher priority)
 */
function calculatePriority(scoreImpact, effortLevel) {
	const impactAbs = Math.abs(scoreImpact);
	const effortMultiplier =
		effortLevel === "low" ? 0.8 : effortLevel === "medium" ? 1 : 1.3;

	// Higher impact + lower effort = lower priority number (higher priority)
	const score = (20 - impactAbs) * effortMultiplier;
	return Math.max(1, Math.min(10, Math.round(score / 2)));
}

/**
 * Calculate score impact based on issue severity and count
 * @param {string} type - Type of issue
 * @param {number} count - Number of occurrences
 * @returns {number} Negative score impact
 */
function calculateScoreImpact(type, count) {
	const baseImpacts = {
		grammar: -2,
		sentence_clarity: -2,
		tense_consistency: -1.5,
		readability: -2,
		weak_verb: -2,
		impact: -3,
		conciseness: -1.5,
		metrics: -2.5,
		section_completeness: -4,
		section_ordering: -1,
		summary_effectiveness: -3,
		contact_details: -5,
		length_density: -1,
		formatting: -2,
		bullet_consistency: -1,
		ats_readability: -2,
		role_depth: -2,
		seniority_alignment: -2,
		career_progression: -1.5,
		skill_relevance: -2,
		skill_grouping: -1,
		repetition: -2,
		duplicate_bullets: -2.5,
		repetition_score: -1.5,
		buzzwords: -1.5,
		tone: -1,
	};

	const base = baseImpacts[type] || -2;
	return Math.round(base * Math.min(count, 5));
}

/**
 * Calculate estimated score gain if issues are fixed
 * @param {number} scoreImpact - Current negative impact
 * @returns {number} Estimated positive gain
 */
function calculateEstimatedGain(scoreImpact) {
	// Typically can recover 70-80% of lost score
	return Math.abs(Math.round(scoreImpact * 0.75));
}

/**
 * Determine effort level based on issue type
 * @param {string} type - Issue type
 * @param {number} count - Number of issues
 * @returns {string} Effort level: "low" | "medium" | "high"
 */
function getEffortLevel(type, count) {
	const lowEffort = [
		"grammar",
		"tense_consistency",
		"weak_verb",
		"bullet_consistency",
		"contact_details",
		"skill_grouping",
	];
	const highEffort = [
		"impact",
		"section_completeness",
		"role_depth",
		"career_progression",
	];

	if (lowEffort.includes(type)) return "low";
	if (highEffort.includes(type)) return "high";
	if (count > 4) return "medium";
	return "medium";
}

// ============================================================================
// SCORE CARD BUILDER
// ============================================================================

/**
 * Build a complete score card from template and analysis data
 * @param {string} templateKey - Key of the template to use
 * @param {Object} analysisData - Analysis results
 * @returns {Object} Complete score card
 */
function buildScoreCard(templateKey, analysisData) {
	const template = SCORE_CARD_TEMPLATES[templateKey];
	if (!template) {
		console.warn(`Template not found: ${templateKey}`);
		return null;
	}

	const {
		occurrenceCount = 0,
		affectedBulletsCount = 0,
		findings = [],
	} = analysisData;

	const type = template.type;
	const scoreImpact = calculateScoreImpact(type, occurrenceCount);
	const effortLevel = getEffortLevel(type, occurrenceCount);
	const severity = calculateSeverity(occurrenceCount, scoreImpact);
	const priority = calculatePriority(scoreImpact, effortLevel);
	const estimatedScoreGain = calculateEstimatedGain(scoreImpact);

	return {
		...template,
		severity,
		priority,
		scoreImpact,
		estimatedScoreGain,
		effortLevel,
		occurrenceCount,
		affectedBulletsCount,
		findings: findings.slice(0, 5), // Limit findings to 5
	};
}

module.exports = {
	SCORE_CARD_TEMPLATES,
	buildScoreCard,
	calculateSeverity,
	calculatePriority,
	calculateScoreImpact,
	calculateEstimatedGain,
	getEffortLevel,
};
