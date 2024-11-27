const moment = require("moment");
moment.suppressDeprecationWarnings = true;
const puppeteer = require("puppeteer");

let browser = null;

async function initBrowser() {
	if (!browser) {
		browser = await puppeteer.launch({
			headless: true,
		});
	}
	// executablePath: "/usr/bin/chromium-browser",
	// 		args: ["--no-sandbox", "--disable-setuid-sandbox"],
}

exports.getTheRenderedHtmlFun = (temp, dataUn) => {
	// Create a new function that uses the template as its body
	const data = JSON.parse(JSON.stringify(dataUn));
	delete data.donotShowLanguageLevel;
	delete data.donotShowSkillLevel;
	// console.log(temp, data)
	const renderTemplate = new Function(
		...Object.keys(data),
		"moment",
		`return \`${temp}\`;`
	);

	// Call the function with the values from data
	return renderTemplate(...Object.values(data), moment);
};

exports.convertHtmlToPdf = async (
	resumeHTML,
	heightResume,
	widthResume,
	totalPages,
	headerTemplate,
	footerTemplate
) => {
		console.log("HTML content:", resumeHTML);
	// pages, width, backgroundColor
	await initBrowser();

	let pdfBuffer = null;
	let page = null;

	try {
		page = await browser.newPage();

		// Set the viewport to match the desired PDF dimensions
		await page.setViewport({
			width: parseInt(widthResume, 10),
			height: parseInt(heightResume, 10),
		});

		// await page.emulateMediaType("screen");
		await page.setContent(resumeHTML, {
			waitUntil: "networkidle2",
			timeout: 60000,
		});
		console.log("page.setContent done");

		const options = {
			height: `${heightResume}px`,
			width: `${widthResume}px`,
			pageRanges: totalPages,
			margin: {
				top: "15px", // Space for the header
				bottom: "15px", // Space for the footer
				left: "0px",
				right: "0px",
			},
			preferCSSPageSize: true,
			printBackground: true,
			displayHeaderFooter: true,
			headerTemplate,
			footerTemplate,
		};

		// Generate the PDF buffer
		pdfBuffer = await page.pdf(options);
		console.log("pdfBuffer done");
	} catch (error) {
		try {
			browser = await puppeteer.launch({
				headless: true,
			});
			throw error;
		} catch (error) {
			throw error;
		}
	} finally {
		if (page) await page.close();
	}
	return pdfBuffer;
};
