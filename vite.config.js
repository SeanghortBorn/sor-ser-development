// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: 'resources/js/app.jsx',
//             refresh: true,
//             buildDirectory: 'build',
//         }),
//         react(),
//     ],

//     resolve: {
//         alias: {
//             '@': path.resolve(__dirname, './resources/js'),
//         },
//     },

//     build: {
//         // Target modern browsers for better optimization
//         target: 'es2020',

//         // Increase chunk size warning limit (default is 500kb)
//         chunkSizeWarningLimit: 1000,

//         // Generate sourcemaps for production debugging
//         sourcemap: process.env.NODE_ENV === 'development',

//         rollupOptions: {
//             output: {
//                 // Manual chunk splitting strategy
//                 manualChunks: (id) => {
//                     // Vendor chunks - Split large libraries into separate chunks

//                     // React & React DOM - Keep with vendor-common to ensure proper loading order
//                     // if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
//                     //     return 'vendor-react';
//                     // }

//                     // Inertia - SPA routing
//                     if (id.includes('node_modules/@inertiajs')) {
//                         return 'vendor-inertia';
//                     }

//                     // State Management - Zustand
//                     if (id.includes('node_modules/zustand')) {
//                         return 'vendor-state';
//                     }

//                     // UI Libraries - Lucide Icons, Headless UI - Keep with vendor-common to avoid dependency issues
//                     // if (id.includes('node_modules/lucide-react') ||
//                     //     id.includes('node_modules/@headlessui')) {
//                     //     return 'vendor-ui';
//                     // }

//                     // Charts - Recharts (heavy library) - Keep with vendor-common to avoid dependency issues
//                     // if (id.includes('node_modules/recharts') ||
//                     //     id.includes('node_modules/d3-')) {
//                     //     return 'vendor-charts';
//                     // }

//                     // Animation - Framer Motion (heavy library)
//                     if (id.includes('node_modules/framer-motion')) {
//                         return 'vendor-animation';
//                     }

//                     // Utilities - ExcelJS, Flag Icons
//                     if (id.includes('node_modules/exceljs') ||
//                         id.includes('node_modules/flag-icons')) {
//                         return 'vendor-utils';
//                     }

//                     // All other node_modules
//                     if (id.includes('node_modules')) {
//                         return 'vendor-common';
//                     }

//                     // Application code chunks

//                     // Store management
//                     if (id.includes('/resources/js/stores/')) {
//                         return 'app-stores';
//                     }

//                     // API services
//                     if (id.includes('/resources/js/services/')) {
//                         return 'app-services';
//                     }

//                     // Components - Split by feature
//                     if (id.includes('/resources/js/Components/HomophoneChecks/')) {
//                         return 'components-homophone';
//                     }

//                     if (id.includes('/resources/js/Components/')) {
//                         return 'components-common';
//                     }

//                     // Pages - Each page can be lazy loaded
//                     if (id.includes('/resources/js/Pages/')) {
//                         // Extract page name for better caching
//                         const match = id.match(/\/Pages\/([^/]+)\//);
//                         if (match) {
//                             return `page-${match[1].toLowerCase()}`;
//                         }
//                         return 'pages';
//                     }
//                 },

//                 // Naming pattern for chunks
//                 chunkFileNames: (chunkInfo) => {
//                     const name = chunkInfo.name;

//                     // Vendor chunks
//                     if (name.startsWith('vendor-')) {
//                         return 'assets/vendor/[name].[hash].js';
//                     }

//                     // Application chunks
//                     if (name.startsWith('app-')) {
//                         return 'assets/app/[name].[hash].js';
//                     }

//                     // Component chunks
//                     if (name.startsWith('components-')) {
//                         return 'assets/components/[name].[hash].js';
//                     }

//                     // Page chunks
//                     if (name.startsWith('page-')) {
//                         return 'assets/pages/[name].[hash].js';
//                     }

//                     // Default
//                     return 'assets/js/[name].[hash].js';
//                 },

//                 // Entry file naming
//                 entryFileNames: 'assets/js/[name].[hash].js',

