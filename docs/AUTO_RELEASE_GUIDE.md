# 🚀 Automatic Release System

## Overview

This project now features an **automated release management system** that automatically creates releases when you push to the `main` branch. The system uses **Conventional Commits** to determine version bumps and generates beautiful, categorized release notes.

---

## 📝 How It Works

### 1. **Commit with Conventional Commits Format**

When you make changes, use conventional commit messages:

```bash
# Features (minor version bump: 1.0.0 → 1.1.0)
git commit -m "feat: add user export functionality"
git commit -m "feat(api): add new endpoint for analytics"

# Bug Fixes (patch version bump: 1.0.0 → 1.0.1)
git commit -m "fix: resolve login authentication issue"
git commit -m "fix(ui): correct button alignment on mobile"

# Breaking Changes (major version bump: 1.0.0 → 2.0.0)
git commit -m "feat!: redesign API endpoints"
git commit -m "feat: change auth system

BREAKING CHANGE: OAuth tokens now expire after 1 hour"

# Performance Improvements (patch bump)
git commit -m "perf: optimize database queries"
git commit -m "perf(api): reduce response time by 50%"

# Refactoring (patch bump)
git commit -m "refactor: restructure component hierarchy"

# Documentation (no version bump)
git commit -m "docs: update README with new examples"

# Chore/Maintenance (no version bump)
git commit -m "chore: update dependencies"
git commit -m "test: add unit tests for auth service"
```

### 2. **Push to Main Branch**

```bash
git push origin main
```

### 3. **Automatic Release Happens** 🎉

The GitHub Action will:
1. ✅ Analyze all commits since the last release
2. ✅ Determine the appropriate version bump (major/minor/patch)
3. ✅ Generate categorized release notes
4. ✅ Update `package.json`, `version.json`, and `CHANGELOG.md`
5. ✅ Create a Git tag (e.g., `v1.2.0`)
6. ✅ Publish a GitHub Release with auto-generated notes

---

## 📋 Conventional Commits Cheat Sheet

| Type | Description | Version Bump | Example |
|------|-------------|--------------|---------|
| `feat:` | New feature | **Minor** (1.0.0 → 1.1.0) | `feat: add dark mode` |
| `fix:` | Bug fix | **Patch** (1.0.0 → 1.0.1) | `fix: resolve crash on startup` |
| `perf:` | Performance improvement | **Patch** | `perf: optimize image loading` |
| `refactor:` | Code refactoring | **Patch** | `refactor: simplify auth logic` |
| `feat!:` or `BREAKING CHANGE:` | Breaking change | **Major** (1.0.0 → 2.0.0) | `feat!: remove legacy API` |
| `docs:` | Documentation | None | `docs: update installation guide` |
| `style:` | Code style/formatting | None | `style: fix indentation` |
| `test:` | Tests | None | `test: add e2e tests` |
| `chore:` | Maintenance | None | `chore: update dependencies` |

### Scope (Optional)

Add a scope in parentheses to provide more context:

```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(ui): correct modal z-index issue"
git commit -m "perf(database): add query caching"
```

---

## 🎯 Release Examples

### Example 1: Feature Release

**Commits:**
```bash
git commit -m "feat: add CSV export for user data"
git commit -m "feat: implement real-time notifications"
git commit -m "fix: correct date formatting in reports"
```

**Result:**
- Version: `1.0.0` → `1.1.0`
- Release Title: "✨ New Features and Improvements (2 features)"
- Categories: Features (2), Bug Fixes (1)

### Example 2: Bug Fix Release

**Commits:**
```bash
git commit -m "fix: resolve memory leak in dashboard"
git commit -m "fix: correct validation error messages"
```

**Result:**
- Version: `1.1.0` → `1.1.1`
- Release Title: "🐛 Bug Fixes and Improvements (2 fixes)"
- Categories: Bug Fixes (2)

### Example 3: Breaking Change Release

**Commits:**
```bash
git commit -m "feat!: redesign authentication system"
git commit -m "feat: add new user roles

BREAKING CHANGE: Old role system is no longer supported"
```

**Result:**
- Version: `1.1.1` → `2.0.0`
- Release Title: "🚨 Major Release - Breaking Changes"
- Categories: Breaking Changes (2)

---

## 🔧 Skip Release

If you want to commit without triggering a release:

```bash
git commit -m "chore: update dev dependencies [skip release]"
git commit -m "docs: fix typo [skip ci]"
```

---

## 📊 Generated Release Notes Format

Your releases will automatically include:

