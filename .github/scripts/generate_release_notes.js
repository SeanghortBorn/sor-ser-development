#!/usr/bin/env node

/**
 * Generates beautiful release notes from commit analysis
 * Outputs both RELEASE_NOTES.md (for GitHub Release) and updates CHANGELOG.md
 */

const fs = require('fs');

function readJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function formatCommit(commit, includeHash = true) {
  const scope = commit.scope ? `**${commit.scope}**: ` : '';
  const hash = includeHash ? ` ([${commit.hash}](../../commit/${commit.hash}))` : '';
  return `- ${scope}${commit.description}${hash}`;
}

function generateReleaseNotes(analysis) {
  const { version, fullVersion, title, categories, commits, environment } = analysis;
  const date = new Date().toISOString().split('T')[0];
  const envLabel = process.env.ENV_LABEL || environment.toUpperCase();
  
  let notes = [];
  
  // Header with environment badge
  notes.push(`# ${title}\n`);
  notes.push(`**Environment:** ${envLabel} | **Version:** ${version} | **Date:** ${date}\n`);
  
  // Summary
  const totalChanges = commits.length;
  const breakdown = [];
  if (categories.breaking.length) breakdown.push(`${categories.breaking.length} breaking`);
  if (categories.features.length) breakdown.push(`${categories.features.length} features`);
  if (categories.fixes.length) breakdown.push(`${categories.fixes.length} fixes`);
  if (categories.performance.length) breakdown.push(`${categories.performance.length} performance`);
  if (categories.refactor.length) breakdown.push(`${categories.refactor.length} refactors`);
  
  notes.push(`## 📊 Summary\n`);
  notes.push(`This release includes **${totalChanges} changes**: ${breakdown.join(', ')}.\n`);
  
  // Breaking Changes (if any)
  if (categories.breaking.length > 0) {
    notes.push(`## 🚨 BREAKING CHANGES\n`);
    notes.push(`> ⚠️ **Important:** This release contains breaking changes that may require action.\n`);
    categories.breaking.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // What's New (Features)
  if (categories.features.length > 0) {
    notes.push(`## ✨ What's New\n`);
    categories.features.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // Bug Fixes
  if (categories.fixes.length > 0) {
    notes.push(`## 🐛 Bug Fixes\n`);
    categories.fixes.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // Performance Improvements
  if (categories.performance.length > 0) {
    notes.push(`## ⚡ Performance Improvements\n`);
    categories.performance.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // Code Refactoring
  if (categories.refactor.length > 0) {
    notes.push(`## ♻️ Code Refactoring\n`);
    categories.refactor.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // Documentation
  if (categories.documentation.length > 0) {
    notes.push(`## 📚 Documentation\n`);
    categories.documentation.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // Other changes
  const otherChanges = [
    ...categories.style,
    ...categories.tests,
    ...categories.chore,
    ...categories.other
  ];
  
  if (otherChanges.length > 0) {
    notes.push(`## 🔧 Other Changes\n`);
    otherChanges.forEach(commit => {
      notes.push(formatCommit(commit));
    });
    notes.push('');
  }
  
  // Footer
  notes.push(`---\n`);
  
  const tagPrefix = environment === 'production' ? 'v' : 
                     environment === 'staging' ? 'staging-v' : 'dev-v';
  const lastTagFormatted = analysis.lastTag || `${tagPrefix}${version}`;
  
  notes.push(`**Full Changelog**: https://github.com/${getRepoInfo()}/compare/${lastTagFormatted}...${tagPrefix}${version}\n`);
  
  return notes.join('\n');
}

function generateChangelogEntry(analysis) {
  const { version, fullVersion, title, categories, commits, environment } = analysis;
  const date = new Date().toISOString().split('T')[0];
  const envLabel = process.env.ENV_LABEL || environment.toUpperCase();
  
  let entry = [];
  
  entry.push(`\n## [${fullVersion}] - ${date} [${envLabel}]\n`);
  entry.push(`### ${title}\n`);
  
  if (categories.breaking.length > 0) {
    entry.push(`#### 🚨 BREAKING CHANGES\n`);
    categories.breaking.forEach(commit => {
      entry.push(formatCommit(commit, false));
    });
    entry.push('');
  }
  
  if (categories.features.length > 0) {
    entry.push(`#### ✨ Features\n`);
    categories.features.forEach(commit => {
      entry.push(formatCommit(commit, false));
    });
    entry.push('');
  }
  
  if (categories.fixes.length > 0) {
    entry.push(`#### 🐛 Bug Fixes\n`);
    categories.fixes.forEach(commit => {
      entry.push(formatCommit(commit, false));
    });
    entry.push('');
  }
  
  if (categories.performance.length > 0) {
    entry.push(`#### ⚡ Performance\n`);
    categories.performance.forEach(commit => {
      entry.push(formatCommit(commit, false));
    });
    entry.push('');
  }
  
  if (categories.refactor.length > 0) {
    entry.push(`#### ♻️ Refactoring\n`);
    categories.refactor.forEach(commit => {
      entry.push(formatCommit(commit, false));
    });
    entry.push('');
  }
  
  return entry.join('\n');
}

function getRepoInfo() {
  // Try to extract repo info from git remote
  const { execSync } = require('child_process');
  try {
    const remote = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const match = remote.match(/github\.com[:/](.+?)\.git/) || remote.match(/github\.com[:/](.+?)$/);
    return match ? match[1] : 'owner/repo';
  } catch (e) {
    return 'owner/repo';
  }
}

function main() {
  const analysis = readJSON('.release_info.json');
  
  // Generate release notes for GitHub Release
  const releaseNotes = generateReleaseNotes(analysis);
  fs.writeFileSync('RELEASE_NOTES.md', releaseNotes);
  console.log('✓ Generated RELEASE_NOTES.md');
  
  // Update CHANGELOG.md
  const changelogEntry = generateChangelogEntry(analysis);
  
  let changelog = '';
  if (fs.existsSync('CHANGELOG.md')) {
    changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n';
  }
  
  // Find where to insert (after the header, before first entry)
  const headerEnd = changelog.indexOf('\n## ');
  if (headerEnd > 0) {
    changelog = changelog.slice(0, headerEnd) + changelogEntry + changelog.slice(headerEnd);
  } else {
    changelog += changelogEntry;
  }
  
  fs.writeFileSync('CHANGELOG.md', changelog);
  console.log('✓ Updated CHANGELOG.md');
  
  console.log(`\n📝 Release Notes Preview:`);
  console.log('─'.repeat(60));
  console.log(releaseNotes.split('\n').slice(0, 20).join('\n'));
  console.log('─'.repeat(60));
}

main();
