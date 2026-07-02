/**
 * Test script for ATS Scoring Engine
 * Run with: node src/services/ats/test.js
 */

const { generateATSScore } = require("./scoringEngine");

// Sample parsed resume data (matching parseResumeExample.json structure)
const sampleParsedResume = {
	skills: [
		{ level: "Expert", skill: "Javascript", position: 0 },
		{ level: "Advanced", skill: "Typescript", position: 1 },
		{ level: "Advanced", skill: "Python", position: 2 },
		{ level: "Intermediate", skill: "C++", position: 3 },
		{ level: "Expert", skill: "React.js", position: 4 },
		{ level: "Advanced", skill: "Next.js", position: 5 },
		{ level: "Expert", skill: "Redux", position: 6 },
		{ level: "", skill: "Antdesign", position: 7 },
		{ level: "", skill: "Mui", position: 8 },
		{ level: "", skill: "Html5", position: 9 },
		{ level: "", skill: "Css3", position: 10 },
		{ level: "", skill: "Axios", position: 11 },
		{ level: "Expert", skill: "Node.js", position: 12 },
		{ level: "Expert", skill: "Express.js", position: 13 },
		{ level: "Advanced", skill: "Nest.js", position: 14 },
		{ level: "", skill: "Rest API", position: 15 },
		{ level: "", skill: "Redis", position: 16 },
		{ level: "", skill: "Kafka", position: 17 },
		{ level: "", skill: "Microservices", position: 18 },
		{ level: "Expert", skill: "SQL", position: 19 },
		{ level: "", skill: "Postgres", position: 20 },
		{ level: "Expert", skill: "Mongo", position: 21 },
		{ level: "Expert", skill: "Git", position: 22 },
		{ level: "Intermediate", skill: "Docker", position: 23 },
		{ level: "Intermediate", skill: "Digital Ocean", position: 24 },
		{ level: "Intermediate", skill: "Aws", position: 25 },
	],
	courses: [
		{
			course: "Full Stack Developer Bootcamp",
			endDate: "2020-12-01",
			position: 0,
			isPresent: false,
			startDate: "2020-06-01",
			description: "",
			institution: "Edyoda",
		},
	],
	education: [
		{
			city: "",
			degree: "Bachelor of Science in Information Technology",
			school: "Gr. Patil Mumbai University",
			endDate: "",
			location: "",
			position: 0,
			isPresent: false,
			startDate: "",
			description: "Overall CG PI:",
			isDistancedLearning: false,
		},
	],
	languages: [],
	employment: [
		{
			endDate: "",
			employer: "HDFC ERGO",
			isRemote: false,
			jobTitle: "SOFTWARE ENGINEER",
			location: "MUMBAI",
			position: 0,
			isPresent: true,
			startDate: "2022-07-01",
			description: `• PROJECT: GENERATIVE AI BOTS
• Developed 3 distinct bots: HR Policy Bot, Product Catalogue Bot, and Competitor Analysis Bot.
• Implemented LLM models: Gemini-1.5-Flash-001 and Text-Bison-32k. Conducted data ingestion (PDFs/Docs) into Google BigQuery to train the AI models.
• Prompt engineered and created the following APIs in the backend.
• Bot Response API for conversational output.
• Suggested Questions API for dynamic follow-up queries.
• Feedback API for continuous learning and model improvement.
• PROJECT: PEHCHAAN
• Pehchaan is a KYC verification system, that caters to a customer base exceeding 10 million.
• Added features like OCR for document data scanning, a human verification dashboard for verification of manual entries, and API integration for partner companies like TVS, and Maruti.
• Utilized Signzy APIs to improve verification processes and retrieved data from the CKYC repository
• Customers with data in the CKYC repository were verified instantly, while those submitting manual entries experienced a turnaround time (TAT) of 12 hours for approval or rejection.
• Our timely project delivery, in line with the IRDAI's KYC guidelines for insurance from January 1, 2023, prevented disruptions to the company's daily sales operations.
• Technologies: MERN stack (MongoDB, Express.js, React.js, Node.js).
• PROJECT: CHASE
• Chase is an in-house application created for managing and investigating fraud claim cases.
• Developed two separate applications: one for internal investigators across various hierarchies and another for vendors to gather and input data from incident sites.
• Engineered logic to facilitate the seamless progression of claim cases through different investigative stages.
• Achieved a 30% reduction in costs and enhanced investigation accuracy by 55%.
• Technologies: PERN stack (PostgreSQL, Express.js, React.js, Node.js).`,
		},
		{
			endDate: "2022-06-01",
			employer: "PROSOFOS",
			isRemote: true,
			jobTitle: "WEB DEVELOPER",
			location: "REMOTE",
			position: 1,
			isPresent: false,
			startDate: "2022-02-01",
			description: `• Led frontend development using React.js and Redux for various projects, Spearheaded the design and implementation of interactive and user-friendly interfaces, resulting in a 30% increase in user engagement.
• Optimized code for scalability and maintainability by Refactoring existing codebase to enhance readability and efficiency, minimized overall bundle size, and eased future updates.`,
		},
		{
			endDate: "2022-02-01",
			employer: "LIRCTEK",
			isRemote: false,
			jobTitle: "WEB DEVELOPER",
			location: "BANGALORE",
			position: 2,
			isPresent: false,
			startDate: "2021-05-01",
			description: `• PROJECT: E-TRUCKINGSOFT
• E-TruckingSoft is a platform that helps truck owners manage and optimize the utilization of their fleet.
• Improved project performance by 80%, and reduced re-rendering issues using React Profiler, Memo, and batch updates.
• Implemented complex logic and features, including interactive forms, maps, tables, and dynamic graphs on the frontend for enhanced data visualization.
• Technologies: React.js, TypeScript, Node.js, Express.js, MySQL, Ant Design, Azure.`,
		},
		{
			endDate: "2021-05-01",
			employer: "FREELANCE",
			isRemote: false,
			jobTitle: "Freelance Developer",
			location: "",
			position: 3,
			isPresent: false,
			startDate: "2020-10-01",
			description: `• Developed a full-stack e-commerce platform from the ground up, including both the admin dashboard and the customer-facing website, and deployed it on AWS (EC2, S3).
• Successfully delivered portfolio and business websites for clients on Upwork, increasing their sales and customer engagement.
• Technologies: MERN stack (MongoDB, Express.js, React.js, Node.js).`,
		},
	],
	certificates: [],
	profileSummary: {
		info: "Full Stack Developer with over 4 years of experience specializing in React, Next.js, Node.js, MongoDB, SQL, and AWS. Proven leadership in managing a team of 8 software developers. Experienced in delivering high-impact projects, driving innovation, and optimizing performance across three major projects.",
	},
	personalDetails: {
		city: "Mumbai",
		email: "Laique.off@gmail.com",
		phone: "+91 9833285729",
		Address: "Mumbai, India",
		country: "India",
		jobTitle: "Full Stack Developer",
		lastName: "MIRZA",
		firstName: "LAIQUE",
		postalCode: "",
		dateOfBirth: "",
		nationality: "",
		placeOfBirth: "",
	},
	websitesAndSocialLinks: [
		{
			link: "linkedin.com/in/laique",
			label: "Linkedin",
			position: 0,
		},
		{
			link: "Laique.site",
			label: "Laique.site",
			position: 1,
		},
	],
};

