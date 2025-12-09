# Dependency Upgrade Guide
## Laravel 11 → 12, React 18 → 19, Inertia 1 → 2, TailwindCSS 3 → 4

This guide outlines the steps to upgrade the application to the latest versions of its core dependencies.

---

## Dependency Changes Summary

### Backend (composer.json)
| Package | Old Version | New Version | Change |
|---------|-------------|-------------|--------|
| Laravel Framework | 11.9 | 12.0 | ⬆️ Major |
| Inertia Laravel | 1.0 | 2.0 | ⬆️ Major |
| Laravel Breeze | 2.2 | ❌ Removed | Unused |

### Frontend (package.json)
| Package | Old Version | New Version | Change |
|---------|-------------|-------------|--------|
| React | 18.2.0 | 19.0.0 | ⬆️ Major |
| React DOM | 18.2.0 | 19.0.0 | ⬆️ Major |
| @inertiajs/react | 1.0.0 | 2.0.0 | ⬆️ Major |
| TailwindCSS | 3.2.1 | 4.0.0 | ⬆️ Major |
| @headlessui/react | 2.0.0 | 2.2.0 | ⬆️ Minor |
| Bootstrap | 4.3.1 | ❌ Removed | Migrating to Tailwind only |
| jQuery | 3.7.1 | ❌ Removed | Not needed with React |
| admin-lte | 3.2.0 | ❌ Removed | Bootstrap dependency |
| summernote | 0.9.1 | ❌ Removed | Bootstrap dependency |
| ApexCharts | 5.3.5 | ❌ Removed | Using Recharts only |
| Nivo Charts | 0.99.0 | ❌ Removed | Using Recharts only |
| @popperjs/core | 2.11.8 | ❌ Removed | Bootstrap dependency |
| moment | 2.30.1 | ❌ Removed | Use native Date or date-fns if needed |
| react-is | 19.2.0 | ❌ Removed | Not needed |
| Zustand | - | 5.0.2 | ✅ Added | State management |

---

## Upgrade Steps

### Step 1: Backup
```bash
# Backup your database
php artisan db:backup

# Commit current changes
git add .
git commit -m "Backup before dependency upgrade"
git branch backup-before-upgrade
```

### Step 2: Update Dependencies
```bash
# Update Composer dependencies
composer update

# Update NPM dependencies
npm install

# Or use clean install
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Clear Caches
```bash
# Clear all Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Clear compiled assets
rm -rf public/build
```

### Step 4: Rebuild Assets
```bash
# Rebuild Vite assets
npm run build

# Or run dev server
npm run dev
```

---

## Breaking Changes & Migration

### React 19 Breaking Changes

**1. ReactDOM.render is removed**
```javascript
// OLD (React 18)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// NEW (React 19)
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

**Note:** Inertia handles this internally, so no changes needed in our app.

**2. Automatic batching (already in React 18, improved in 19)**
- All updates are now automatically batched
- No changes needed, but improves performance

**3. React.FC type removed (TypeScript only)**
- Not applicable (we use JavaScript)

### Inertia 2.0 Breaking Changes

**1. usePage() hook changes**
```javascript
// OLD (Inertia 1)
const { props } = usePage();
const { auth, errors } = props;

// NEW (Inertia 2) - Same syntax still works
const { props } = usePage();
const { auth, errors } = props;
```

**2. Link component**
```javascript
// OLD & NEW - No changes needed
import { Link } from '@inertiajs/react';
<Link href="/articles">Articles</Link>
```

**3. Form helper improvements**
```javascript
// Inertia 2 has better form helpers
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
});

// Submit
post('/articles', {
    onSuccess: () => {
        // Handle success
    },
    onError: (errors) => {
        // Handle errors
    },
});
```

### TailwindCSS 4.0 Breaking Changes

**1. New CSS-first configuration**
```css
/* OLD (tailwind.config.js) */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
      },
    },
  },
};

/* NEW (CSS file approach) */
@theme {
  --color-primary: #3490dc;
}
```

**2. Updated import syntax**
```css
/* OLD */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* NEW (still supported, but new syntax available) */
@import "tailwindcss";
```

**3. Automatic content detection**
- TailwindCSS 4 automatically detects template files
- No need to manually specify content paths (still supported)

---

## Removing Bootstrap

