# Quick Fix Guide - Vite Assets Not Loading

## Problem
Website loads without CSS/JS after refactoring. The @vite directive is not working.

## Quick Fixes (Try in Order)

### Fix 1: Update Laravel Vite Plugin (RECOMMENDED)
```bash
# Update to latest version
npm install -D laravel-vite-plugin@latest

# Rebuild
npm run build

# Clear caches
php artisan cache:clear && php artisan view:clear

# Restart server and test
```

### Fix 2: Simplify Vite Config
Replace your vite.config.js with this minimal version:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
```

Then in app.blade.php, use:
```blade
@vite(['resources/css/app.css', 'resources/js/app.jsx'])
```

Build and test:
```bash
npm run build
php artisan view:clear
```

### Fix 3: Create Custom Manifest Helper

Create file: `app/Helpers/ViteHelper.php`
```php
<?php

namespace App\Helpers;

class ViteHelper
{
    public static function asset($entry)
    {
        $manifestPath = public_path('build/manifest.json');
        
        if (!file_exists($manifestPath)) {
            return '';
        }
        
        $manifest = json_decode(file_get_contents($manifestPath), true);
        
        if (!isset($manifest[$entry])) {
            return '';
        }
        
        $html = '';
        $data = $manifest[$entry];
        
        // Add CSS files
        if (isset($data['css'])) {
            foreach ($data['css'] as $css) {
                $html .= sprintf(
                    '<link rel="stylesheet" href="%s">%s',
                    asset('build/' . $css),
                    "\n        "
                );
            }
        }
        
        // Add imported CSS from chunks
        if (isset($data['imports'])) {
            foreach ($data['imports'] as $import) {
                if (isset($manifest[$import]['css'])) {
                    foreach ($manifest[$import]['css'] as $css) {
                        $html .= sprintf(
                            '<link rel="stylesheet" href="%s">%s',
                            asset('build/' . $css),
                            "\n        "
                        );
                    }
                }
            }
        }
        
        // Add JS file
        $html .= sprintf(
            '<script type="module" src="%s"></script>',
            asset('build/' . $data['file'])
        );
        
        return $html;
    }
}
```

Register in `bootstrap/app.php` or `app/Providers/AppServiceProvider.php`:
```php
// In boot() method
require_once app_path('Helpers/ViteHelper.php');
```

Use in app.blade.php:
```blade
{!! \App\Helpers\ViteHelper::asset('resources/js/app.jsx') !!}
```

### Fix 4: Check for Hot File
```bash
# Remove hot file if it exists
rm -f public/hot

# Rebuild
npm run build

# Clear Laravel caches
php artisan optimize:clear
```

### Fix 5: Publish Vite Config
```bash
# Publish Vite config (if available)
php artisan vendor:publish --tag=laravel-vite-config

# Check if config/vite.php was created
# Edit if needed

# Clear caches
php artisan config:clear
```

## Verification Steps

After each fix attempt:

1. **Check build files exist:**
   ```bash
   ls -la public/build/assets/css/
   ls -la public/build/assets/js/
   ```

2. **Check HTML output:**
   ```bash
   curl -s http://localhost:8000/login | grep -E '(stylesheet|script.*module)'
   ```
   Should see `<link rel="stylesheet"` and `<script type="module"` tags

3. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab to see if CSS/JS files are loading

4. **Check for 404s:**
   ```bash
   # Check if assets are accessible
   curl -I http://localhost:8000/build/assets/css/app.[hash].css
   curl -I http://localhost:8000/build/assets/js/app.[hash].js
   ```

## If Nothing Works

Use the custom helper (Fix 3) as it directly reads from manifest and will always work regardless of @vite directive issues.

## Emergency Workaround

If you need the site working NOW, manually add to app.blade.php:

```bash
# Get current asset hashes
cat public/build/manifest.json | grep '"file"' | grep app
```

Then add to blade:
```blade
<link rel="stylesheet" href="{{ asset('build/assets/css/app.[HASH].css') }}">
<link rel="stylesheet" href="{{ asset('build/assets/css/vendor-common.[HASH].css') }}">
<script type="module" src="{{ asset('build/assets/js/app.[HASH].js') }}"></script>
```

Replace `[HASH]` with actual hash from manifest.

**Note:** This breaks on every build. Use only for emergency testing.