//                 // Asset file naming (CSS, images, fonts)
//                 assetFileNames: (assetInfo) => {
//                     const info = assetInfo.name.split('.');
//                     const ext = info[info.length - 1];

//                     // CSS files
//                     if (/css/i.test(ext)) {
//                         return 'assets/css/[name].[hash].[ext]';
//                     }

//                     // Images
//                     if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
//                         return 'assets/images/[name].[hash].[ext]';
//                     }

//                     // Fonts
//                     if (/woff2?|eot|ttf|otf/i.test(ext)) {
//                         return 'assets/fonts/[name].[hash].[ext]';
//                     }

//                     // Default
//                     return 'assets/[name].[hash].[ext]';
//                 },
//             },
//         },

//         // Minification options
//         minify: 'terser',
//         terserOptions: {
//             compress: {
//                 // Remove console.log in production
//                 drop_console: process.env.NODE_ENV === 'production',
//                 drop_debugger: true,
//             },
//         },
//     },

//     // Optimize dependencies
//     optimizeDeps: {
//         include: [
//             'react',
//             'react-dom',
//             '@inertiajs/react',
//             'zustand',
//             'recharts',
//         ],
//     },

//     // Server configuration
//     server: {
//         hmr: {
//             host: 'localhost',
//         },
//     },
// });


import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Simplified Vite Configuration for Laravel 12
 * 
 * This is a clean, minimal config that should work with Laravel 12.
 * If you were using complex chunk splitting before, this simplifies it.
 * 
 * To use:
 * 1. Backup your current vite.config.js
 * 2. Replace it with this file
 * 3. Run: npm run build
 * 4. Clear caches: php artisan view:clear
 */

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            buildDirectory: 'build',
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        target: 'es2020',
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Only split out truly independent utilities that don't depend on React
                    // ExcelJS and flag-icons are standalone libraries
                    if (id.includes('node_modules/exceljs') || id.includes('node_modules/flag-icons')) {
                        return 'vendor-utils';
                    }
                    // All node_modules (including React, Recharts, Inertia, etc.) stay in vendor-common
                    // This ensures proper dependency resolution and loading order
                    if (id.includes('node_modules')) {
                        return 'vendor-common';
                    }
                    // Application code chunks
                    // Stores
                    if (id.includes('/resources/js/stores/')) {
                        return 'app-stores';
                    }
                    // Services
                    if (id.includes('/resources/js/services/')) {
                        return 'app-services';
                    }
                    // Homophone components
                    if (id.includes('/resources/js/Components/HomophoneChecks/')) {
                        return 'components-homophone';
                    }
                    // Other components
                    if (id.includes('/resources/js/Components/')) {
                        return 'components-common';
                    }
                    // Pages - per feature (these are lazy-loaded)
                    if (id.includes('/resources/js/Pages/')) {
                        const match = id.match(/\/Pages\/([^/]+)\//);
                        if (match) {
                            return `page-${match[1].toLowerCase()}`;
                        }
                        return 'pages';
                    }
                },
                chunkFileNames: (chunkInfo) => {
                    const name = chunkInfo.name;
                    if (name.startsWith('vendor-')) return 'assets/vendor/[name].[hash].js';
                    if (name.startsWith('app-')) return 'assets/app/[name].[hash].js';
                    if (name.startsWith('components-')) return 'assets/components/[name].[hash].js';
                    if (name.startsWith('page-')) return 'assets/pages/[name].[hash].js';
                    return 'assets/js/[name].[hash].js';
                },
                entryFileNames: 'assets/js/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    const ext = assetInfo.name.split('.').pop();
                    if (/css/i.test(ext)) return 'assets/css/[name].[hash].[ext]';
                    if (/png|jpe?g|svg|gif|webp|ico/i.test(ext)) return 'assets/images/[name].[hash].[ext]';
                    if (/woff2?|eot|ttf|otf/i.test(ext)) return 'assets/fonts/[name].[hash].[ext]';
                    return 'assets/[name].[hash].[ext]';
                },
            },
        },
    },
});