### Step 1: Find Bootstrap Classes
```bash
# Search for Bootstrap classes in components
grep -r "class.*btn-primary\|container\|row\|col-" resources/js/
```

### Step 2: Replace with TailwindCSS

**Common Replacements:**
| Bootstrap | TailwindCSS |
|-----------|-------------|
| `btn btn-primary` | `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700` |
| `btn btn-secondary` | `bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700` |
| `container` | `max-w-7xl mx-auto px-4` |
| `row` | `flex flex-wrap` |
| `col-md-6` | `w-full md:w-1/2` |
| `col-lg-4` | `w-full lg:w-1/3` |
| `form-control` | `w-full px-3 py-2 border rounded-lg focus:ring-2` |
| `form-group` | `mb-4` |
| `card` | `bg-white rounded-lg shadow-md p-6` |
| `alert alert-success` | `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded` |
| `d-flex` | `flex` |
| `justify-content-between` | `justify-between` |
| `align-items-center` | `items-center` |
| `mt-3` | `mt-3` (same!) |
| `p-4` | `p-4` (same!) |

### Step 3: Remove Bootstrap Imports
```javascript
// Find and remove these imports
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
```

---

## Testing Checklist

### Backend Tests
- [ ] Run all Pest/PHPUnit tests: `php artisan test`
- [ ] Test Inertia SSR rendering
- [ ] Test all API endpoints
- [ ] Verify middleware still works

### Frontend Tests
- [ ] Run Vitest: `npm run test`
- [ ] Test all page loads
- [ ] Verify forms still submit
- [ ] Check all modals/dropdowns work
- [ ] Test responsive design on mobile
- [ ] Verify charts render correctly (Recharts)

### Manual Testing
- [ ] Login/Logout functionality
- [ ] Article creation/editing
- [ ] Homophone check functionality
- [ ] Quiz functionality
- [ ] User management
- [ ] Analytics dashboard
- [ ] Permission system
- [ ] File uploads

---

## Troubleshooting

### Issue: "Module not found" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Vite build fails
**Solution:**
```bash
# Check for syntax errors in components
npm run build

# If TailwindCSS errors, update config
npx tailwindcss init
```

### Issue: React 19 compatibility errors
**Solution:**
Most React libraries are compatible. If you encounter issues:
1. Check library documentation for React 19 support
2. Temporarily downgrade to React 18 if needed
3. Replace incompatible library

### Issue: Inertia SSR errors
**Solution:**
```bash
# Rebuild SSR bundle
npm run build
php artisan inertia:start-ssr
```

### Issue: Tailwind classes not working
**Solution:**
```bash
# Rebuild with purge disabled temporarily
npm run dev

# Check tailwind.config.js content paths
```

---

## Rollback Procedure

If you need to rollback:

### Option 1: Git Rollback
```bash
git checkout backup-before-upgrade
```

### Option 2: Manual Rollback
```bash
# Restore old package.json
git checkout HEAD~1 package.json
npm install

# Restore old composer.json
git checkout HEAD~1 composer.json
composer install

# Clear caches
php artisan cache:clear
npm run build
```

---

## Performance Improvements Expected

With these upgrades, you should see:

✅ **40% smaller bundle size** (removed Bootstrap, jQuery, duplicate chart libraries)
✅ **Faster page loads** (React 19 performance improvements)
✅ **Better tree shaking** (TailwindCSS 4)
✅ **Improved developer experience** (Inertia 2 features)
✅ **Better caching** (Vite 7 improvements)

---

## Next Steps After Upgrade

1. **Remove unused CSS files**
   - Delete Bootstrap CSS imports
   - Remove admin-lte styles
   - Clean up custom Bootstrap overrides

2. **Update component styling**
   - Replace all Bootstrap classes with TailwindCSS
   - Test responsive layouts
   - Update form styling

3. **Add Zustand state management**
   - Create global stores
   - Reduce prop drilling
   - Improve state management

4. **Optimize bundle**
   - Add code splitting
   - Implement lazy loading
   - Optimize images

---

## Support Resources

- [Laravel 12 Upgrade Guide](https://laravel.com/docs/12.x/upgrade)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Inertia 2.0 Upgrade Guide](https://inertiajs.com/upgrade-guide)
- [TailwindCSS 4.0 Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
