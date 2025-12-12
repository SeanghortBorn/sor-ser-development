#!/bin/bash
# Vite Asset Loading Diagnostic Script
# Run this to diagnose why assets aren't loading

echo "=== Vite Asset Loading Diagnostic ==="
echo "Date: $(date)"
echo ""

echo "1. Checking Laravel version..."
php artisan --version
echo ""

echo "2. Checking Node/NPM versions..."
node -v
npm -v
echo ""

echo "3. Checking if hot file exists..."
if [ -f public/hot ]; then
    echo "⚠️  WARNING: public/hot exists!"
    cat public/hot
    echo "   This makes Laravel look for dev server. Remove it with: rm public/hot"
else
    echo "✅ No hot file (good)"
fi
echo ""

echo "4. Checking build directory..."
if [ -d public/build ]; then
    echo "✅ public/build exists"
    ls -lh public/build/ | head -10
else
    echo "❌ public/build does NOT exist! Run: npm run build"
fi
echo ""

echo "5. Checking manifest.json..."
if [ -f public/build/manifest.json ]; then
    echo "✅ Manifest exists"
    echo "   Size: $(ls -lh public/build/manifest.json | awk '{print $5}')"
    echo "   Entry point check:"
    cat public/build/manifest.json | grep -A 5 '"resources/js/app.jsx"' | head -10
else
    echo "❌ Manifest does NOT exist!"
fi
echo ""

echo "6. Checking CSS files..."
CSS_COUNT=$(find public/build/assets/css -name "*.css" 2>/dev/null | wc -l)
if [ "$CSS_COUNT" -gt 0 ]; then
    echo "✅ Found $CSS_COUNT CSS files"
    ls -lh public/build/assets/css/*.css 2>/dev/null | head -5
else
    echo "❌ No CSS files found!"
fi
echo ""

echo "7. Checking JS files..."
JS_COUNT=$(find public/build/assets/js -name "*.js" 2>/dev/null | wc -l)
if [ "$JS_COUNT" -gt 0 ]; then
    echo "✅ Found $JS_COUNT JS files"
    ls -lh public/build/assets/js/*.js 2>/dev/null | head -5
else
    echo "❌ No JS files found!"
fi
echo ""

echo "8. Checking file permissions..."
ls -la public/build/ | head -5
echo ""

echo "9. Testing asset() helper..."
php artisan tinker --execute="echo asset('build/manifest.json');"
echo ""

echo "10. Testing web accessibility of assets..."
echo "   Checking manifest.json:"
curl -s -I http://localhost:8000/build/manifest.json | head -3
echo ""

echo "11. Checking .htaccess..."
if [ -f public/.htaccess ]; then
    echo "✅ .htaccess exists"
    echo "   Rewrite rules:"
    grep -A 2 "RewriteEngine" public/.htaccess
else
    echo "⚠️  No .htaccess file"
fi
echo ""

echo "12. Checking Laravel caches..."
php artisan cache:clear 2>&1 | grep -i "success"
php artisan config:clear 2>&1 | grep -i "success"
php artisan view:clear 2>&1 | grep -i "success"
echo ""

echo "13. Checking vite.config.js..."
if [ -f vite.config.js ]; then
    echo "✅ vite.config.js exists"
    echo "   Input configuration:"
    grep -A 2 "input:" vite.config.js | head -3
else
    echo "❌ vite.config.js NOT found!"
fi
echo ""

echo "14. Checking package.json for vite..."
echo "   laravel-vite-plugin version:"
grep "laravel-vite-plugin" package.json
echo "   vite version:"
grep '"vite"' package.json
echo ""

echo "15. Checking app.blade.php..."
if [ -f resources/views/app.blade.php ]; then
    echo "✅ app.blade.php exists"
    echo "   Vite directives:"
    grep -E "@vite|asset\(" resources/views/app.blade.php
else
    echo "❌ app.blade.php NOT found!"
fi
echo ""

echo "16. Actual HTML output test..."
echo "   Assets in HTML:"
curl -s http://localhost:8000/login 2>&1 | grep -oE '(stylesheet|script.*module)' | head -5
echo ""

echo "=== Diagnostic Complete ==="
echo ""
echo "Next steps:"
echo "1. Review output above for ❌ errors"
echo "2. Check QUICK_FIX_GUIDE.md for solutions"
echo "3. Check VITE_ASSET_ISSUE.md for detailed analysis"
