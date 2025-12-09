import { lazy, Suspense } from 'react';
import ErrorBoundary from '@/Components/ErrorBoundary';
import { ComponentLoader } from '@/Components/LoadingFallback';

/**
 * Lazy Load Utility
 *
 * Wrapper for lazy loading components with built-in error boundary and loading fallback.
 */

/**
 * Create a lazy-loaded component with error boundary and suspense
 *
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {Function} Wrapped lazy component
 */
export const lazyLoad = (importFunc, options = {}) => {
    const {
        fallback = <ComponentLoader />,
        errorFallback = null,
        retryDelay = 1000,
        maxRetries = 3,
    } = options;

    // Create retry logic for failed imports
    const retryImport = (fn, retriesLeft = maxRetries, interval = retryDelay) => {
        return new Promise((resolve, reject) => {
            fn()
                .then(resolve)
                .catch((error) => {
                    setTimeout(() => {
                        if (retriesLeft === 0) {
                            reject(error);
                            return;
                        }

                        console.log(`Retrying import... (${maxRetries - retriesLeft + 1}/${maxRetries})`);
                        retryImport(fn, retriesLeft - 1, interval).then(resolve, reject);
                    }, interval);
                });
        });
    };

    // Create lazy component with retry
    const LazyComponent = lazy(() => retryImport(importFunc));

    // Return wrapped component
    return (props) => (
        <ErrorBoundary fallback={errorFallback}>
            <Suspense fallback={fallback}>
                <LazyComponent {...props} />
            </Suspense>
        </ErrorBoundary>
    );
};

/**
 * Preload a lazy component
 *
 * @param {Function} importFunc - Dynamic import function
 * @returns {Promise} Import promise
 */
export const preload = (importFunc) => {
    return importFunc();
};

/**
 * Create a lazy-loaded route component
 *
 * @param {Function} importFunc - Dynamic import function
 * @returns {Function} Wrapped lazy component
 */
export const lazyRoute = (importFunc) => {
    return lazyLoad(importFunc, {
        fallback: <ComponentLoader type="spinner" minHeight="400px" />,
    });
};

/**
 * Create a lazy-loaded modal component
 *
 * @param {Function} importFunc - Dynamic import function
 * @returns {Function} Wrapped lazy component
 */
export const lazyModal = (importFunc) => {
    return lazyLoad(importFunc, {
        fallback: (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <ComponentLoader type="spinner" minHeight="200px" />
            </div>
        ),
    });
};

/**
 * Create multiple lazy components at once
 *
 * @param {Object} components - Object mapping component names to import functions
 * @returns {Object} Object mapping component names to lazy components
 */
export const lazyLoadBulk = (components) => {
    const result = {};

    Object.entries(components).forEach(([name, importFunc]) => {
        result[name] = lazyLoad(importFunc);
    });

    return result;
};

export default {
    lazyLoad,
    preload,
    lazyRoute,
    lazyModal,
    lazyLoadBulk,
};
