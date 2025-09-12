import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { Head, Link } from "@inertiajs/react";
import FeaturesSection from "@/Components/Features/FeaturesSection";
import Footer from "@/Components/Footer/Footer";

export default function Home() {
    return (
        <>
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
                        <Link href="/quiz">
                            <button className="relative z-10 font-sans text-white font-semibold border-2 border-white rounded-full px-8 py-2 text-[18px] transition duration-300 ease-in-out hover:bg-white group">
                                <span className="transition duration-300 group-hover:text-gray-700">
                                    Start Practicing
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <FeaturesSection />

                {/* Tools Info Section */}
                <div className="w-full max-w-7xl mx-auto mt-12 text-center px-4">
                    <h2 className="font-sans text-gray-700 text-[32px] md:text-4xl font-semibold mb-3">
                        Two powerful tools, unlimited possibilities
                    </h2>
                    <p className="text-[18px] text-gray-400 mb-12">
                        Discover how our Sor Ser tools simplify content
                        creation, making learning more efficient and tailored to
                        your goals.
                    </p>
                </div>

                {/* Grammar Checker Section */}
                <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between py-2 mb-12 px-8">
                    <div className="flex-1 flex flex-col items-start justify-center mb-8 md:mb-0">
                        <h3 className="font-sans text-gray-700 text-[32px] font-semibold mb-2">
                            Grammar Checker
                        </h3>
                        <p className="text-gray-500 font-sans text-[18px] mb-6">
                            Save hours by instantly checking your grammar with
                            Sor Ser tools that help you efficiently improve your
                            writing.
                        </p>
                        <Link href="/grammar-check">
                            <button className="bg-blue-600 font-sans text-white font-semibold rounded-xl px-9 py-3 text-[18px] transition duration-300 hover:bg-blue-700">
                                Get Started
                            </button>
                        </Link>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <img
                            src="/icons/Home-1.webp"
                            alt="Home Icon"
                            className="w-[500px] h-[300px] rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.05]"
                        />
                    </div>
                </div>

                {/* Quiz Section */}
                <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center justify-between py-2 mb-16 px-8 mt-12">
                    {/* Text on Right */}
                    <div className="flex-1 flex flex-col items-start justify-center mb-8 md:mb-0 md:pl-8">
                        <h3 className="font-sans text-gray-700 text-[32px] font-semibold mb-2">
                            Quiz Practicing
                        </h3>
                        <p className="text-gray-500 font-sans text-[18px] mb-6">
                            Effortlessly create quizzes with AI that understands your material and evaluates answers to enhance both learning and teaching experiences.
                        </p>
                        <Link href="/quiz">
                            <button className="bg-blue-600 font-sans text-white font-semibold rounded-xl px-9 py-3 text-[18px] transition duration-300 hover:bg-blue-700">
                                Get Started
                            </button>
                        </Link>
                    </div>

                    {/* Image on Left */}
                    <div className="flex-1 flex items-center justify-center md:pr-8">
                        <img
                            src="/icons/Home-1.webp"
                            alt="Home Icon"
                            className="w-[500px] h-[300px] rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.05]"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <Footer />
        </>
    );
}
