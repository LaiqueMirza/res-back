const fs = require('fs');
const moment = require('moment');

// Read the sample data
const data = JSON.parse(fs.readFileSync('sampledataresponse.json', 'utf8'));

// Create a minimal template with just the education section
const minimalTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Education Test</title>
</head>
<body>
    <h1>Before Education Section</h1>
    
    ${education?.length ? `
    <div class="education-section">
        <h2>EDUCATION SECTION</h2>
        ${education.map(edu => `
            <div class="education-item">
                <h3>${edu.degree}</h3>
                <p>${edu.school} - ${edu.location}</p>
                <p>${edu.startDate ? moment(edu.startDate).format("MM-YYYY") : ""} - ${edu.isPresent ? "Present" : edu.endDate ? moment(edu.endDate).format("MM-YYYY") : ""}</p>
            </div>
        `).join('')}
    </div>
    ` : "<p>No education data found</p>"}
    
    <h1>After Education Section</h1>
</body>
</html>
`;

try {
    const { education, appearanceSettings } = data;
    
    console.log('Education data exists:', !!education);
    console.log('Education length:', education?.length);
    console.log('Education array:', JSON.stringify(education, null, 2));
    
    const templateFunction = new Function(
        'education',
        'appearanceSettings',
        'moment',
        `return \`${minimalTemplate}\`;`
    );
    
    const result = templateFunction(education, appearanceSettings, moment);
    
    fs.writeFileSync('minimal_education_test.html', result);
    console.log('\nMinimal education test written to minimal_education_test.html');
    console.log('\nFirst 500 characters of result:');
    console.log(result.substring(0, 500));
    
} catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
}