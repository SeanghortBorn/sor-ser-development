import HeaderNavbar from '@/Components/Navbars/HeaderNavbar';
import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import QuizList from '@/Components/Quizzes/QuizList';
import { fetchQuizzes } from '../../services/quizService';

export default function Quiz() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false); // Track if quiz started

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                const data = await fetchQuizzes();
                setQuizzes(data);
            } catch (error) {
                console.error('Failed to fetch quizzes:', error);
            } finally {
                setLoading(false);
            }
        };
        loadQuizzes();
    }, []);

    const handleBack = () => {
        setQuizStarted(false); // Go back to quiz selection
    };

    return (
        <>
            <Head title="Quiz" />
            <HeaderNavbar />
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-4 animate-pulse">
                            Welcome to the Quiz Hub
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl">
                            Challenge yourself with fun and interactive quizzes!
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Show back button if quiz started */}
                            {quizStarted && (
                                <div className="mb-6">
                                    <button
                                        onClick={handleBack}
                                        className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded transition"
                                    >
                                        Back
                                    </button>
                                </div>
                            )}

                            {/* Quiz list */}
                            <QuizList
                                quizzes={quizzes}
                                onQuizStart={() => setQuizStarted(true)}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
