const fs = require('fs');
const path = require('path');
const moment = require('moment'); // Add moment.js for date formatting

// Load template and data
const templatePath = path.join(__dirname, 'temp', 'temp5 template_content.html');
const dataPath = path.join(__dirname, 'temp', 'sampledataresponse.json');

const template = fs.readFileSync(templatePath, 'utf8');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Create a function to render the template with the data
function renderTemplate(template, data) {
  // Create a function that will have access to the data object and moment
  const renderFunction = new Function('data', 'moment', `
    const { 
      skills, 
      courses, 
      education, 
      languages, 
      employment, 
      certificates, 
      profileSummary, 
      personalDetails, 
      appearanceSettings 
    } = data;
    return \`${template}\`;
  `);
  
  return renderFunction(data, moment);
}

// Render the template
const rendered = renderTemplate(template, data);

// Write the rendered output to a file
fs.writeFileSync(path.join(__dirname, 'temp', 'rendered_output.html'), rendered);

console.log('Template rendered successfully!');