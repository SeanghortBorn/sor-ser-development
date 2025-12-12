# Vite Asset Loading Issue - Investigation Report

**Date:** 2025-12-10
**Issue:** Website showing without styles after refactoring - plain HTML only

## Problem Summary

After refactoring the project, the website loads without any CSS or JavaScript. The page displays as plain HTML with no styling or interactivity.

## Root Cause Analysis

The `@vite()` Blade directive is not outputting any HTML tags (no `<link>` or `<script>` tags). This appears to be related to Laravel 12 compatibility with laravel-vite-plugin.

## System Configuration

### Environment
- **Laravel Version:** 12.42.0
- **PHP Version:** 8.2.29
- **Node/NPM:** Check with `node -v` and `npm -v`
- **Vite Plugin:** laravel-vite-plugin ^2.0.1
- **Vite Version:** 7.2.7
- **App Environment:** local (APP_ENV=local)
- **App Debug:** true

### File Locations
- **Vite Config:** `/home/seanghortborn/projects/sor-ser-development/vite.config.js`
- **Blade Template:** `/home/seanghortborn/projects/sor-ser-development/resources/views/app.blade.php`
- **Entry Point:** `/home/seanghortborn/projects/sor-ser-development/resources/js/app.jsx`
- **CSS Entry:** `/home/seanghortborn/projects/sor-ser-development/resources/css/app.css`
- **Build Output:** `/home/seanghortborn/projects/sor-ser-development/public/build/`
- **Manifest:** `/home/seanghortborn/projects/sor-ser-development/public/build/manifest.json`

## Current Build Configuration

### vite.config.js
```javascript
export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
            buildDirectory: 'build',  // Added explicitly
        }),
        react(),
    ],
    // ... extensive chunk splitting configuration
});
```

### app.blade.php (Current - Temporary Workaround)
```blade
@routes
@viteReactRefresh

<!-- Manual asset loading (temporary workaround) -->
<link rel="stylesheet" href="{{ asset('build/assets/css/app.B0XBD5JI.css') }}">
<link rel="stylesheet" href="{{ asset('build/assets/css/vendor-common.qME2zOQR.css') }}">
<script type="module" src="{{ asset('build/assets/js/app.BGM3EigN.js') }}"></script>

@inertiaHead
```

### app.jsx (CSS Import)
```javascript
import '../css/app.css';
import './bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';
// ... other imports
```

## What We Tried

1. ✅ **Removed `public/hot` file** - This file was pointing to localhost:5173, causing Laravel to look for dev server
2. ✅ **Rebuilt assets** - `npm run build` completed successfully
3. ✅ **Cleared all Laravel caches** - config, cache, view, route caches cleared
4. ✅ **Added explicit buildDirectory** - Added `buildDirectory: 'build'` to vite.config.js
5. ✅ **Attempted to include CSS separately** - Tried `@vite(['resources/css/app.css', 'resources/js/app.jsx'])` but failed with manifest error
6. ❌ **Manual asset loading** - Added hardcoded asset paths (temporary, not working either)

## Build Output Verification

### Manifest Structure (CORRECT)
The manifest.json contains the correct entry for `resources/js/app.jsx`:
```json
{
  "resources/js/app.jsx": {
    "file": "assets/js/app.BGM3EigN.js",
    "name": "app",
    "src": "resources/js/app.jsx",
    "isEntry": true,
    "imports": [...],
    "dynamicImports": [...],
    "css": [
      "assets/css/app.B0XBD5JI.css"
    ]
  }
}
```

### Built Files (EXIST)
- ✅ `public/build/manifest.json`
- ✅ `public/build/assets/js/app.BGM3EigN.js`
- ✅ `public/build/assets/css/app.B0XBD5JI.css`
- ✅ `public/build/assets/css/vendor-common.qME2zOQR.css`
- ❌ `public/build/.vite/manifest.json` (does not exist)

### HTML Output Verification
When checking the actual HTML output from the server:
```bash
curl -s http://localhost:8000/login | grep -E '(link.*css|script.*js)'
```

**Result:** Only shows fonts and Ziggy routes script. NO app CSS or JS tags are present.

## Suspected Issues

### 1. Laravel 12 + Vite Plugin v2 Compatibility
Laravel 12 is very new (released late 2024) and may have breaking changes with laravel-vite-plugin v2.

**Check:**
- Laravel 12 might require laravel-vite-plugin v3 or higher
- Check plugin compatibility: https://github.com/laravel/vite-plugin

### 2. Missing Vite Config File
Laravel might need a published config file for proper Vite integration.

**Check:**
```bash
php artisan vendor:publish --tag=laravel-vite-config
```

### 3. Manifest Location
Some versions expect manifest at `public/build/.vite/manifest.json` instead of `public/build/manifest.json`.

### 4. Missing Service Provider
The Vite service provider might not be properly registered.

**Check:** `bootstrap/providers.php` or `config/app.php` for Vite service provider

