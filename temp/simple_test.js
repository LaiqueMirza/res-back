const fs = require('fs');

const data = JSON.parse(fs.readFileSync('sampledataresponse.json', 'utf8'));
const template = fs.readFileSync('test_simple.html', 'utf8');

const {personalDetails} = data;

try {
    const result = eval('`' + template + '`');
    console.log('Success:', result);
} catch (error) {
    console.log('Error:', error.message);
    console.log('Template:', template);
}