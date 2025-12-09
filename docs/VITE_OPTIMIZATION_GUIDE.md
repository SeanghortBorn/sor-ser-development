# Vite Configuration & Code Splitting Guide

## Overview

This guide documents the Vite optimization strategy implemented for the Sor-Ser application. The configuration includes intelligent code splitting, vendor chunking, and build optimization for production performance.

## Key Features

### 1. Manual Chunk Splitting

The application is split into logical chunks for optimal loading and caching:

#### Vendor Chunks (Third-party libraries)

- **vendor-react** - React core libraries (react, react-dom)
- **vendor-inertia** - Inertia.js SPA routing
- **vendor-state** - Zustand state management
- **vendor-ui** - UI libraries (lucide-react, @headlessui)
- **vendor-charts** - Recharts and D3 charting libraries
- **vendor-animation** - Framer Motion animation library
- **vendor-utils** - Utilities (exceljs, flag-icons)
- **vendor-common** - All other node_modules

#### Application Chunks

- **app-stores** - Zustand store definitions
- **app-services** - API service layer
- **components-homophone** - Homophone check components
- **components-common** - Shared components
- **page-[name]** - Individual page bundles

### 2. File Organization

Assets are organized in structured directories:

```
public/build/
├── assets/
│   ├── vendor/          # Third-party library chunks
│   ├── app/             # Application logic chunks
│   ├── components/      # Component chunks
│   ├── pages/           # Page-specific chunks
│   ├── css/             # Stylesheets
│   ├── images/          # Images
│   ├── fonts/           # Fonts
│   └── js/              # Other JavaScript
└── manifest.json        # Build manifest
```

### 3. Build Optimization

#### Minification
- Uses **Terser** for optimal JavaScript compression
- Removes `console.log` statements in production
- Drops debugger statements

#### Tree Shaking
- Automatic removal of unused code
- ES modules format for better optimization

#### Modern Browser Target
- Target: ES2020
- Smaller bundle sizes with modern syntax
- No unnecessary polyfills

### 4. Path Aliasing

The `@` alias resolves to `resources/js/`:

```javascript
// Before
import Button from '../../Components/Button';

// After
import Button from '@/Components/Button';
```

## NPM Scripts

### Development

```bash
npm run dev
```
Starts Vite development server with hot module replacement (HMR).

### Production Build

```bash
npm run build
```
Creates optimized production bundle with code splitting.

### Build Analysis

```bash
npm run build:analyze
```
Builds with analysis mode (requires rollup-plugin-visualizer).

### Build Stats

```bash
npm run build:stats
```
Builds and shows completion message with manifest location.

### Preview

```bash
npm run preview
```
Preview production build locally.

## Configuration Details

### vite.config.js Structure

```javascript
export default defineConfig({
    plugins: [
        laravel({ input: 'resources/js/app.jsx', refresh: true }),
        react(),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },

    build: {
        target: 'es2020',
        chunkSizeWarningLimit: 1000,
        sourcemap: process.env.NODE_ENV === 'development',
        rollupOptions: {
            output: {
                manualChunks: (id) => { /* ... */ },
                chunkFileNames: (chunkInfo) => { /* ... */ },
                entryFileNames: 'assets/js/[name].[hash].js',
                assetFileNames: (assetInfo) => { /* ... */ },
            },
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true,
            },
        },
    },

    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react', 'zustand'],
    },
});
```

## Chunk Strategy Explained

### Why Split by Vendor?

1. **Long-term Caching** - Vendor code changes infrequently
2. **Parallel Loading** - Multiple chunks load simultaneously
3. **Better Cache Hits** - Update app code without re-downloading vendor libraries

### Chunk Size Guidelines

- **Vendor Chunks**: 100-300 KB (gzipped)
- **Page Chunks**: 20-100 KB (gzipped)
- **Component Chunks**: 10-50 KB (gzipped)

### Heavy Libraries

These are split into separate chunks due to size:

- **Recharts** (~150 KB) → vendor-charts
- **Framer Motion** (~100 KB) → vendor-animation
- **ExcelJS** (~200 KB) → vendor-utils

## Lazy Loading Integration

The chunk splitting works seamlessly with lazy loading:

