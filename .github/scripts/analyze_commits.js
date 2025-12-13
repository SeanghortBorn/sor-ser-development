#!/usr/bin/env node

/**
 * Analyzes commits since last tag using Conventional Commits format
 * Determines version bump type and categorizes changes
 * 
 * Conventional Commit Format:
 * - feat: A new feature (minor bump)
 * - fix: A bug fix (patch bump)
 * - BREAKING CHANGE: Breaking API change (major bump)
 * - docs: Documentation changes (no bump)
 * - style: Code style changes (no bump)
 * - refactor: Code refactoring (patch bump)
 * - perf: Performance improvements (patch bump)
 * - test: Test changes (no bump)
 * - chore: Build/tooling changes (no bump)
 */

const { execSync } = require('child_process');
const fs = require('fs');

function getLastTag() {
  try {
    const environment = process.env.ENVIRONMENT || 'local';
    const branch = process.env.BRANCH || 'main';
    
    // Get tag prefix based on environment
    let tagPrefix = '';
    if (environment === 'production') {
      tagPrefix = 'v';
    } else if (environment === 'staging') {
      tagPrefix = 'staging-v';
    } else {
      tagPrefix = 'dev-v';
    }
    
    // Get the last tag for this environment
    const tags = execSync(`git tag -l "${tagPrefix}*" --sort=-version:refname`, { encoding: 'utf8' }).trim();
    const lastTag = tags.split('\n')[0] || null;
    
    return lastTag;
  } catch (e) {
    return null;
  }
}

function getCommitsSinceTag(tag) {
  try {
    const range = tag ? `${tag}..HEAD` : 'HEAD';
    const commits = execSync(`git log ${range} --pretty=format:"%H|%s|%b|%an|%ae|%ad" --date=short`, { 
      encoding: 'utf8' 
    }).trim();
    
    if (!commits) return [];
    
    return commits.split('\n').map(line => {
      const [hash, subject, body, author, email, date] = line.split('|');
      return { hash, subject, body: body || '', author, email, date };
    });
  } catch (e) {
    console.error('Error getting commits:', e.message);
    return [];
  }
}

function parseConventionalCommit(commit) {
  const { subject, body, hash, author, date } = commit;
  
  // Check for breaking changes
  const hasBreakingChange = 
    body.includes('BREAKING CHANGE') || 
    body.includes('BREAKING-CHANGE') ||
    subject.includes('!:');
  
  // Parse commit type and scope
  const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = subject.match(conventionalRegex);
  
  if (!match) {
    return {
      type: 'other',
      scope: null,
      breaking: hasBreakingChange,
      description: subject,
      hash: hash.substring(0, 7),
      author,
      date,
      raw: subject
    };
  }
  
  const [, type, scope, exclamation, description] = match;
  
  return {
    type: type.toLowerCase(),
    scope: scope || null,
    breaking: hasBreakingChange || exclamation === '!',
    description: description.trim(),
    hash: hash.substring(0, 7),
    author,
    date,
    raw: subject
  };
}

function determineVersionBump(commits) {
  let hasMajor = false;
  let hasMinor = false;
  let hasPatch = false;
  
  commits.forEach(commit => {
    if (commit.breaking) {
      hasMajor = true;
    } else if (commit.type === 'feat') {
      hasMinor = true;
    } else if (['fix', 'refactor', 'perf'].includes(commit.type)) {
      hasPatch = true;
    }
  });
  
  if (hasMajor) return 'major';
  if (hasMinor) return 'minor';
  if (hasPatch) return 'patch';
  return 'none';
}

function categorizeCommits(commits) {
  const categories = {
    breaking: [],
    features: [],
    fixes: [],
    performance: [],
    refactor: [],
    documentation: [],
    style: [],
    tests: [],
    chore: [],
    other: []
  };
  
  commits.forEach(commit => {
    if (commit.breaking) {
      categories.breaking.push(commit);
    } else {
      switch (commit.type) {
        case 'feat':
          categories.features.push(commit);
          break;
        case 'fix':
          categories.fixes.push(commit);
          break;
        case 'perf':
          categories.performance.push(commit);
          break;
        case 'refactor':
          categories.refactor.push(commit);
          break;
        case 'docs':
          categories.documentation.push(commit);
          break;
        case 'style':
          categories.style.push(commit);
          break;
        case 'test':
          categories.tests.push(commit);
          break;
        case 'chore':
          categories.chore.push(commit);
          break;
        default:
          categories.other.push(commit);
      }
    }
  });
  
  return categories;
}

function generateReleaseTitle(bumpType, categories) {
  if (categories.breaking.length > 0) {
    return `🚨 Major Release - Breaking Changes`;
  }
  
  if (categories.features.length > 0) {
    const featureCount = categories.features.length;
    return `✨ New Features and Improvements (${featureCount} ${featureCount === 1 ? 'feature' : 'features'})`;
  }
  
  if (categories.fixes.length > 0) {
    const fixCount = categories.fixes.length;
    return `🐛 Bug Fixes and Improvements (${fixCount} ${fixCount === 1 ? 'fix' : 'fixes'})`;
  }
  
  return '🔧 Maintenance Release';
}

function main() {
  const environment = process.env.ENVIRONMENT || 'local';
  const branch = process.env.BRANCH || 'main';
  
  console.log(`\n=== Analyzing Commits for ${environment.toUpperCase()} (${branch}) ===\n`);
  
  const lastTag = getLastTag();
  console.log(`Last tag: ${lastTag || 'none'}`);
  
  const rawCommits = getCommitsSinceTag(lastTag);
  console.log(`Found ${rawCommits.length} commits since last tag`);
  
  if (rawCommits.length === 0) {
    console.log('No commits to release');
    process.exit(0);
  }
  
  // Parse commits
  const parsedCommits = rawCommits.map(parseConventionalCommit);
  
  // Filter out chore commits with [skip ci] or [skip release]
  const releaseCommits = parsedCommits.filter(c => 
    !c.raw.includes('[skip ci]') && 
    !c.raw.includes('[skip release]')
  );
  
  if (releaseCommits.length === 0) {
    console.log('No releasable commits found');
    process.exit(0);
  }
  
  const bumpType = determineVersionBump(releaseCommits);
  
  if (bumpType === 'none') {
    console.log('No version bump needed (only docs/style/test changes)');
    process.exit(0);
  }
  
  const categories = categorizeCommits(releaseCommits);
  const title = generateReleaseTitle(bumpType, categories);
  
  const analysis = {
    environment,
    branch,
    lastTag,
    bumpType,
    title,
    commitCount: releaseCommits.length,
    categories,
    commits: releaseCommits
  };
  
  // Write analysis to file for next steps
  fs.writeFileSync('.release_info.json', JSON.stringify(analysis, null, 2));
  
  console.log(`\nRelease Analysis:`);
  console.log(`- Environment: ${environment}`);
  console.log(`- Branch: ${branch}`);
  console.log(`- Bump Type: ${bumpType}`);
  console.log(`- Title: ${title}`);
  console.log(`- Breaking Changes: ${categories.breaking.length}`);
  console.log(`- Features: ${categories.features.length}`);
  console.log(`- Fixes: ${categories.fixes.length}`);
  console.log(`\nRelease info saved to .release_info.json`);
}

main();
