const fs = require('fs');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

// Get file number from command line argument or default to 9
const fileNumber = process.argv[2] || 9;
// Read the template and data
const templatePath = `temp${fileNumber} template_content.html`;
let template = fs.readFileSync(templatePath, 'utf8');

// Define embd as a global variable to avoid the 'Unexpected identifier' error
global.embd = 'embd';

const data = JSON.parse(fs.readFileSync('sampledataresponse.json', 'utf8'));



// Function to render the template with improved error handling
function renderTemplate(template, data) {
    try {
			// Use a simple string replacement approach instead of template literals
			let result = template;

			// First, replace all instances of prefix- with prefix- in data-testid attributes
			result = result.replace(/data-testid="prefix-/g, 'data-testid="prefix-');

			// Replace data placeholders in the template
			for (const key in data) {
				if (data.hasOwnProperty(key)) {
					const value = data[key];
					// Replace ${key} with the actual value
					const regex = new RegExp("\\${" + key + "}", "g");
					result = result.replace(regex, value);
				}
			}

			// Handle moment functions if needed
			// This is a simplified approach and may need to be expanded
			result = result.replace(
				/\${moment\([^)]+\)\.format\([^)]+\)}/g,
				(match) => {
					try {
						// Extract the arguments and evaluate
						return eval(match.slice(2, -1));
					} catch (e) {
						return match;
					}
				}
			);

			return result;
		} catch (error) {
        console.error('\nTemplate rendering error:', error.message);
        
        // Try to extract line number information from the error
        const lineMatch = error.stack.match(/anonymous>:([0-9]+):([0-9]+)/);
        if (lineMatch) {
            const errorLine = parseInt(lineMatch[1], 10);
            const errorColumn = parseInt(lineMatch[2], 10);
            
            // The line number in the error refers to the generated function,
            // not the original template. We need to map it back.
            // First, split the template into lines
            const templateLines = template.split('\n');
            const cleanData = { ...data };

            
            // Calculate approximate line in template
            // The error line includes the function header (parameters + return statement)
            const parameterLines = Object.keys(cleanData).length + 2; // +2 for 'moment' and the return statement
            const approximateTemplateLine = errorLine - parameterLines;
            
            if (approximateTemplateLine > 0 && approximateTemplateLine <= templateLines.length) {
                console.error('\nError likely near this part of the template:');
                
                // Show a few lines before and after the error
                const contextStart = Math.max(0, approximateTemplateLine - 5);
                const contextEnd = Math.min(templateLines.length, approximateTemplateLine + 5);
                
                for (let i = contextStart; i < contextEnd; i++) {
                    const lineNum = i + 1;
                    const prefix = lineNum === approximateTemplateLine ? '>>> ' : '    ';
                    console.error(`${prefix}${lineNum}: ${templateLines[i]}`);
                }
                
                console.error('\nCheck for unescaped template literals (${...}) or other syntax errors in this area.');
                console.error('Common issues:');
                console.error('1. Unescaped ${...} in CSS or HTML attributes');
                console.error('2. Unclosed template literals or quotes');
                console.error('3. Invalid JavaScript expressions inside ${...}');
            }
        }
        
        return `Template rendering error: ${error.message}`;
    }
}

// Render the template
const renderedHTML = renderTemplate(template, data, templatePath);

// Check if rendering was successful
if (!renderedHTML.startsWith('Template rendering error:')) {
    // Save the rendered HTML to a file
    fs.writeFileSync(`${fileNumber}_rendered_output.html`, renderedHTML, 'utf8');
    console.log('Rendering complete. Check rendered_output.html for the result.');
}



