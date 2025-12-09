import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './resources/js/tests/setup.js',
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'resources/js/tests/',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
});
