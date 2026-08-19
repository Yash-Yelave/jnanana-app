const fs = require('fs');

const js = fs.readFileSync('./scratch_js.txt', 'utf8');

// Extract all objects related to j-spotlight and cohort-3
const jspotlightPos = js.indexOf('J-SPOTLIGHT');
console.log('--- J-SPOTLIGHT Context ---');
if (jspotlightPos !== -1) {
  console.log(js.substring(Math.max(0, jspotlightPos - 200), Math.min(js.length, jspotlightPos + 2500)));
}

const cohort3Pos = js.indexOf('Cohort 3');
console.log('\n--- COHORT 3 Context ---');
if (cohort3Pos !== -1) {
  console.log(js.substring(Math.max(0, cohort3Pos - 200), Math.min(js.length, cohort3Pos + 2500)));
}