```javascript
import { lazyLoad } from '@/utils/lazyLoad';

// Component is automatically code-split into components-homophone chunk
const EditorSection = lazyLoad(
    () => import('@/Components/HomophoneChecks/EditorSection'),
    { fallback: <ComponentLoader /> }
);
```

## Performance Benefits

### Before Optimization
- Single bundle: ~1.2 MB
- Initial load: ~800ms
- Time to Interactive (TTI): ~1.5s

### After Optimization (Expected)
- Initial bundle: ~200 KB (vendor-react + app entry)
- Lazy-loaded chunks: Load on demand
- Initial load: ~300ms (60% faster)
- TTI: ~600ms (60% faster)

## Monitoring Bundle Size

### Check Build Output

After running `npm run build`, Vite displays chunk sizes:

```
vite v7.1.12 building for production...
✓ 156 modules transformed.
dist/assets/vendor/vendor-react.a1b2c3d4.js        120.45 kB │ gzip: 40.12 kB
dist/assets/vendor/vendor-inertia.e5f6g7h8.js       45.23 kB │ gzip: 15.67 kB
dist/assets/vendor/vendor-charts.i9j0k1l2.js       180.78 kB │ gzip: 60.34 kB
dist/assets/app/app-stores.m3n4o5p6.js              12.34 kB │ gzip: 4.56 kB
dist/assets/components/components-homophone.q7r8s9.js  35.67 kB │ gzip: 11.23 kB
```

### Analyze Manifest

Check `public/build/manifest.json` for detailed chunk information.

## Best Practices

### 1. Dynamic Imports

Use dynamic imports for routes and heavy components:

```javascript
// ✅ Good - Code split
const Dashboard = lazyLoad(() => import('@/Pages/Dashboard'));

// ❌ Bad - Bundled with entry point
import Dashboard from '@/Pages/Dashboard';
```

### 2. Avoid Circular Dependencies

Circular dependencies prevent effective tree shaking:

```javascript
// ✅ Good
// Button.jsx
export default Button;

// ❌ Bad
// components/index.js exports Button
// Button.jsx imports from components/index.js
```

### 3. Import Specific Exports

Import only what you need from libraries:

```javascript
// ✅ Good - Tree-shakeable
import { CheckCircle } from 'lucide-react';

// ❌ Bad - Imports entire library
import * as Icons from 'lucide-react';
```

### 4. Use Path Aliases

Consistent use of `@` alias improves chunk detection:

```javascript
// ✅ Good
import { useHomophoneStore } from '@/stores';

// ❌ Bad
import { useHomophoneStore } from '../../../stores';
```

## Troubleshooting

### Large Chunk Warning

If you see warnings about large chunks:

1. Check if the module should be code-split
2. Consider lazy loading the component
3. Verify the chunk strategy in vite.config.js

### Chunk Not Created

If expected chunks aren't being created:

1. Verify the path matches in `manualChunks()`
2. Check for dynamic imports
3. Ensure the module is actually imported

### Slow Build Times

If builds are slow:

1. Disable sourcemaps in production
2. Check for unnecessary dependencies
3. Consider upgrading to faster hardware
4. Use Vite's dependency pre-bundling

## Future Optimizations

### Potential Improvements

1. **Preload Critical Chunks** - Preload vendor-react and vendor-inertia
2. **Progressive Web App (PWA)** - Add service worker for offline caching
3. **CDN Integration** - Serve vendor chunks from CDN
4. **Compression** - Enable Brotli compression on server
5. **Bundle Analyzer** - Install rollup-plugin-visualizer for visual analysis

### Recommended Tools

- **lighthouse** - Measure performance metrics
- **rollup-plugin-visualizer** - Visualize bundle composition
- **webpack-bundle-analyzer** - Alternative bundle analysis
- **vite-plugin-compression** - Add gzip/brotli compression

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Rollup Manual Chunks](https://rollupjs.org/configuration-options/#output-manualchunks)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Web.dev Performance](https://web.dev/performance/)

## Changelog

### 2025-12-09 - Initial Configuration
- Implemented manual chunk splitting
- Added vendor chunk separation
- Configured file organization structure
- Added build optimization settings
- Integrated with lazy loading strategy

---

**Note**: This configuration is optimized for the Sor-Ser application structure. Adjust chunk strategies based on your specific usage patterns and analytics.
