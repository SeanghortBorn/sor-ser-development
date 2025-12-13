import React from "react";
import { Brain, Zap, Rocket } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { BRAND_CONSTANTS } from "@/constants/brand";
import PageContainer from "@/Components/Shared/PageContainer";

export default function HomophoneCheck() {
    const { auth } = usePage().props;
    return (
        <PageContainer className="pt-6 pb-8">
            {auth.user ? (
                <>
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-600">
                            Master your Khmer word usage with {" "}
                            <span className="text-blue-500 font-semibold">
                                {BRAND_CONSTANTS.NAME.SHORT}
                            </span>
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-6xl mx-auto">
                            Your smart assistant that helps you avoid repeated mistakes, choose the correct homophones, and develop clearer, more confident Khmer writing.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    {/* Header Section */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-600">
                            Triple your productivity with the{" "}
                            <span className="text-blue-500 font-semibold">
                                Homophone Checker
                            </span>
                        </h1>
                        <p className="text-gray-600 mt-4 max-w-6xl mx-auto">
                            SorSer's Homophone Checker uses AI to instantly fix
                            grammar, spelling, and punctuation mistakes. Start
                            typing, and the AI will detect and correct errors in
                            real time, making your writing clear, accurate, and
                            polished.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* AI at Every Step */}
                        <div className="bg-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 mb-3">
                                <Brain className="text-pink-500" size={28} />
                                <h2 className="text-xl font-semibold text-gray-600">
                                    How To Use SorSer Tool
                                </h2>
                            </div>

                            <p className="text-gray-600 mb-4">
                                SorSer's AI helps you write better by detecting
                                and fixing grammar, spelling, and punctuation
                                mistakes as you type. It works in real time, so
                                you can focus on your ideas while the AI takes
                                care of corrections.
                            </p>

                            <div className="bg-white border rounded-2xl p-3 shadow-sm">
                                <p className="text-gray-500 text-sm font-medium">
                                    Sample Grammar Checker
                                </p>

                                <div className="mt-1 p-3 rounded-2xl border border-gray-200">
                                    <p className="font-medium text-gray-800 mb-1">
                                        Typing Your Sentence:
                                    </p>
                                    <div className="text-gray-600 text-sm mb-2">
                                        What key difference distinguishes
                                        isotopes from one another?
                                    </div>

                                    <ul className="mt-2 text-sm text-gray-700 space-y-2">
                                        <li>
                                            •{" "}
                                            <span className="underline decoration-red-500 decoration-2 underline-offset-4">
                                                She go
                                            </span>{" "}
                                            to the office every morning.
                                        </li>
                                        <li>
                                            •{" "}
                                            <span className="underline decoration-green-500 decoration-2 underline-offset-4">
                                                She <strong>goes</strong>
                                            </span>{" "}
                                            to the office every morning.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right side features */}
                        <div className="space-y-4">
                            {/* Lightning Fast */}
                            <div className="bg-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <Zap
                                        className="text-orange-500"
                                        size={28}
                                    />
                                    <h2 className="text-xl font-semibold text-gray-600">
                                        Lightning Fast
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    Boost your writing speed with AI-powered
                                    grammar checking that instantly detects and
                                    fixes errors. SorSer helps you turn rough
                                    drafts into clear, polished text in seconds
                                    — no extra effort required
                                </p>
                            </div>

                            {/* Features for Everyone */}
                            <div className="bg-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <Rocket
                                        className="text-pink-500"
                                        size={28}
                                    />
                                    <h2 className="text-xl font-semibold text-gray-600">
                                        Features for Everyone
                                    </h2>
                                </div>
                                <p className="text-gray-600">
                                    Whether you're a student, teacher, or
                                    professional, SorSer makes writing easier
                                    and more accurate.{" "}
                                    <span className="text-blue-600 cursor-pointer hover:underline transition-all duration-200 ease-in-out hover:scale-105">
                                        Try it out
                                    </span>{" "}
                                    to experience real-time grammar, spelling,
                                    and punctuation checking that helps you
                                    write with confidence.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </PageContainer>
    );
}
