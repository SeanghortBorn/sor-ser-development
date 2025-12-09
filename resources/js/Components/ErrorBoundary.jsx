import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI.
 * Also logs errors to error reporting service (if configured).
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Update state with error details
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1,
        }));

        // Log to error reporting service (Sentry, LogRocket, etc.)
        this.logErrorToService(error, errorInfo);
    }

    logErrorToService = (error, errorInfo) => {
        // TODO: Integrate with error reporting service
        // Example with Sentry:
        // if (window.Sentry) {
        //     window.Sentry.withScope((scope) => {
        //         scope.setExtras(errorInfo);
        //         window.Sentry.captureException(error);
        //     });
        // }

        // For now, just log to console
        console.error('Error logged:', {
            error: error.toString(),
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
        });
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        const { hasError, error, errorInfo, errorCount } = this.state;
        const { children, fallback, showDetails = false } = this.props;

        if (hasError) {
            // Custom fallback UI provided
            if (fallback) {
                return typeof fallback === 'function'
                    ? fallback(error, this.handleReset)
                    : fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={32} />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                            Oops! Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 text-center mb-6">
                            We're sorry for the inconvenience. An unexpected error occurred.
                            {errorCount > 1 && (
                                <span className="block mt-2 text-sm text-red-600">
                                    This error has occurred {errorCount} times.
                                </span>
                            )}
                        </p>

                        {/* Error Details (Development only or if showDetails is true) */}
                        {(import.meta.env.DEV || showDetails) && error && (
                            <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                    Error Details
                                </summary>
                                <div className="text-xs font-mono text-red-600 mt-2">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {error.toString()}
                                    </div>
                                    {errorInfo && (
                                        <div className="max-h-40 overflow-y-auto">
                                            <strong>Component Stack:</strong>
                                            <pre className="whitespace-pre-wrap mt-1">
                                                {errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Reload Page
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Home size={18} />
                                Go to Homepage
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="mt-6 text-xs text-gray-500 text-center">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;
