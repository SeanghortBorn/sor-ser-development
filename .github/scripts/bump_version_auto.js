#!/usr/bin/env node

/**
 * Bumps version in package.json and version.json based on analysis
 */

const fs = require('fs');

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

function main() {
  // Read release analysis
  const analysis = readJSON('.release_info.json');
  const { bumpType, environment } = analysis;
  
  // Read and update package.json
  const pkg = readJSON('package.json');
  const currentVersion = pkg.version || '1.0.0';
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  console.log(`Bumping version for ${environment}: ${currentVersion} → ${newVersion} (${bumpType})`);
  
  pkg.version = newVersion;
  writeJSON('package.json', pkg);
  
  // Update version.json
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  let versionJson = {};
  
  if (fs.existsSync('version.json')) {
    versionJson = readJSON('version.json');
  }
  
  // Update the appropriate environment version
  if (environment === 'production') {
    versionJson.production = `${newVersion}.${today}`;
  } else if (environment === 'staging') {
    versionJson.staging = `STAGING-${newVersion}.${today}`;
  } else {
    versionJson.local = `LOCAL-${newVersion}.${today}`;
  }
  
  writeJSON('version.json', versionJson);
  
  // Update analysis with new version
  analysis.version = newVersion;
  analysis.fullVersion = environment === 'production' 
    ? `${newVersion}.${today}`
    : environment === 'staging'
    ? `STAGING-${newVersion}.${today}`
    : `LOCAL-${newVersion}.${today}`;
  writeJSON('.release_info.json', analysis);
  
  console.log(`✓ Version bumped to ${newVersion}`);
  console.log(`✓ version.json updated (${environment}: ${analysis.fullVersion})`);
}

main();
