const fs = require('fs');
const html = fs.readFileSync('test.html', 'utf8');
const regex = /<img[^>]+src="([^">]+)"/g;
let match;
const sources = new Set();
while ((match = regex.exec(html)) !== null) {
  sources.add(match[1]);
}
console.log(Array.from(sources));
