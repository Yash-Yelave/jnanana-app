const fs = require('fs');

const jsContent = fs.readFileSync('./scratch_js.txt', 'utf8');

// Find occurrences of text strings in JS bundle related to Spotlight and Cohort
const regexes = [
  /j-spotlight/gi,
  /cohort/gi,
  /unicorn/gi,
  /spotlight/gi
];

regexes.forEach(re => {
  console.log(`\n=== MATCHES FOR ${re} ===`);
  let match;
  let count = 0;
  while ((match = re.exec(jsContent)) !== null) {
    count++;
    const start = Math.max(0, match.index - 150);
    const end = Math.min(jsContent.length, match.index + 250);
    console.log(`Match ${count}: ${jsContent.substring(start, end).replace(/\n/g, ' ')}\n`);
    if (count >= 15) break;
  }
});
