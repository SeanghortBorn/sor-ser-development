// Production build v2
import '../css/app.css';
import './bootstrap';

// Import jQuery and make it globally available for Bootstrap and AdminLTE
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

// Import Bootstrap's and AdminLTE's JavaScript
import 'bootstrap';
import 'admin-lte';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Sor-Ser';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
// Clean rebuild 20251128_150555
// Clean rebuild 20251128_151903
// Clean rebuild 20251128_152130
// Clean rebuild 20251128_152608
// Production build 1764319536

// Build timestamp: 20251128_154740
// Force new hash
