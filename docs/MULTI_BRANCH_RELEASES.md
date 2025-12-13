# 🌳 Multi-Branch Release System

## Overview

Your project now has **automatic release management for all three branches**:

- 🟢 **main** (Development) - Local development releases
- 🟡 **staging** (Testing) - Staging server releases  
- 🔴 **production** (Public) - Production releases for end users

Each branch maintains its own version tracking and release history.

---

## 📋 How It Works

### Branch Structure

```
┌─────────────────────────────────────────────────────────────┐
│  MAIN (Development)                                         │
│  • Tag prefix: dev-v1.0.0                                   │
│  • For local development and testing                        │
│  • Marked as "pre-release" on GitHub                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ merge when ready
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGING (Testing Server)                                   │
│  • Tag prefix: staging-v1.0.0                               │
│  • For testing server deployments                           │
│  • Marked as "pre-release" on GitHub                        │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ merge when tested
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION (Public Release)                                │
│  • Tag prefix: v1.0.0                                       │
│  • For end-user releases                                    │
│  • Full release on GitHub (not pre-release)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Usage Examples

### Development Release (main branch)

```bash
# Work on main branch
git checkout main

# Make changes and commit with conventional format
git add .
git commit -m "feat: add new analytics dashboard"

# Push to trigger dev release
git push origin main

# Result:
# ✅ Tag: dev-v1.1.0
# ✅ Release: [Development] ✨ New Features and Improvements
# ✅ version.json: LOCAL-1.1.0.20241213
# ✅ GitHub Release (pre-release)
```

### Staging Release (staging branch)

```bash
# Merge main to staging after dev testing
git checkout staging
git merge main

# Or commit directly to staging
git add .
git commit -m "fix: resolve API timeout issues"

# Push to create staging release
git push origin staging

# Result:
# ✅ Tag: staging-v1.1.1
# ✅ Release: [Staging] 🐛 Bug Fixes and Improvements
# ✅ version.json: STAGING-1.1.1.20241213
# ✅ GitHub Release (pre-release)
```

### Production Release (production branch)

```bash
# Merge staging to production after testing
git checkout production
git merge staging

# Or commit directly
git add .
git commit -m "feat: release new user export feature"

# Push to create production release
git push origin production

# Result:
# ✅ Tag: v1.2.0
# ✅ Release: [Production] ✨ New Features and Improvements
# ✅ version.json: 1.2.0.20241213
# ✅ GitHub Release (full release - visible to users)
```

---

## 📁 Version Tracking

### version.json Structure

```json
{
  "local": "LOCAL-1.2.0.20241213",
  "staging": "STAGING-1.2.0.20241213",
  "production": "1.2.0.20241213"
}
```

Each environment tracks its own version independently.

---

## 🏷️ Tag Naming Convention

| Environment | Branch | Tag Prefix | Example |
|-------------|--------|------------|---------|
| Development | main | `dev-v` | `dev-v1.2.0` |
| Staging | staging | `staging-v` | `staging-v1.2.0` |
| Production | production | `v` | `v1.2.0` |

---

## 📝 Release Notes Format

### Development Release Example

```markdown
# ✨ New Features and Improvements (2 features)

**Environment:** Development | **Version:** 1.1.0 | **Date:** 2024-12-13

## 📊 Summary
This release includes 2 changes: 2 features.

## ✨ What's New
- **dashboard**: Add real-time analytics visualization
- **export**: Implement CSV export functionality

---
**Full Changelog**: https://github.com/owner/repo/compare/dev-v1.0.0...dev-v1.1.0
```

### Staging Release Example

```markdown
# 🐛 Bug Fixes and Improvements (1 fix)

**Environment:** Staging | **Version:** 1.1.1 | **Date:** 2024-12-13

## 📊 Summary
This release includes 1 change: 1 fix.

## 🐛 Bug Fixes
- **api**: Resolve timeout issues on large datasets

---
**Full Changelog**: https://github.com/owner/repo/compare/staging-v1.1.0...staging-v1.1.1
```

### Production Release Example

```markdown
# ✨ New Features and Improvements (3 features)

**Environment:** Production | **Version:** 1.2.0 | **Date:** 2024-12-13

## 📊 Summary
This release includes 5 changes: 3 features, 2 fixes.

## ✨ What's New
- **dashboard**: Add real-time analytics visualization
- **export**: Implement CSV export functionality
- **notifications**: Add email notifications for reports

## 🐛 Bug Fixes
- **api**: Resolve timeout issues on large datasets
- **ui**: Fix responsive layout on mobile devices

---
**Full Changelog**: https://github.com/owner/repo/compare/v1.1.0...v1.2.0
```

---

## 🎯 Recommended Workflow

### 1. Development Phase

```bash
# Feature branch → main
git checkout -b feature/new-dashboard
git commit -m "feat: add analytics dashboard"
git push origin feature/new-dashboard

# Create PR to main
# After review, merge to main
# ✨ Auto-release creates dev-v1.1.0
```

### 2. Testing Phase

```bash
# After dev testing passes, promote to staging
git checkout staging
git merge main
git push origin staging