// Run the test
console.log("=" .repeat(60));
console.log("ATS SCORING ENGINE TEST");
console.log("=" .repeat(60));

try {
	const result = generateATSScore(
		sampleParsedResume,
		"user_123",
		"mid",
		{ resumeSource: "upload", pdfUrl: "https://example.com/resume.pdf" }
	);

	console.log("\n📊 OVERALL RESULTS:");
	console.log("-".repeat(40));
	console.log(`ATS Result ID: ${result.atsResultId}`);
	console.log(`Overall Score: ${result.overallScore}/100`);
	console.log(`Verdict: ${result.summary.verdict}`);

	console.log("\n📈 SCORE BREAKDOWN:");
	console.log("-".repeat(40));
	console.log(`Grammar Score: ${result.scoreBreakdown.grammarScore}`);
	console.log(`Weak Verb Score: ${result.scoreBreakdown.weakVerbScore}`);
	console.log(`Impact Score: ${result.scoreBreakdown.impactScore}`);
	console.log(`Section Completeness: ${result.scoreBreakdown.sectionCompletenessScore}`);

	console.log("\n✅ HIGHLIGHTS:");
	result.summary.highlights.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));

	console.log("\n⚠️  IMPROVEMENTS:");
	result.summary.improvements.forEach((imp, i) => console.log(`  ${i + 1}. ${imp}`));

	console.log("\n📋 METADATA:");
	console.log("-".repeat(40));
	console.log(`Word Count: ${result.metadata.wordCount}`);
	console.log(`Bullet Count: ${result.metadata.bulletCount}`);
	console.log(`Weak Verbs Found: ${result.metadata.weakVerbCount}`);
	console.log(`Metrics Found: ${result.metadata.metricsFoundCount}`);
	console.log(`Sections Detected: ${result.metadata.sectionsDetected.join(", ")}`);

	console.log("\n📝 SAMPLE SCORE CARDS:");
	console.log("-".repeat(40));

	// Show a few score card details
	const weakVerbCard = result.score_cards.bulletQuality.weakVerbs;
	console.log(`\n[Weak Verbs Card]`);
	console.log(`  Title: ${weakVerbCard.title}`);
	console.log(`  Severity: ${weakVerbCard.severity}`);
	console.log(`  Priority: ${weakVerbCard.priority}`);
	console.log(`  Score Impact: ${weakVerbCard.scoreImpact}`);
	console.log(`  Occurrences: ${weakVerbCard.occurrenceCount}`);
	if (weakVerbCard.findings.length > 0) {
		console.log(`  Sample Finding: "${weakVerbCard.findings[0].textSnippet?.substring(0, 50)}..."`);
	}

	const impactCard = result.score_cards.bulletQuality.impactScore;
	console.log(`\n[Impact Score Card]`);
	console.log(`  Title: ${impactCard.title}`);
	console.log(`  Severity: ${impactCard.severity}`);
	console.log(`  Priority: ${impactCard.priority}`);
	console.log(`  Score Impact: ${impactCard.scoreImpact}`);
	console.log(`  Estimated Gain: +${impactCard.estimatedScoreGain}`);

	console.log("\n" + "=".repeat(60));
	console.log("✅ TEST PASSED - ATS Score generated successfully!");
	console.log("=".repeat(60));

	// Output full JSON for inspection
	console.log("\n📄 FULL JSON OUTPUT (first 3000 chars):");
	console.log("-".repeat(40));
	const jsonOutput = JSON.stringify(result, null, 2);
	console.log(jsonOutput.substring(0, 3000) + "\n...[truncated]");

} catch (error) {
	console.error("\n❌ TEST FAILED:", error.message);
	console.error(error.stack);
	process.exit(1);
}
