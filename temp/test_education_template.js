const fs = require('fs');
const moment = require('moment');

// Read the template and data
const template = fs.readFileSync('temp4 template_content.html', 'utf8');
const data = JSON.parse(fs.readFileSync('sampledataresponse.json', 'utf8'));

// Extract the education section from the template
const educationStart = template.indexOf('${education?.length ? `');
const educationEnd = template.indexOf('` : ""}', educationStart) + 7;

if (educationStart === -1 || educationEnd === -1) {
    console.log('Could not find education section in template');
    process.exit(1);
}

const educationSection = template.substring(educationStart, educationEnd);
console.log('Education section template:');
console.log('='.repeat(50));
console.log(educationSection);
console.log('='.repeat(50));

// Test rendering just the education section
try {
    const { education, appearanceSettings } = data;
    
    const templateFunction = new Function(
        'education',
        'appearanceSettings', 
        'moment',
        `return \`${educationSection}\`;`
    );
    
    const result = templateFunction(education, appearanceSettings, moment);
    console.log('\nRendered result:');
    console.log(result);
    
    fs.writeFileSync('education_section_test.html', result);
    console.log('\nEducation section test written to education_section_test.html');
    
} catch (error) {
    console.error('Error rendering education section:', error.message);
    console.error('Stack:', error.stack);
}