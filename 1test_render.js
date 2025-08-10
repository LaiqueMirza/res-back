const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Read the template file
const templatePath = path.join(__dirname, 'temp', 'temp7 template_content.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Read the sample data
const sampleDataPath = path.join(__dirname, 'temp', 'sampledataresponse.json');
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

// Function to format dates
function formatDate(date, format = sampleData.appearanceSettings?.dateFormat || 'MM-YYYY') {
  if (!date) return '';
  return moment(date).format(format);
}

// Create a safer way to render the template
const { personalDetails, profileSummary, skills, languages, certificates, 
        courses, education, employment, appearanceSettings, websitesAndSocialLinks } = sampleData;

// Handle websitesAndSocialLinks section
let websitesAndSocialLinksHtml = '';
if (websitesAndSocialLinks && websitesAndSocialLinks.length) {
  websitesAndSocialLinksHtml = websitesAndSocialLinks
    .map(link => `<li>${link.label || ''}: ${link.link || ''}</li>`)
    .join('');
}
template = template.replace('${websitesAndSocialLinks.map(link => `<li>${link.label || \'\'}: ${link.link || \'\'}</li>`).join(\'\')}', websitesAndSocialLinksHtml);

// Handle skills section
let skillsHtml = '';
if (skills && skills.length) {
  skillsHtml = skills
    .map(skill => `<li>${skill.skill || ''}${!skill.donotShowSkillLevel ? ` - ${skill.skillLevel || ''}` : ''}</li>`)
    .join('');
}
template = template.replace(/\${skills\?.map\(skill => `<li>\${skill\.skill[^}]*<\/li>`\)\.join\(''\/\*[^}]*\*\/\)}/g, skillsHtml);

// Handle languages section
let languagesHtml = '';
if (languages && languages.length) {
  languagesHtml = languages
    .map(language => `<li>${language.language || ''}${!language.donotShowLanguageLevel ? ` - ${language.languageLevel || ''}` : ''}</li>`)
    .join('');
}
template = template.replace(/\${languages\?.map\(language => `<li>\${language\.language[^}]*<\/li>`\)\.join\(''\/\*[^}]*\*\/\)}/g, languagesHtml);

// Handle employment section
let employmentHtml = '';
if (employment && employment.length) {
  employmentHtml = employment
    .map(job => {
      const startDate = formatDate(job.startDate);
      const endDate = job.isCurrentlyWorking ? 'Present' : formatDate(job.endDate);
      return `
        <div class="jobBlock">
          <div class="jobHeader">
            <div class="jobTitle">${job.jobTitle || ''}</div>
            <div class="jobDuration">${startDate} - ${endDate}</div>
          </div>
          <div class="companyName">${job.employer || ''}</div>
          <div class="jobLocation">${job.city || ''}, ${job.country || ''}</div>
          <div class="jobDescription">${job.description || ''}</div>
        </div>
      `;
    })
    .join('');
}
template = template.replace(/\${employment\?.map\(job => {[^}]*}\)\.join\(''\/\*[^}]*\*\/\)}/gs, employmentHtml);

// Handle education section
let educationHtml = '';
if (education && education.length) {
  educationHtml = education
    .map(edu => {
      const startDate = formatDate(edu.startDate);
      const endDate = edu.isCurrentlyPursuing ? 'Present' : formatDate(edu.endDate);
      return `
        <div class="educationBlock">
          <div class="educationHeader">
            <div class="degree">${edu.degree || ''}</div>
            <div class="educationDuration">${startDate} - ${endDate}</div>
          </div>
          <div class="institutionName">${edu.institution || ''}</div>
          <div class="educationLocation">${edu.city || ''}, ${edu.country || ''}</div>
        </div>
      `;
    })
    .join('');
}
template = template.replace(/\${education\?.map\(edu => {[^}]*}\)\.join\(''\/\*[^}]*\*\/\)}/gs, educationHtml);

// Handle certificates section
let certificatesHtml = '';
if (certificates && certificates.length) {
  certificatesHtml = certificates
    .map(cert => `<li>${cert.certificate || ''} (${formatDate(cert.date)})</li>`)
    .join('');
}
template = template.replace(/\${certificates\?.map\(cert => `<li>\${cert\.certificate[^}]*<\/li>`\)\.join\(''\/\*[^}]*\*\/\)}/g, certificatesHtml);

// Handle courses section
let coursesHtml = '';
if (courses && courses.length) {
  coursesHtml = courses
    .map(course => `<li>${course.course || ''} (${formatDate(course.date)})</li>`)
    .join('');
}
template = template.replace(/\${courses\?.map\(course => `<li>\${course\.course[^}]*<\/li>`\)\.join\(''\/\*[^}]*\*\/\)}/g, coursesHtml);

// Replace simple template literals
template = template.replace(/\${personalDetails\?.firstName\s*\|\|\s*''}/g, personalDetails?.firstName || '');
template = template.replace(/\${personalDetails\?.lastName\s*\|\|\s*''}/g, personalDetails?.lastName || '');
template = template.replace(/\${personalDetails\?.jobTitle\s*\|\|\s*''}/g, personalDetails?.jobTitle || '');
template = template.replace(/\${personalDetails\?.email\s*\|\|\s*''}/g, personalDetails?.email || '');
template = template.replace(/\${personalDetails\?.phone\s*\|\|\s*''}/g, personalDetails?.phone || '');
template = template.replace(/\${personalDetails\?.address\s*\|\|\s*''}/g, personalDetails?.address || '');
template = template.replace(/\${personalDetails\?.city\s*\|\|\s*''}/g, personalDetails?.city || '');
template = template.replace(/\${personalDetails\?.country\s*\|\|\s*''}/g, personalDetails?.country || '');
template = template.replace(/\${personalDetails\?.postalCode\s*\|\|\s*''}/g, personalDetails?.postalCode || '');
template = template.replace(/\${profileSummary\s*\|\|\s*''}/g, profileSummary || '');

// Replace appearance settings
template = template.replace(/\${appearanceSettings\?.fontSize\s*\|\|\s*\d+}/g, appearanceSettings?.fontSize || 14);
template = template.replace(/\${appearanceSettings\?.lineHeight\s*\|\|\s*[\d\.]+}/g, appearanceSettings?.lineHeight || 1.5);
template = template.replace(/\${appearanceSettings\?.fontFamily\s*\|\|\s*'[^']+'}/g, appearanceSettings?.fontFamily || 'Arial');
template = template.replace(/\${appearanceSettings\?.primaryColor\s*\|\|\s*'[^']+'}/g, appearanceSettings?.primaryColor || '#000000');
template = template.replace(/\${appearanceSettings\?.secondaryColor\s*\|\|\s*'[^']+'}/g, appearanceSettings?.secondaryColor || '#777777');
template = template.replace(/\${appearanceSettings\?.resumeWidth\s*\|\|\s*\d+}/g, appearanceSettings?.resumeWidth || 816);
template = template.replace(/\${appearanceSettings\?.resumeHeight\s*\|\|\s*\d+}/g, appearanceSettings?.resumeHeight || 1056);

// Write the rendered output to a file
const outputPath = path.join(__dirname, 'rendered_output.html');
fs.writeFileSync(outputPath, template, 'utf8');

console.log(`Template rendered successfully. Output saved to ${outputPath}`);