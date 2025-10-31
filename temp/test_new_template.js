const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('sampledataresponse.json', 'utf8'));
    const template = fs.readFileSync('temp5 template_content_new.html', 'utf8');
    
    const { personalDetails, skills, education, employment, profileSummary, appearanceSettings, donotShowSkillLevel } = data;
    
    const result = eval('`' + template + '`');
    fs.writeFileSync('test_new_output.html', result);
    console.log('SUCCESS: New template rendered successfully');
} catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
}