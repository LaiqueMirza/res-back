const moment = require("moment");
const fs = require("fs");

moment.suppressDeprecationWarnings = true;
const puppeteer = require("puppeteer");
const { PDFDocument } = require("pdf-lib");
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
	fs.writeFileSync("resumePuppeteer.html", resumeHTML, "utf-8");

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

		// Load the initial HTML
		await page.setContent(resumeHTML, {
			waitUntil: "networkidle2",
			timeout: 60000,
		});
		console.log("page.setContent done");

		const options = {
			height: `${heightResume + 25}px`,
			width: `${widthResume}px`,
			// pageRanges: totalPages,
			margin: {
				top: "15px",
				bottom: "10px",
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

		// Load the generated PDF and count pages
		const pdfDoc = await PDFDocument.load(pdfBuffer);
		const numberOfPages = pdfDoc.getPageCount();
		if (numberOfPages != totalPages) {
			console.log("Modifying HTML for multi-page layout...");
			console.log(heightResume * totalPages, heightResume * numberOfPages);
			console.log(resumeHTML);

			resumeHTML = resumeHTML.replaceAll(
				heightResume * totalPages,
				heightResume * numberOfPages
			);
			fs.writeFileSync("resumePuppeteer2.html", resumeHTML, "utf-8");

			console.log(resumeHTML);
			// Reapply the modified HTML
			await page.setContent(resumeHTML, {
				waitUntil: "networkidle2",
				timeout: 60000,
			});
			console.log("Updated page.setContent done");
			pdfBuffer = await page.pdf(options);
		}

		// console.log(`Generated PDF has ${pdfBuffer.length} pages`);
		console.log("pdfBuffer done");
	} catch (error) {
		if (error.message) console.log("error in generating puppeteer pdf", error);
		if (error.message && error.message.includes("Connection closed")) {
			browser = await puppeteer.launch({
				headless: true,
			});
			this.convertHtmlToPdf(
				resumeHTML,
				heightResume,
				widthResume,
				totalPages,
				headerTemplate,
				footerTemplate
			);
		} else {
			throw error;
		}
	} finally {
		if (page) await page.close();
	}
	return pdfBuffer;
};
