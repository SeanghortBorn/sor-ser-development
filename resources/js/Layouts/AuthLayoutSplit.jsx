import React from 'react';
import Brand from '@/Components/Shared/Brand';

/**
 * AuthLayoutSplit Component
 * 
 * Split layout authentication page with:
 * - Left side: Branding, images, and value proposition
 * - Right side: Authentication forms
 */
export default function AuthLayoutSplit({ children, image = null, brandTitle = null, brandSubtitle = null, brandMessage = null }) {
    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Left Side - Branding & Image */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-5 rounded-full"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-5 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Logo/Brand */}
                    <div className="mb-16">
                        <Brand logoSize="md" logoVariant="white" textVariant="full" textColor="white" textSize="md" />
                    </div>

                    {/* Main Message */}
                    <div className="space-y-6">
                        <h2 className="text-white text-3xl font-bold leading-tight">
                            {brandMessage?.title || 'Master Khmer Writing'}
                        </h2>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            {brandMessage?.description || 'Improve your Khmer writing skills with interactive exercises, real-time feedback, and personalized learning paths.'}
                        </p>

                        {/* Features List */}
                        <div className="pt-8 space-y-4">
                            {(brandMessage?.features || [
                                { icon: '✓', text: 'Interactive homophone checker' },
                                { icon: '✓', text: 'Real-time grammar feedback' },
                                { icon: '✓', text: 'Personalized learning path' },
                                { icon: '✓', text: 'Track your progress' }
                            ]).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="text-xl text-white font-bold">{feature.icon}</span>
                                    <span className="text-blue-50">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom - Statistics or Quote */}
                <div className="relative z-10 pt-12 border-t border-white border-opacity-20">
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <div className="text-3xl font-bold text-white">10K+</div>
                            <div className="text-blue-100 text-sm mt-1">Active Users</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">500+</div>
                            <div className="text-blue-100 text-sm mt-1">Lessons</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">98%</div>
                            <div className="text-blue-100 text-sm mt-1">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Authentication Forms */}
            <div className="w-full md:w-1/2 flex flex-col bg-white overflow-y-auto">
                {/* Mobile Branding */}
                <div className="md:hidden px-8 pt-8 pb-4">
                    <Brand logoSize="sm" logoVariant="blue" textVariant="short" textColor="blue" textSize="sm" />
                </div>

                {/* Forms Container */}
                <div className="flex flex-col justify-center items-center flex-1 p-8 sm:p-12 min-h-full">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
