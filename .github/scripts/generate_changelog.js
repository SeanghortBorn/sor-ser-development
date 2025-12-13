// This generates a short changelog for the release by listing commits since the last tag. The generated content is appended to CHANGELOG.md and will be used as release notes in GitHub Release.

const fs = require('fs');
const { execSync } = require('child_process');


function lastTag() {
try {
return execSync('git describe --tags --abbrev=0').toString().trim();
} catch (e) {
return null;
}
}


function commitsSince(tag) {
let range = tag ? `${tag}..HEAD` : 'HEAD';
const out = execSync(`git log ${range} --pretty=format:"- %s (%an)"`).toString().trim();
return out;
}


(function main() {
const tag = lastTag();
const commits = commitsSince(tag);
const header = tag ? `Changes since ${tag}:\n` : 'Changes:\n';


const content = `\n${header}\n${commits}\n`;
fs.appendFileSync('CHANGELOG.md', content);
console.log('CHANGELOG.md updated');
})();