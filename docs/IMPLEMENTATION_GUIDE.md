# Implementation Guide - Fix Asset Loading

This guide shows you exactly how to implement the custom Vite manifest helper.

## Step 1: Create Helper Directory

```bash
mkdir -p app/Helpers
```

## Step 2: Move Helper File

```bash
# The ViteManifestHelper.php file is in your project root
mv ViteManifestHelper.php app/Helpers/
```

## Step 3: Register Helper

Edit `app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Add this line
        if (file_exists(app_path('Helpers/ViteManifestHelper.php'))) {
            require_once app_path('Helpers/ViteManifestHelper.php');
        }
    }
}
```

## Step 4: Update Blade Template

Edit `resources/views/app.blade.php`:

**Replace this:**
```blade
<!-- Manual asset loading (temporary workaround) -->
<link rel="stylesheet" href="{{ asset('build/assets/css/app.B0XBD5JI.css') }}">
<link rel="stylesheet" href="{{ asset('build/assets/css/vendor-common.qME2zOQR.css') }}">
<script type="module" src="{{ asset('build/assets/js/app.BGM3EigN.js') }}"></script>
```

**With this:**
```blade
{!! \App\Helpers\ViteManifestHelper::assets('resources/js/app.jsx') !!}
```

Full context:
```blade
<!-- Scripts -->
@routes
@viteReactRefresh

{!! \App\Helpers\ViteManifestHelper::assets('resources/js/app.jsx') !!}

@inertiaHead
```

## Step 5: Clear Caches

```bash
php artisan view:clear
php artisan cache:clear
```

## Step 6: Test

1. Refresh your browser
2. Check browser console (F12) for errors
3. Check Network tab to verify CSS/JS files load

## Verification

After implementation:

```bash
# Check helper is loaded
php artisan tinker
>>> class_exists('\App\Helpers\ViteManifestHelper')
# Should return: true

# Test helper output
>>> echo \App\Helpers\ViteManifestHelper::assets('resources/js/app.jsx');
# Should output: HTML with <link> and <script> tags

>>> exit
```

## Troubleshooting

### Error: "Class not found"
- Check file is at: `app/Helpers/ViteManifestHelper.php`
- Check you added require_once in AppServiceProvider
- Clear config cache: `php artisan config:clear`

### Error: "Manifest not found"
- Run: `npm run build`
- Check: `public/build/manifest.json` exists

### Error: "Entry not found in manifest"
- Check exact entry name in manifest.json
- Default should be: `resources/js/app.jsx`
- Check case sensitivity

### Assets still not loading
1. Check browser console for errors
2. Check Network tab - are files 404?
3. Verify URLs are correct
4. Check file permissions on public/build
5. Test with: `curl -I http://localhost:8000/build/manifest.json`

## Benefits of This Approach

✅ Works regardless of @vite directive issues
✅ Automatically handles CSS from all chunks
✅ Handles file hash changes on rebuild
✅ Adds proper modulepreload for performance
✅ No manual updates needed after builds
✅ Easy to debug and customize

## Alternative: Simpler Version

If you just need basic functionality, use this in blade:

```php
@php
$manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
$entry = $manifest['resources/js/app.jsx'];
@endphp

@foreach($entry['css'] ?? [] as $css)
<link rel="stylesheet" href="{{ asset('build/' . $css) }}">
@endforeach

<script type="module" src="{{ asset('build/' . $entry['file']) }}"></script>
```

## After Fix Works

Once assets load correctly, you can:
1. Keep using the helper (recommended)
2. Try fixing @vite directive by updating laravel-vite-plugin
3. Simplify vite.config.js
4. Test with fresh Laravel install to compare

## Next Steps

1. Implement this helper
2. Verify assets load
3. Then investigate why @vite failed
4. Update documentation once root cause found
