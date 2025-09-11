const FeaturesSection = () => (
    <div className="w-full flex justify-center mt-12">
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-lg flex-1 px-8 py-3 flex flex-col items-center">
                <div className="bg-purple-50 rounded-xl p-3 mb-3 mt-3">
                    <img src="/icons/icon-notepad.webp" alt="Notepad Icon" className="w-9 h-9" />
                </div>
                <h3 className="font-sans text-2xl font-semibold text-gray-700 mb-4 text-center">Create Resources</h3>
                <p className="font-sans text-lg text-gray-700/70 text-center">Enhance your study or professional development by quickly with quizzes and Practice tests using our tools.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-lg flex-1 px-8 py-3 flex flex-col items-center">
                <div className="bg-orange-50 rounded-xl p-3 mb-3 mt-3">
                    <img src="/icons/icon-paper.webp" alt="Paper Icon" className="w-9 h-9" />
                </div>
                <h3 className="font-sans text-2xl font-semibold text-gray-700 mb-4 text-center">Practice & Master</h3>
                <p className="font-sans text-lg text-gray-700/70 text-center">Build confidence by practicing with quizzes, receiving instant feedback, and tracking your progress until you fully master each subject.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-lg flex-1 px-8 py-3 flex flex-col items-center">
                <div className="bg-red-50 rounded-xl p-3 mb-3 mt-3">
                    <img src="/icons/icon-collaborate.webp" alt="Collaborate Icon" className="w-9 h-9" />
                </div>
                <h3 className="font-sans text-2xl font-semibold text-gray-700 mb-4 text-center">Study & Collaborate</h3>
                <p className="font-sans text-lg text-gray-700/70 text-center">Work together with classmates by sharing resources, joining group study sessions, and supporting each other for better learning outcomes.</p>
            </div>
        </div>
    </div>
);

export default FeaturesSection;
