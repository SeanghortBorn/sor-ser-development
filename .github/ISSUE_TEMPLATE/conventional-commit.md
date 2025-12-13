---
name: 📋 Conventional Commit Template
about: Use this template to create commits that trigger automatic releases
title: ''
labels: ''
assignees: ''
---

## Commit Message Format

Please use the conventional commits format when working on this issue:

### For Features (Minor version bump)
```bash
git commit -m "feat: add user authentication system"
git commit -m "feat(dashboard): implement new analytics widget"
```

### For Bug Fixes (Patch version bump)
```bash
git commit -m "fix: resolve login timeout issue"
git commit -m "fix(api): handle null pointer exception"
```

### For Breaking Changes (Major version bump)
```bash
git commit -m "feat!: redesign API structure"
# or
git commit -m "feat: change authentication flow

BREAKING CHANGE: Old auth tokens are no longer supported"
```

### For Other Changes (No version bump)
```bash
git commit -m "docs: update installation guide"
git commit -m "test: add unit tests for auth module"
git commit -m "chore: update dependencies"
git commit -m "refactor: simplify user service"
git commit -m "perf: optimize database queries"
```

---

## 📝 Description

<!-- Describe the issue or feature here -->

## ✅ Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 💡 Implementation Notes

<!-- Add any implementation notes or suggestions -->

## 🔗 Related Issues

<!-- Link related issues here -->
