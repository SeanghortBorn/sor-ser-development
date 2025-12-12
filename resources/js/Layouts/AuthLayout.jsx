import { Head } from "@inertiajs/react";
import WaveBackground from "@/Components/Animations/WaveBackground";
import AppLogo from "@/Components/Shared/AppLogo";
import { BRAND_CONSTANTS } from "@/constants/brand";

export default function AuthLayout({ title, children, showCloseButton = true }) {
    return (
        <>
            <Head title={title} />
            <WaveBackground />

            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 min-h-[600px]">
                        {/* Left Side - Branding Image & Message */}
                        <div className="hidden md:flex relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between">
                            {/* Overlay pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                    backgroundSize: '30px 30px'
                                }} />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <AppLogo size="lg" variant="white" />
                                    <div>
                                        <h1 className="text-3xl font-bold text-white">{BRAND_CONSTANTS.NAME.SHORT}</h1>
                                        <p className="text-blue-100 text-sm">{BRAND_CONSTANTS.TAGLINE.EN}</p>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                                        Master Khmer<br/>
                                        Writing with<br/>
                                        Confidence
                                    </h2>
                                    <p className="text-blue-100 text-lg leading-relaxed">
                                        Learn to identify and use Khmer homophones correctly.
                                        Improve your writing skills with interactive exercises and instant feedback.
                                    </p>
                                </div>
                            </div>

                            {/* Bottom decorative element */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 text-blue-100">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm">Trusted by students and educators</span>
                                </div>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute top-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
                            <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-300 opacity-10 rounded-full blur-3xl" />
                        </div>

                        {/* Right Side - Form */}
                        <div className="relative bg-white p-8 md:p-12 flex flex-col justify-center">
                            {/* Close button */}
                            {showCloseButton && (
                                <button
                                    type="button"
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => window.history.back()}
                                    aria-label="Close"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}

                            {/* Mobile logo */}
                            <div className="md:hidden flex items-center gap-3 mb-8">
                                <AppLogo size="md" variant="blue" />
                                <div>
                                    <h1 className="text-xl font-bold text-blue-700">{BRAND_CONSTANTS.NAME.SHORT}</h1>
                                    <p className="text-gray-500 text-xs">{BRAND_CONSTANTS.TAGLINE.EN}</p>
                                </div>
                            </div>

                            {/* Form content */}
                            <div className="w-full">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
