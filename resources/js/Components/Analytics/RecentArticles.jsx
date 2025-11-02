import { usePage } from "@inertiajs/react";

export default function AnalyticsSection() {
    const { auth } = usePage().props; 

    const recentQuizzes = [
        {
            id: "#DF429",
            date: "April 28, 2016",
            accuracy: "95%",
            averagePause: "2s",
        },
        {
            id: "#HTY274",
            date: "October 30, 2017",
            accuracy: "88%",
            averagePause: "3s",
        },
        {
            id: "#LKE600",
            date: "May 29, 2017",
            accuracy: "90%",
            averagePause: "4s",
        },
        {
            id: "#HRP447",
            date: "May 20, 2015",
            accuracy: "85%",
            averagePause: "5s",
        },
        {
            id: "#HRP448",
            date: "May 20, 2015",
            accuracy: "80%",
            averagePause: "6s",
        },
        {
            id: "#HRP447",
            date: "May 20, 2015",
            accuracy: "85%",
            averagePause: "5s",
        },
        {
            id: "#HRP448",
            date: "May 20, 2015",
            accuracy: "80%",
            averagePause: "6s",
        },
    ];

    return (
        <div className="mb-8 mt-4">
            {/* Top Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mt-4">
                {/* Recent Quizzes Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Recent Article
                        </h2>
                        <p className="text-sm text-gray-500">
                            Your latest homophone history
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="max-h-96 overflow-y-auto rounded-lg hide-scrollbar">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-gray-700 text-center">
                                            Average Pause
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                            Accuracy
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-700">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentQuizzes.map((quiz) => (
                                        <tr
                                            key={quiz.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {quiz.id}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {quiz.date}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-800 text-center">
                                                {quiz.averagePause}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 text-center">
                                                {quiz.accuracy}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button className="rounded-[10px] border-2 border-blue-500 px-3 py-1 text-blue-700 hover:bg-blue-500 hover:text-white transition font-medium">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
