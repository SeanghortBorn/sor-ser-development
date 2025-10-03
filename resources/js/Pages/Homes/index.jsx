import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, Link } from "@inertiajs/react";
import FeaturesSection from "@/Components/Features/FeaturesSection";
import Footer from "@/Components/Footer/Footer";
import { Icon, FeatureCard } from "./FeatureCard";

export default function index() {
    return (
        <div className=" bg-gradient-to-b from-gray-50 to-white">
            <Head title="Home" />
            <HeaderNavbar />

            {/* Hero Section */}
            <div className="min-h-screen mt-12 flex flex-col items-center justify-center">
                <div className="bg-blue-600 rounded-2xl w-full max-w-7xl mx-auto py-16 px-8 flex flex-col items-center text-center">
                    <h1 className="font-sans text-white text-3xl md:text-5xl font-semibold mb-3">
                        Experience a new way of learning <br /> with Khmer Sor
                        Ser
                    </h1>
                    <h2 className="font-sans text-white text-[19px] font-normal mb-4">
                        For students, teachers and professionals
                    </h2>

                    <div className="flex gap-6">
                        <Link href="/grammar-check">
                            <button className="relative z-10 font-sans text-white font-semibold border-2 border-white rounded-full px-8 py-2 text-[18px] transition duration-300 ease-in-out hover:bg-white group">
                                <span className="transition duration-300 group-hover:text-gray-700">
                                    Grammar Check
                                </span>
                            </button>
                        </Link>
                        <Link href="/quiz-practice">
                            <button className="relative z-10 font-sans text-white font-semibold border-2 border-white rounded-full px-8 py-2 text-[18px] transition duration-300 ease-in-out hover:bg-white group">
                                <span className="transition duration-300 group-hover:text-gray-700">
                                    Start Practicing
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                {/* <FeaturesSection /> */}

                {/* Features Section */}
                <section
                    id="features"
                    className="mb-14 w-full max-w-7xl mx-auto mt-12"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Platform Features
                        </h2>
                        <p className="text-gray-500 font-medium text-md max-w-3xl mx-auto">
                            Everything you need to master Khmer homophones and
                            improve your writing
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            title="Core Writing Tools"
                            icon={
                                <Icon>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </Icon>
                            }
                            bullets={[
                                "Real-time homophone correction with confidence scoring",
                                "Contextual suggestions & multiple correction options",
                                "Voice-to-text with homophone-aware dictation",
                                "Document templates & word choice enhancement",
                            ]}
                        />
                        <FeatureCard
                            title="Writing Assistant"
                            icon={
                                <Icon>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </Icon>
                            }
                            bullets={[
                                "Grammar & style suggestions",
                                "Readability analysis & tone detection",
                                "AI-driven suggestions via Sor-Ser model",
                            ]}
                        />
                        <FeatureCard
                            title="Learning Analytics"
                            icon={
                                <Icon>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </Icon>
                            }
                            bullets={[
                                "Error pattern visualization and heatmaps",
                                "Weekly/Monthly reports and exportable CSV/PDF",
                                "Comparative analytics against peer group",
                            ]}
                        />
                    </div>
                </section>

                {/* Learning & Social Tools */}
                <section className="mb-14 w-full max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Adaptive Learning System
                            </h3>
                            <div className="space-y-4 ml-1">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                                        Personalized Practice
                                    </h4>
                                    <ul className="space-y-2 text-gray-500 text-base font-medium ml-4">
                                        <li>
                                            • Spaced repetition and contextual
                                            scenarios
                                        </li>
                                        <li>
                                            • Adaptive difficulty with immediate
                                            feedback
                                        </li>
                                        <li>
                                            • Gamified challenges to boost
                                            engagement
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
                                        Cognitive Load Management
                                    </h4>
                                    <ul className="space-y-2 text-gray-500 text-base font-medium ml-4">
                                        <li>
                                            • Progressive complexity & focus
                                            mode
                                        </li>
                                        <li>
                                            • Break reminders and micro-learning
                                            sessions
                                        </li>
                                        <li>
                                            • Visual aids & pronunciation guides
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Social & Teacher Tools
                            </h3>
                            <div className="space-y-4 ml-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
                                        Community & Collaboration
                                    </h4>
                                    <ul className="space-y-2 text-gray-500 text-base font-medium ml-4">
                                        <li>
                                            • Peer review, study groups & forums
                                        </li>
                                        <li>
                                            • Mentorship matching and success
                                            stories
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-1" />
                                        Teacher Dashboard
                                    </h4>
                                    <ul className="space-y-2 text-gray-500 text-base font-medium ml-4">
                                        <li>
                                            • Classroom management & assignments
                                        </li>
                                        <li>
                                            • Bulk feedback and progress
                                            monitoring
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-xl w-full max-w-7xl mx-auto mb-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-bold mb-3">
                                Ready to improve your Khmer writing?
                            </h3>
                            <p className="text-blue-100 leading-relaxed max-w-3xl">
                                Join our pilot program to help shape the
                                curriculum and be among the first to experience
                                Sor-Ser's innovative approach to mastering
                                homophones.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="/register"
                                className="px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all text-center text-sm"
                            >
                                Get Started
                            </a>
                            <a
                                href="/contact"
                                className="px-4 py-2 border-2 border-gray-100 text-white rounded-xl font-semibold transition-all text-center text-sm"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}