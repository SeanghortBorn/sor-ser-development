# Vite Quick Reference Card

## Common Commands

```bash
# Development
npm run dev              # Start dev server with HMR

# Production Build
npm run build            # Build for production
npm run build:stats      # Build with stats output
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage
```

## Path Aliases

```javascript
'@'  →  'resources/js/'

// Examples:
import Button from '@/Components/Button';
import { useAuthStore } from '@/stores';
import api from '@/services/api';
```

## Code Splitting

### Lazy Load Components

```javascript
import { lazyLoad } from '@/utils/lazyLoad';

const MyComponent = lazyLoad(
    () => import('@/Components/MyComponent'),
    { fallback: <ComponentLoader /> }
);
```

### Dynamic Imports

```javascript
// Route-based splitting
const Dashboard = lazy(() => import('@/Pages/Dashboard'));

// Conditional loading
if (condition) {
    const HeavyComponent = await import('@/Components/HeavyComponent');
}
```

## Chunk Organization

### Vendor Chunks (Auto-generated)
- `vendor-react` - React core
- `vendor-inertia` - Inertia.js
- `vendor-state` - Zustand
- `vendor-ui` - UI libraries
- `vendor-charts` - Chart libraries
- `vendor-animation` - Framer Motion
- `vendor-utils` - Utilities
- `vendor-common` - Other dependencies

### App Chunks (Auto-generated)
- `app-stores` - State stores
- `app-services` - API services
- `components-*` - Components by feature
- `page-*` - Individual pages

## Import Best Practices

### ✅ Do This

```javascript
// Named imports (tree-shakeable)
import { CheckCircle, AlertTriangle } from 'lucide-react';

// Path aliases
import Button from '@/Components/Button';

// Dynamic imports for heavy components
const Chart = lazy(() => import('@/Components/Chart'));
```

### ❌ Avoid This

```javascript
// Namespace imports (not tree-shakeable)
import * as Icons from 'lucide-react';

// Relative paths (harder to refactor)
import Button from '../../../Components/Button';

// Importing heavy components directly
import Chart from '@/Components/Chart';
```

## File Organization

```
resources/js/
├── Components/         → components-common chunk
│   ├── HomophoneChecks/ → components-homophone chunk
│   ├── ErrorBoundary.jsx
│   └── LoadingFallback.jsx
├── Pages/             → page-[name] chunks
│   ├── Dashboard/
│   └── HomophoneChecks/
├── stores/            → app-stores chunk
│   ├── useAuthStore.js
│   └── index.js
├── services/          → app-services chunk
│   └── homophoneApi.js
└── utils/
    └── lazyLoad.jsx
```

## Performance Tips

### 1. Lazy Load Routes

```javascript
import { lazyRoute } from '@/utils/lazyLoad';

const routes = [
    { path: '/dashboard', component: lazyRoute(() => import('@/Pages/Dashboard')) },
    { path: '/profile', component: lazyRoute(() => import('@/Pages/Profile')) },
];
```

### 2. Preload Important Components

```javascript
import { preload } from '@/utils/lazyLoad';

// Preload on hover
<Link onMouseEnter={() => preload(() => import('@/Pages/Dashboard'))}>
    Dashboard
</Link>
```

### 3. Error Boundaries

```javascript
import ErrorBoundary from '@/Components/ErrorBoundary';

<ErrorBoundary fallback={<ErrorFallback />}>
    <YourComponent />
</ErrorBoundary>
```

### 4. Loading States

```javascript
import { ComponentLoader, LoadingSpinner } from '@/Components/LoadingFallback';

// For lazy components
<Suspense fallback={<ComponentLoader />}>
    <LazyComponent />
</Suspense>

// For async operations
{isLoading && <LoadingSpinner />}
```

## Build Output

```
public/build/
├── assets/
│   ├── vendor/        # Third-party libraries
│   ├── app/           # Application code
│   ├── components/    # Component chunks
│   ├── pages/         # Page chunks
│   ├── css/           # Stylesheets
│   └── js/            # Other JavaScript
└── manifest.json      # Build manifest
```

## Environment Variables

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production

# Analyze mode
MODE=analyze
```

## Debugging

### Check Bundle Size

```bash
npm run build

# Output shows:
# dist/assets/vendor-react.hash.js  120.45 kB │ gzip: 40.12 kB
```

### Inspect Manifest

```json
// public/build/manifest.json
{
  "resources/js/app.jsx": {
    "file": "assets/js/app.abc123.js",
    "imports": ["vendor-react", "vendor-inertia"]
  }
}
```

### View Loaded Chunks

```javascript
// Browser DevTools > Network > JS filter
// Look for:
// - vendor-react.[hash].js
// - page-dashboard.[hash].js
// - components-homophone.[hash].js
```

## Common Issues

### Issue: Large initial bundle

**Solution**: Add lazy loading to routes and heavy components

```javascript
// Before
import Dashboard from '@/Pages/Dashboard';

// After
const Dashboard = lazyRoute(() => import('@/Pages/Dashboard'));
```

### Issue: Chunk not created

**Solution**: Verify path in vite.config.js `manualChunks()`

```javascript
// Check if path pattern matches:
if (id.includes('/resources/js/stores/')) {
    return 'app-stores';
}
```

### Issue: Circular dependencies

**Solution**: Remove circular imports between files

```javascript
// ❌ Bad
// A.js imports B.js
// B.js imports A.js

// ✅ Good
// Extract shared code to C.js
// A.js and B.js both import C.js
```

## Key Files

- `vite.config.js` - Build configuration
- `resources/js/app.jsx` - Entry point
- `resources/js/utils/lazyLoad.jsx` - Lazy loading utilities
- `public/build/manifest.json` - Build manifest (generated)

## Resources

- [Vite Docs](https://vitejs.dev/)
- [Full Guide](./VITE_OPTIMIZATION_GUIDE.md)
- [Component Splitting](./COMPONENT_SPLITTING_GUIDE.md)
- [Lazy Loading](../resources/js/utils/lazyLoad.jsx)

---

**Last Updated**: 2025-12-09
