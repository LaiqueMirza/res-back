const fs = require('fs');
const moment = require('moment');

// Read the sample data
const data = JSON.parse(fs.readFileSync('sampledataresponse.json', 'utf8'));

// Extract education data
const { education, appearanceSettings } = data;

console.log('Education data:', JSON.stringify(education, null, 2));
console.log('Education length:', education?.length);
console.log('Education check:', education?.length ? 'Has education' : 'No education');

// Test the education template logic
const educationTemplate = `
${education?.length ? `
<div class="education-section">
  <h2>Education</h2>
  ${education.map(edu => `
    <div class="education-item">
      <div class="dates">
        ${edu.startDate ? moment(edu.startDate).format(appearanceSettings?.dateFormat || "MM-YYYY") : ""}
        -
        ${edu.isPresent ? " Present" : edu.endDate ? moment(edu.endDate).format(appearanceSettings?.dateFormat || "MM-YYYY") : ""}
      </div>
      <div class="degree">${edu.degree}</div>
      <div class="school">${edu.school}</div>
      <div class="location">${edu.location}</div>
    </div>
  `).join('')}
</div>
` : ""}
`;

console.log('\nRendered education section:');
console.log(educationTemplate);

// Write to file
fs.writeFileSync('education_test_output.html', educationTemplate);
console.log('\nEducation test output written to education_test_output.html');