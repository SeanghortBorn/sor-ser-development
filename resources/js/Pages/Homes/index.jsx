import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, Link } from "@inertiajs/react";
import FeaturesSection from "@/Components/Features/FeaturesSection";
import Footer from "@/Components/Footer/Footer";
import { Icon, FeatureCard } from "./FeatureCard";
import PageContainer from "@/Components/Shared/PageContainer";
import { BRAND_CONSTANTS } from "@/constants/brand";

export default function index() {
    return (
        <div className="bg-gradient-to-b from-gray-50 to-white">
            <Head title="Home" />
            <HeaderNavbar />

            {/* Hero Section */}
            <div className="min-h-screen mt-12 flex flex-col items-center justify-center">
                <PageContainer>
                    <div className="bg-blue-600 rounded-2xl w-full py-16 px-8 flex flex-col items-center text-center">
                    <h1 className="font-sans text-white text-3xl md:text-5xl font-semibold mb-3">
                        Experience a new way of learning with {BRAND_CONSTANTS.NAME.FULL}
                    </h1>
                    <h2 className="font-sans text-white text-[19px] font-normal mb-4">
                        For students, teachers and professionals
                    </h2>

                    <div className="flex gap-6">
                        <Link href="/homophone-check">
                            <button className="relative z-10 font-sans text-white font-semibold border-2 border-white rounded-full px-8 py-2 text-[18px] transition duration-300 ease-in-out hover:bg-white group">
                                <span className="transition duration-300 group-hover:text-gray-700">
                                    Start Practicing
                                </span>
                            </button>
                        </Link>
                        {/* <Link href="/quiz-practice">
                            <button className="relative z-10 font-sans text-white font-semibold border-2 border-white rounded-full px-8 py-2 text-[18px] transition duration-300 ease-in-out hover:bg-white group">
                                <span className="transition duration-300 group-hover:text-gray-700">
                                    Start Practicing
                                </span>
                            </button>
                        </Link> */}
                    </div>
                    </div>
                </PageContainer>

                {/* Features Section */}
                {/* <FeaturesSection /> */}

                {/* Features Section */}
                <PageContainer>
                    <section
                        id="features"
                        className="mb-14 w-full mt-12"
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
                                `AI-driven suggestions via ${BRAND_CONSTANTS.NAME.SHORT} model`,
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
                </PageContainer>

                {/* Learning & Social Tools */}
                <PageContainer>
                    <section className="mb-14 w-full">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            title="Adaptive Learning System"
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
                                {
                                    main: "Personalized Practice",
                                    subs: [
                                        "Spaced repetition and contextual scenarios",
                                        "Adaptive difficulty with immediate feedback",
                                        "Gamified challenges to boost engagement"
                                    ]
                                },
                                {
                                    main: "Cognitive Load Management",
                                    subs: [
                                        "Progressive complexity & focus mode",
                                        "Break reminders and micro-learning sessions",
                                        "Visual aids & pronunciation guides"
                                    ]
                                }
                            ]}
                        />
                        <FeatureCard
                            title="Social & Teacher Tools"
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
                                {
                                    main: "Community & Collaboration",
                                    subs: [
                                        "Peer review, study groups & forums",
                                        "Mentorship matching and success stories"
                                    ]
                                },
                                {
                                    main: "Teacher Dashboard",
                                    subs: [
                                        "Classroom management & assignments",
                                        "Bulk feedback and progress monitoring"
                                    ]
                                }
                            ]}
                        />
                    </div>
                    </section>
                </PageContainer>

                {/* CTA */}
                <PageContainer>
                    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-xl w-full mb-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-bold mb-3">
                                Ready to improve your Khmer writing?
                            </h3>
                            <p className="text-blue-100 leading-relaxed max-w-3xl">
                                Join our pilot program to help shape the curriculum and be among the first to experience {BRAND_CONSTANTS.NAME.SHORT}'s innovative approach to mastering homophones.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="/auth"
                                className="px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all text-center text-sm"
                            >
                                Get Started
                            </a>
                            {/* <a
                                href="/contacts"
                                className="px-4 py-2 border-2 border-gray-100 text-white rounded-xl font-semibold transition-all text-center text-sm"
                            >
                                Contact Us
                            </a> */}
                        </div>
                    </div>
                    </section>
                </PageContainer>
            </div>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}