```markdown
# ✨ New Features and Improvements (3 features)

**Version:** 1.2.0 | **Date:** 2024-12-13

## 📊 Summary
This release includes 5 changes: 3 features, 2 fixes.

## ✨ What's New
- **export**: Add CSV export functionality for reports ([a1b2c3d])
- **notifications**: Implement real-time push notifications ([e4f5g6h])
- **analytics**: Add user behavior tracking dashboard ([i7j8k9l])

## 🐛 Bug Fixes
- **auth**: Resolve session timeout issue ([m1n2o3p])
- **ui**: Fix responsive layout on tablet devices ([q4r5s6t])

---
**Full Changelog**: https://github.com/owner/repo/compare/v1.1.0...v1.2.0
```

---

## 🛠️ Manual Testing

You can test the scripts locally before pushing:

```bash
# Analyze commits and see what would be released
node .github/scripts/analyze_commits.js

# Preview version bump
node .github/scripts/bump_version_auto.js

# Generate release notes
node .github/scripts/generate_release_notes.js

# View generated release notes
cat RELEASE_NOTES.md
```

---

## 📁 Files Modified by Auto-Release

When a release is triggered, these files are automatically updated:

1. **`package.json`** - Version number updated
2. **`version.json`** - Production version with date stamp
3. **`CHANGELOG.md`** - New entry added at the top
4. **`README.md`** - Version badge updated (if applicable)

---

## ⚙️ Configuration

### Disable Auto-Release for Specific Paths

The workflow ignores changes to:
- `**.md` (markdown files)
- `docs/**` (documentation folder)
- `.github/workflows/**` (workflow files)

To modify this, edit [.github/workflows/auto_release.yml](.github/workflows/auto_release.yml):

```yaml
on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - 'docs/**'
      # Add more paths here
```

---

## 🎓 Best Practices

### 1. **Write Clear Commit Messages**

❌ Bad:
```bash
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "WIP"
```

✅ Good:
```bash
git commit -m "feat(auth): add OAuth2 authentication"
git commit -m "fix(api): resolve race condition in user creation"
git commit -m "perf(database): optimize query performance by 60%"
```

### 2. **Group Related Changes**

If you're working on a feature, make multiple focused commits:

```bash
git commit -m "feat(dashboard): add new widget system"
git commit -m "feat(dashboard): implement drag-and-drop for widgets"
git commit -m "test(dashboard): add widget interaction tests"
```

### 3. **Use Breaking Changes Sparingly**

Only use `BREAKING CHANGE` when:
- Removing or renaming public APIs
- Changing behavior that users depend on
- Requiring migration steps

### 4. **Document Breaking Changes**

```bash
git commit -m "feat!: upgrade authentication library

BREAKING CHANGE: Users must re-authenticate after this update.
The old token format is no longer supported.

Migration guide: See docs/migration/v2.md"
```

---

## 🚦 Workflow Status

Check the status of your releases:

1. Go to your GitHub repository
2. Click **Actions** tab
3. View **Auto Release on Main Branch** workflow
4. Each push to `main` will show up here

---

## 🐛 Troubleshooting

### Release Not Created

**Problem:** Pushed to main but no release was created.

**Solutions:**
- ✅ Check commit messages use conventional commits format
- ✅ Ensure commits are not docs/style/test only
- ✅ Verify no `[skip ci]` or `[skip release]` in commit messages
- ✅ Check GitHub Actions logs for errors

### Wrong Version Bump

**Problem:** Expected minor but got patch.

**Solutions:**
- ✅ Use `feat:` for new features (not `add:` or `new:`)
- ✅ Ensure conventional commit format is exact: `type: description`
- ✅ Check for typos in commit type

### Permissions Error

**Problem:** Workflow fails with permission denied.

**Solutions:**
- ✅ Go to Repository Settings → Actions → General
- ✅ Enable "Read and write permissions" for GITHUB_TOKEN
- ✅ Enable "Allow GitHub Actions to create and approve pull requests"

---

## 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

## 🎉 Example Workflow

Here's a complete example of the release process:

```bash
# 1. Create a new feature
git checkout -b feature/user-export

# 2. Make changes and commit with conventional commits
git add .
git commit -m "feat(export): add user data export to CSV"

# 3. Push feature branch and create PR
git push origin feature/user-export

# 4. After PR review, merge to main
# (You can merge via GitHub UI or command line)

# 5. GitHub Actions automatically:
#    - Detects "feat:" commit
#    - Bumps version: 1.5.0 → 1.6.0
#    - Generates release notes
#    - Creates tag: v1.6.0
#    - Publishes GitHub Release

# 6. Check your release at:
#    https://github.com/your-username/your-repo/releases
```

---

## 💡 Tips

- **Preview commits**: Use `git log --oneline` to review commit history
- **Amend commits**: Use `git commit --amend` to fix commit messages before pushing
- **Squash commits**: Combine multiple commits into one with meaningful message
- **Test locally**: Run analysis scripts before pushing to verify behavior

---

**Happy releasing! 🚀**
