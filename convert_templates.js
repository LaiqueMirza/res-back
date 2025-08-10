const fs = require('fs');
const path = require('path');

// Directory containing the template files
const templatesDir = path.join(__dirname, 'temp');

// Function to convert view_content.html to template_content.html
function convertViewToTemplate(viewFilePath, templateFilePath) {
    console.log(`Converting ${viewFilePath} to ${templateFilePath}`);
    
    // Read the view content file
    const viewContent = fs.readFileSync(viewFilePath, 'utf8');
    
    // Replace hardcoded content with template literals
    let templateContent = viewContent;
    
    // Replace personal details
    templateContent = templateContent.replace(/John Doe/g, '${personalDetails?.firstName || ""} ${personalDetails?.lastName || ""}');
    templateContent = templateContent.replace(/Software Engineer/g, '${personalDetails?.jobTitle || ""}');
    templateContent = templateContent.replace(/123 Main Street, City, Country/g, '${personalDetails?.address || ""}, ${personalDetails?.city || ""}, ${personalDetails?.country || ""}');
    templateContent = templateContent.replace(/john\.doe@example\.com/g, '${personalDetails?.email || ""}');
    templateContent = templateContent.replace(/\+1 234 567 890/g, '${personalDetails?.phone || ""}');
    
    // Replace professional summary
    const summaryRegex = /<div[^>]*class="[^"]*summary[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
    templateContent = templateContent.replace(summaryRegex, (match, p1) => {
        return match.replace(p1, '${profileSummary || "Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success. Well-versed in technology and writing code to create systems that are reliable and user-friendly. Skilled leader who has the proven ability to motivate, educate, and manage a team of professionals to build software programs and effectively track changes. Confident communicator, strategic thinker, and innovative creator to develop software that is customized to meet a company\'s organizational needs, highlight their core competencies, and further their success."}');
    });
    
    // Replace skills section
    const skillsRegex = /<div[^>]*class="[^"]*skills[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
    templateContent = templateContent.replace(skillsRegex, (match) => {
        return match.replace(/<li>[^<]*<\/li>/g, '${skills?.map(skill => `<li>${skill.skill || ""}${!skill.donotShowSkillLevel ? ` - ${skill.level || ""}` : ""}</li>`).join("") || "<li>JavaScript</li><li>React</li><li>Node.js</li><li>HTML/CSS</li><li>MongoDB</li>"}');
    });
    
    // Replace education section
    const educationRegex = /<div[^>]*class="[^"]*education[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
    templateContent = templateContent.replace(educationRegex, (match) => {
        return match.replace(/<div[^>]*class="[^"]*degree[^"]*"[^>]*>[^<]*<\/div>/g, '<div class="degree">${edu.degree || "Bachelor of Science"}</div>');
        
    }).replace(/<div[^>]*class="[^"]*school[^"]*"[^>]*>[^<]*<\/div>/g, '<div class="school">${edu.school || "University Name"}</div>')
      .replace(/<div[^>]*class="[^"]*date[^"]*"[^>]*>[^<]*<\/div>/g, '<div class="date">${edu.startDate ? moment(edu.startDate).format("MMM YYYY") : "Aug 2016"} - ${edu.endDate ? moment(edu.endDate).format("MMM YYYY") : "May 2020"}</div>')
      .replace(/<div[^>]*class="[^"]*location[^"]*"[^>]*>[^<]*<\/div>/g, '<div class="location">${edu.location || "City, Country"}</div>');
    
    // Replace education section with map function
    templateContent = templateContent.replace(
        /<div[^>]*class="[^"]*education-entry[^"]*"[^>]*>[\s\S]*?<\/div>/g,
        '${education?.map(edu => `\n        <div class="education-entry">\n          <div class="degree">${edu.degree || ""}</div>\n          <div class="school">${edu.school || ""}</div>\n          <div class="date">${edu.startDate ? moment(edu.startDate).format("MMM YYYY") : ""} - ${edu.endDate ? (edu.isPresent ? "Present" : moment(edu.endDate).format("MMM YYYY")) : ""}</div>\n          <div class="location">${edu.location || ""}</div>\n        </div>\n      `).join("") || `\n        <div class="education-entry">\n          <div class="degree">Bachelor of Science in Computer Science</div>\n          <div class="school">University Name</div>\n          <div class="date">Aug 2016 - May 2020</div>\n          <div class="location">City, Country</div>\n        </div>\n      `}'
    );
    
    // Replace languages section
    const languagesRegex = /<div[^>]*class="[^"]*languages[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
    templateContent = templateContent.replace(languagesRegex, (match) => {
        return match.replace(/<li>[^<]*<\/li>/g, '${languages?.map(language => `<li>${language.language || ""}${!language.donotShowLanguageLevel ? ` - ${language.level || ""}` : ""}</li>`).join("") || "<li>English - Native</li><li>Spanish - Intermediate</li>"}');
    });
    
    // Replace work history section
    templateContent = templateContent.replace(
        /<div[^>]*class="[^"]*work-entry[^"]*"[^>]*>[\s\S]*?<\/div>/g,
        '${employment?.map(job => `\n        <div class="work-entry">\n          <div class="job-title">${job.jobTitle || ""}</div>\n          <div class="employer">${job.employer || ""}</div>\n          <div class="location">${job.location || ""}</div>\n          <div class="date">${job.startDate ? moment(job.startDate).format("MMM YYYY") : ""} - ${job.isPresent ? "Present" : (job.endDate ? moment(job.endDate).format("MMM YYYY") : "")}</div>\n          <div class="description">${job.description || ""}</div>\n        </div>\n      `).join("") || `\n        <div class="work-entry">\n          <div class="job-title">Software Engineer</div>\n          <div class="employer">Company Name</div>\n          <div class="location">City, Country</div>\n          <div class="date">Jan 2020 - Present</div>\n          <div class="description">Responsible for developing and maintaining web applications using React, Node.js, and MongoDB.</div>\n        </div>\n        <div class="work-entry">\n          <div class="job-title">Junior Developer</div>\n          <div class="employer">Previous Company</div>\n          <div class="location">City, Country</div>\n          <div class="date">Jun 2018 - Dec 2019</div>\n          <div class="description">Assisted in the development of web applications and learned various programming languages and frameworks.</div>\n        </div>\n      `}'
    );
    
    // Replace appearance settings
    templateContent = templateContent.replace(/font-size:\s*\d+px/g, 'font-size: ${appearanceSettings?.fontSize || 14}px');
    templateContent = templateContent.replace(/line-height:\s*[\d\.]+/g, 'line-height: ${appearanceSettings?.lineHeight || 1.5}');
    templateContent = templateContent.replace(/font-family:\s*[^;]+;/g, 'font-family: ${appearanceSettings?.fontFamily || "Arial"};');
    templateContent = templateContent.replace(/color:\s*#[0-9a-fA-F]{3,6}/g, 'color: ${appearanceSettings?.primaryColor || "#000000"}');
    templateContent = templateContent.replace(/background-color:\s*#[0-9a-fA-F]{3,6}/g, 'background-color: ${appearanceSettings?.secondaryColor || "#ffffff"}');
    
    // Write the template content file
    fs.writeFileSync(templateFilePath, templateContent, 'utf8');
    console.log(`Successfully converted ${viewFilePath} to ${templateFilePath}`);
}

// Find all view_content.html files and convert them
fs.readdir(templatesDir, (err, files) => {
    if (err) {
        console.error('Error reading templates directory:', err);
        return;
    }
    
    // Filter for view_content.html files
    const viewContentFiles = files.filter(file => file.includes('view_content.html'));
    
    // Process each file
    viewContentFiles.forEach(file => {
        const templateNumber = file.match(/temp(\d+)\s+view_content\.html/);
        if (templateNumber && templateNumber[1]) {
            const viewFilePath = path.join(templatesDir, file);
            const templateFilePath = path.join(templatesDir, `temp${templateNumber[1]} template_content.html`);
            
            // Skip if template file already exists
            if (!fs.existsSync(templateFilePath)) {
                convertViewToTemplate(viewFilePath, templateFilePath);
            } else {
                console.log(`Template file ${templateFilePath} already exists. Skipping.`);
            }
        }
    });
    
    console.log('Conversion complete!');
});