## Potential Solutions

### Solution 1: Update laravel-vite-plugin
```bash
npm install -D laravel-vite-plugin@latest
npm run build
```

### Solution 2: Downgrade to Laravel 11
If Laravel 12 has compatibility issues, consider:
```bash
composer require laravel/framework:^11.0
```

### Solution 3: Publish and Configure Vite Config
```bash
php artisan vendor:publish --tag=laravel-vite-config
# Edit config/vite.php if created
```

### Solution 4: Check Service Provider Registration
Ensure `Illuminate\Foundation\Vite\ViteServiceProvider` is loaded.

**In Laravel 11+, check:** `bootstrap/providers.php`
```php
return [
    App\Providers\AppServiceProvider::class,
    // ... other providers
];
```

### Solution 5: Simpler Vite Config
Try a minimal vite.config.js without complex chunking:
```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
```

### Solution 6: Use @vite with Array Input
Update app.blade.php:
```blade
@vite(['resources/css/app.css', 'resources/js/app.jsx'])
```

And update vite.config.js to include CSS as separate input:
```javascript
laravel({
    input: ['resources/css/app.css', 'resources/js/app.jsx'],
    refresh: true,
}),
```

### Solution 7: Create Helper Script
Create a script to automatically update asset hashes in blade template after each build.

## Debugging Commands

```bash
# Check if hot file exists
ls -la public/hot

# Verify build files
ls -la public/build/assets/js/
ls -la public/build/assets/css/

# Check manifest content
cat public/build/manifest.json | jq '.["resources/js/app.jsx"]'

# Test actual HTML output
curl -s http://localhost:8000/login | grep -E '(link.*css|script.*js)'

# Check PHP artisan Vite command (if available)
php artisan vite:list  # May not exist in all versions

# Clear all caches
php artisan cache:clear && php artisan config:clear && php artisan view:clear && php artisan route:clear

# Rebuild assets
npm run build

# Check for errors in Laravel logs
tail -50 storage/logs/laravel.log
```

## Workaround (Current State)

### Temporary Manual Loading
The blade template currently has hardcoded asset paths:
```blade
<link rel="stylesheet" href="{{ asset('build/assets/css/app.B0XBD5JI.css') }}">
<link rel="stylesheet" href="{{ asset('build/assets/css/vendor-common.qME2zOQR.css') }}">
<script type="module" src="{{ asset('build/assets/js/app.BGM3EigN.js') }}"></script>
```

**Problem:** These hashes change with every build, requiring manual updates.

### Better Workaround: Read from Manifest
Create a helper function to read from manifest:
```php
// In app/helpers.php or service provider
function vite_asset($entry) {
    $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
    
    if (!isset($manifest[$entry])) {
        return '';
    }
    
    $html = '';
    $data = $manifest[$entry];
    
    // Add CSS files
    if (isset($data['css'])) {
        foreach ($data['css'] as $css) {
            $html .= '<link rel="stylesheet" href="' . asset('build/' . $css) . '">' . "\n";
        }
    }
    
    // Add JS file
    $html .= '<script type="module" src="' . asset('build/' . $data['file']) . '"></script>';
    
    return $html;
}
```

Then in blade:
```blade
{!! vite_asset('resources/js/app.jsx') !!}
```

## Next Steps

1. **Check Laravel/Vite compatibility**
   - Visit: https://github.com/laravel/vite-plugin
   - Check if Laravel 12 requires specific plugin version

2. **Try minimal vite.config.js**
   - Simplify configuration to rule out chunking issues

3. **Check for missing dependencies**
   - `npm list laravel-vite-plugin`
   - `npm audit`

4. **Test with fresh Laravel 12 install**
   - Create a new Laravel 12 project
   - Compare vite setup with current project

5. **Consider creating custom helper**
   - Implement manifest reader as shown above
   - This ensures assets load correctly regardless of @vite directive

## Files to Review

1. `/home/seanghortborn/projects/sor-ser-development/vite.config.js`
2. `/home/seanghortborn/projects/sor-ser-development/resources/views/app.blade.php`
3. `/home/seanghortborn/projects/sor-ser-development/resources/js/app.jsx`
4. `/home/seanghortborn/projects/sor-ser-development/package.json`
5. `/home/seanghortborn/projects/sor-ser-development/composer.json`
6. `/home/seanghortborn/projects/sor-ser-development/bootstrap/providers.php` (Laravel 11+)
7. `/home/seanghortborn/projects/sor-ser-development/config/vite.php` (if exists)

## References

- Laravel Vite Documentation: https://laravel.com/docs/12.x/vite
- Laravel Vite Plugin GitHub: https://github.com/laravel/vite-plugin
- Vite Documentation: https://vitejs.dev/guide/
- Laravel 12 Release Notes: https://laravel.com/docs/12.x/releases

---

**Generated:** 2025-12-10
**Last Updated:** 2025-12-10
