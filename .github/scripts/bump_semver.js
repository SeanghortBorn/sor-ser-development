// Add this Node script to bump semver in package.json and prepare version.json (numeric version only — date is added by update_readme.sh which appends YYYYMMDD for the environment).

const fs = require('fs');
const { execSync } = require('child_process');


const env = process.argv[2] || 'production';
const bumpType = process.env.BUMP_TYPE || 'patch';


const pkgPath = 'package.json';
const versionJsonPath = 'version.json';


function readJSON(path) {
return JSON.parse(fs.readFileSync(path, 'utf8'));
}


function writeJSON(path, obj) {
fs.writeFileSync(path, JSON.stringify(obj, null, 2) + '\n');
}


function bumpVersion(version, type) {
const parts = version.split('.').map(Number);
if (type === 'major') {
parts[0] += 1;
parts[1] = 0;
parts[2] = 0;
} else if (type === 'minor') {
parts[1] += 1;
parts[2] = 0;
} else {
// patch
parts[2] += 1;
}
return parts.join('.');
}


(function main() {
const pkg = readJSON(pkgPath);
const current = pkg.version || '1.0.0';
// Bump type comes from the env variable prepared by GH Action
const bump = process.env.BUMP_TYPE || 'patch';
const next = bumpVersion(current, bump);
console.log(`Current semver: ${current} -> next: ${next} (bump: ${bump})`);


pkg.version = next;
writeJSON(pkgPath, pkg);


// Update version.json (without date suffix yet)
let vjson = {};
if (fs.existsSync(versionJsonPath)) vjson = readJSON(versionJsonPath);
if (env === 'production') {
vjson.production = `${next}`; // date to be appended by update_readme
} else if (env === 'staging') {
vjson.staging = `STAGING-${next}`;
} else {
vjson.local = `LOCAL-${next}`;
}
writeJSON(versionJsonPath, vjson);


// Print final version for logs
console.log('Updated package.json and version.json');
})();