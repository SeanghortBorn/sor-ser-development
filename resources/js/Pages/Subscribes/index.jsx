import HeaderNavbar from "@/Components/Navbars/HeaderNavbar";
import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import Footer from "@/Components/Footer/Footer";

export default function index() {
    const [billing, setBilling] = useState("annual");
    return (
        <>
            <Head title="Our Plans" />
            <HeaderNavbar />

            <div className="bg-[#f7f8fa] min-h-screen flex flex-col items-center py-12 px-4">
                <h1 className="text-3xl md:text-4xl font-semibold text-center text-[#1d1d4f] mb-3">
                    Enhance Your Learning with Our AI-Powered Plans
                </h1>
                <p className="text-gray-500 text-center mb-7 max-w-2xl">
                    Compare our products and discover the benefits of our
                    all-in-one package.
                </p>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                    {/* Basic Plan */}
                    <div className="bg-white rounded-xl shadow-sm border-gray-100 p-8 flex flex-col">
                        <h2 className="text-xl font-bold text-purple-600 transition-all duration-200 ease-in-out hover:scale-105">
                            Basic
                        </h2>
                        <p className="text-3xl font-extrabold mt-2">
                            $0{" "}
                            <span className="text-lg font-medium text-gray-500">
                                / month
                            </span>
                        </p>
                        <p className="text-gray-500 text-sm">
                            No subscription required
                        </p>

                        <ul className="space-y-3 flex-1">
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-purple-500 transition-all duration-200 ease-in-out hover:scale-105">✔</span>
                                <span>Unlimited Non-AI Flashcards</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-purple-500 transition-all duration-200 ease-in-out hover:scale-105">✔</span>
                                <span>25 Exam Mode Answers</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-purple-500 transition-all duration-200 ease-in-out hover:scale-105">✔</span>
                                <span>25,000 Characters per Text Upload</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <span className="text-gray-300">✖</span>
                                <span>No Document Uploading</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <span className="text-gray-300">✖</span>
                                <span>No Exporting</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400">
                                <span className="text-gray-300">✖</span>
                                <span>Limited New Features</span>
                            </li>
                        </ul>
                    </div>

                    {/* Annual Plan */}
                    <div className="bg-white rounded-xl shadow-sm border-gray-100 p-8 flex flex-col">
                        <h2 className="text-xl font-bold text-pink-600">
                            Annual
                        </h2>
                        <p className="text-3xl font-extrabold mt-2">
                            $2.99{" "}
                            <span className="text-lg font-medium text-gray-500">
                                / month
                            </span>
                        </p>
                        <p className="text-gray-500 text-sm">Billed annually</p>

                        <ul className="space-y-3 flex-1">
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-pink-500">✔</span>
                                <span>Unlimited AI flashcards</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-pink-500">✔</span>
                                <span>Unlimited Exam Mode Answers</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-pink-500">✔</span>
                                <span>150,000 Characters per Text Upload</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-pink-500">✔</span>
                                <span>Upload documents</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-pink-500">✔</span>
                                <span>Export to Anki, PDF and more</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-pink-500">✔</span>
                                <span>New Features Soon</span>
                            </li>
                        </ul>

                        <button className="mt-8 py-2 rounded-xl font-semibold bg-pink-500 text-white hover:bg-pink-600 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95">
                            Subscribe
                        </button>
                    </div>

                    {/* Monthly Plan */}
                    <div className="bg-white rounded-xl shadow-sm border-gray-100 p-8 flex flex-col">
                        <h2 className="text-xl font-bold text-orange-600">
                            Monthly
                        </h2>
                        <p className="text-3xl font-extrabold mt-2">
                            $6.99{" "}
                            <span className="text-lg font-medium text-gray-500">
                                / month
                            </span>
                        </p>
                        <p className="text-gray-500 text-sm">Billed monthly</p>

                        <ul className="space-y-3 flex-1">
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-orange-500">✔</span>
                                <span>Unlimited AI flashcards</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-orange-500">✔</span>
                                <span>Unlimited Exam Mode Answers</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-orange-500">✔</span>
                                <span>150,000 Characters per Text Upload</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-orange-500">✔</span>
                                <span>Upload documents</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-orange-500">✔</span>
                                <span>Export to Anki, PDF and more</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-700">
                                <span className="text-orange-500">✔</span>
                                <span>New Features Soon</span>
                            </li>
                        </ul>

                        <button className="mt-8 px-3 py-2 border-2 border-orange-400 font-semibold text-sm rounded-xl text-orange-400 hover:bg-orange-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95">
                            Subscribe
                        </button>
                    </div>
                </div>

                <h1 className=" mt-12 text-3xl font-semibold text-center text-[#1d1d4f] mb-4">
                    Compare all features
                </h1>

                <div className="bg-white rounded-xl shadow-sm border-none border-gray-100 max-w-6xl w-full px-2 py-3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 text-[#1d1d4f] text-lg font-semibold">
                                        AI-Powered Features
                                    </th>
                                    <th className="py-3 px-4 text-[#1d1d4f] font-semibold text-center">
                                        Basic
                                    </th>
                                    <th className="py-3 px-4 text-[#121254] font-semibold text-center">
                                        Flashcards Plus
                                    </th>
                                    <th className="py-3 px-4 text-[#1d1d4f] font-semibold text-center">
                                        All Generators
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-800 text-[15px] font-medium">
                                <tr>
                                    <td className="py-3 px-4">
                                        Create flashcard decks with AI
                                    </td>
                                    <td className="py-3 px-4 text-center">3</td>
                                    <td className="py-3 px-4 text-center">
                                        Unlimited
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        Unlimited
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">
                                        Pages per document upload{" "}
                                        <span className="text-gray-400">ℹ</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">5</td>
                                    <td className="py-3 px-4 text-center">
                                        200
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        200
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">
                                        Maximum characters per text{" "}
                                        <span className="text-gray-400">ℹ</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        25,000
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        150,000
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        150,000
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">
                                        Exam Mode answers{" "}
                                        <span className="text-gray-400">ℹ</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        25
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        Unlimited
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        Unlimited
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4">
                                        Chat with AI to make changes{" "}
                                        <span className="text-gray-400">ℹ</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        5 per day
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        Unlimited
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        Unlimited
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white mt-6 shadow-sm rounded-xl py-4 px-4 w-full max-w-6xl">
                    {/* Row with Toggle + Plans */}
                    <div className="grid grid-cols-4 items-center gap-16 text-center">
                        {/* Toggle Switch */}
                        <div className="flex justify-center">
                            <div className="flex items-center bg-[#eef1ff] rounded-full p-1">
                                <button
                                    onClick={() => setBilling("annual")}
                                    className={`px-3 py-1 rounded-full font-medium transition ${
                                        billing === "annual"
                                            ? "bg-white shadow-sm text-[#1d1d4f]"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Annual
                                </button>
                                <button
                                    onClick={() => setBilling("monthly")}
                                    className={`px-3 py-1 rounded-full font-medium transition ${
                                        billing === "monthly"
                                            ? "bg-white shadow-sm text-[#1d1d4f]"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        {/* Free Plan */}
                        <div className="flex flex-col items-center">
                            <p className="text-[#1d1d4f] font-semibold text-base">
                                Free
                            </p>
                            <button className="px-3 py-1 border-2 font-semibold text-sm rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95">
                                Get Started
                            </button>
                        </div>

                        {/* Flashcards Plus */}
                        <div className="flex flex-col items-center">
                            <p className="text-[#1d1d4f] font-semibold text-base">
                                {billing === "annual" ? "$2.99" : "$3.99"}
                                <span className="text-gray-500 font-medium text-base">
                                    {" "}
                                    / Month
                                </span>
                            </p>
                            <button className="px-3 py-1 border-2 font-semibold text-sm rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95">
                                Subscribe
                            </button>
                        </div>

                        {/* All Generators */}
                        <div className="flex flex-col items-center">
                            <p className="text-[#1d1d4f] font-semibold text-base">
                                {billing === "annual" ? "$5.99" : "$7.99"}
                                <span className="text-gray-500 font-medium text-base">
                                    {" "}
                                    / Month
                                </span>
                            </p>
                            <button className="px-3 py-1 border-2 font-semibold text-sm rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