# ✨ Auto-release creates staging-v1.1.0
# Test on staging server
```

### 3. Production Deployment

```bash
# After staging tests pass, promote to production
git checkout production
git merge staging
git push origin production

# ✨ Auto-release creates v1.1.0
# Users can see "What's New" in releases
```

---

## 📊 CHANGELOG.md Structure

Your changelog will maintain a clear history for each environment:

```markdown
# Changelog

## [1.2.0.20241213] - 2024-12-13 [Production]
### ✨ New Features and Improvements (3 features)
#### Features
- **dashboard**: Add real-time analytics
- **export**: Implement CSV export
...

## [STAGING-1.2.0.20241213] - 2024-12-13 [Staging]
### 🐛 Bug Fixes and Improvements (1 fix)
#### Bug Fixes
- **api**: Resolve timeout issues
...

## [LOCAL-1.1.0.20241213] - 2024-12-13 [Development]
### ✨ New Features and Improvements (2 features)
#### Features
- **dashboard**: Add new widget system
...
```

---

## 🔍 Viewing Releases

### On GitHub

1. Go to your repository
2. Click **"Releases"** on the right sidebar
3. You'll see releases organized by tag:
   - **Latest release**: Production (v1.2.0)
   - **Pre-releases**: 
     - 🟡 staging-v1.2.0 (Staging)
     - 🟢 dev-v1.2.0 (Development)

### Filter by Environment

```bash
# List all production releases
git tag -l "v*"

# List all staging releases
git tag -l "staging-v*"

# List all dev releases
git tag -l "dev-v*"
```

---

## 🛠️ Testing Locally

### Test for specific branch

```bash
# Set environment for testing
export ENVIRONMENT=production
export BRANCH=production

# Preview what would be released
npm run release:preview

# Generate release notes
npm run release:notes
```

---

## ⚙️ Customization

### Adjust Branch Behavior

Edit [.github/workflows/auto_release.yml](.github/workflows/auto_release.yml):

```yaml
# Only trigger for specific branches
on:
  push:
    branches:
      - main
      - staging
      - production
```

### Change Tag Prefixes

Edit the "Determine environment" step in the workflow:

```yaml
- name: Determine environment
  id: env
  run: |
    if [ "$BRANCH" = "production" ]; then
      echo "env_prefix=" >> $GITHUB_OUTPUT  # No prefix for production
    elif [ "$BRANCH" = "staging" ]; then
      echo "env_prefix=staging-" >> $GITHUB_OUTPUT
    else
      echo "env_prefix=dev-" >> $GITHUB_OUTPUT
    fi
```

---

## 💡 Best Practices

### 1. **Always Use Conventional Commits**

```bash
# ✅ Good
git commit -m "feat: add user export"
git commit -m "fix: resolve login timeout"

# ❌ Bad
git commit -m "updates"
git commit -m "bug fix"
```

### 2. **Merge Forward, Not Backward**

```
main → staging → production  ✅
production → staging → main  ❌
```

### 3. **Test Before Promoting**

- Test on `main` (local)
- Promote to `staging` and test on staging server
- Only promote to `production` when staging tests pass

### 4. **Keep Branches in Sync**

```bash
# Regularly merge main → staging
git checkout staging
git merge main

# After testing, merge staging → production
git checkout production
git merge staging
```

### 5. **Communicate with Users**

Production releases are visible to users on GitHub. Make sure:
- Commit messages are clear and user-friendly
- Breaking changes are well documented
- Release notes help users understand what changed

---

## 🎨 Release Visibility

### For End Users (Public)

- **Production releases** (v1.2.0) appear as full releases
- Users see "What's New" in your GitHub releases
- These appear in release notifications

### For Team (Internal)

- **Staging releases** (staging-v1.2.0) marked as pre-release
- **Dev releases** (dev-v1.2.0) marked as pre-release
- Not shown in default release view to public

---

## 📚 Additional Resources

- **Full Guide**: [AUTO_RELEASE_GUIDE.md](AUTO_RELEASE_GUIDE.md)
- **Commit Help**: Run `npm run commit:help`
- **Conventional Commits**: https://www.conventionalcommits.org/

---

## ❓ FAQ

### Q: Do I need to create releases for all three branches?

**A:** No! The system only creates releases when you push commits with conventional format (feat/fix/etc). If you push docs or chore commits, no release is created.

### Q: Can I have different versions on each branch?

**A:** Yes! Each branch maintains its own version independently. For example:
- main: dev-v1.3.0
- staging: staging-v1.2.5
- production: v1.2.0

### Q: What if I want to skip a release?

**A:** Add `[skip release]` or `[skip ci]` to your commit message:
```bash
git commit -m "chore: update dependencies [skip release]"
```

### Q: Can I manually create a release?

**A:** Yes! The automated system doesn't prevent manual releases. You can still create releases manually through GitHub or git tags.

---

**Happy releasing across all environments! 🚀**
