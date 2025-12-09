# Sor-Ser Web App — Developer Instructions

> **Note:** This document is for developers only. It contains setup, versioning, and project management instructions. Do **not** expose publicly.

Store this file in your repository at: `docs/developer_guide.md` or `resources/docs/developer_guide.md`.

---

# Table of Contents

1. Setup Environment
2. Database Migration & Seeders
3. Running the Project
4. Clearing Cache & Config
5. Queue Worker
6. Laravel Code Commands
7. Versioning & Release Instructions
8. Common Fixes / Errors
9. Notes for React / Quill Integration

---

## 1. Setup Environment

```bash
# Step 01: Install PHP dependencies
composer install

# Step 02: Install Node dependencies
npm install
```

---

## 2. Database Migration & Seeders

```bash
# Step 03: Add new table or column
php artisan migrate

# Step 04: Run Seeders
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=UserSeeder

# JWT secret key (if using JWT authentication)
php artisan jwt:secret
```

### Delete Data

```bash
# Delete all tables and reset
php artisan migrate:refresh

# Delete a specific table (replace path)
php artisan migrate:refresh --path="database/migrations/2025_xx_xx_create_table.php"
```

---

## 3. Running the Project

```bash
# Run Laravel server
php artisan serve

# Run frontend (Vite / React)
npm run dev
```

### If you get encryption key error:

```bash
php artisan key:generate
```

---

## 4. Clear Cache & Config

```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan route:cache
php artisan config:cache
```

---

## 5. Queue Worker

```bash
php artisan queue:work
```

---

## 6. Laravel Code Commands

```bash
# Create model, migration, controller, resource
php artisan make:model YourModelName -mcr
```

---

## 7. Versioning & Release Instructions (Developers Only)

### Environment Versions

* **LOCAL:** `LOCAL-1.x.x.YYYYMMDD` (for local development)
* **STAGING:** `STAGING-1.x.x.YYYYMMDD` (for testing server)
* **PRODUCTION:** `1.x.x.YYYYMMDD` (public release)

### Local Version Update

```bash
php artisan version:local "Short description of changes"
```

### Staging Version Update

```bash
php artisan version:staging "Short description for staging"
```

### Production Release

1. Merge `staging` → `production`
2. Commit with bump type in message:

   * `[patch]` for bug fixes (default)
   * `[minor]` for new features
   * `[major]` for breaking changes

Example:

```bash
git checkout production
git merge staging -m "Release: updated Khmer NLP [minor]"
git push origin production
```

* GitHub Action will automatically bump version, update README, CHANGELOG, and create GitHub Release.

---

## 8. Common Fixes / Errors

```bash
# 500 error: create storage directories
mkdir -p storage/framework/views
mkdir -p storage/framework/cache/data
```

---

## 9. React / Quill Notes

```bash
# Install Quill for React
npm install react-quill

# Link storage to public for files/audio
php artisan storage:link
```

---

> Keep this guide up-to-date whenever new commands, versioning practices, or environment steps are introduced. This file is **developer-only**; public release notes go to the main README or CHANGELOG.md.
