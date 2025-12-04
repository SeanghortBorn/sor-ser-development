// REPLACE LINES 425-446 in Index.jsx WITH THIS CODE:
// Find the section that has <AudioPlayer .../> and <ArticleSelector .../>
// and replace it with this:

                            {/* Title and Article Dropdown */}
                            <div className="flex justify-between items-center mb-4">
                                {/* Audio Player or Empty Space */}
                                {audioPlayer.audioUrl ? (
                                    <div className="flex-1 mr-4">
                                        <audio
                                            ref={audioPlayer.audioRef}
                                            src={audioPlayer.audioUrl}
                                            onTimeUpdate={audioPlayer.handleTimeUpdate}
                                            onLoadedMetadata={audioPlayer.handleLoadedMetadata}
                                            onEnded={audioPlayer.handleAudioEnded}
                                            className="hidden"
                                        />
                                        <div className="bg-white border border-gray-300 rounded-xl px-3 py-1 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={audioPlayer.togglePlay}
                                                    className="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
                                                >
                                                    {audioPlayer.isPlaying ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <div className="flex space-x-0">
                                                    <button onClick={audioPlayer.skipBackward} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="Back 10s">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                            <path d="M3 3v5h5" />
                                                            <text x="12" y="16" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
                                                        </svg>
                                                    </button>
                                                    <button onClick={audioPlayer.skipForward} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition" title="Forward 10s">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                                            <path d="M21 3v5h-5" />
                                                            <text x="12" y="16" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <span className="text-xs text-gray-600 font-medium min-w-[35px]">{formatTime(audioPlayer.currentTime)}</span>
                                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative" onClick={audioPlayer.handleSeek}>
                                                        <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(audioPlayer.currentTime / audioPlayer.duration) * 100 || 0}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-medium min-w-[35px]">{formatTime(audioPlayer.duration)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div></div>
                                )}

                                {/* Article Dropdown */}
                                <div className="relative w-64" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl shadow-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        {selectedArticle ? selectedArticle.title : "Select an Article"}
                                        <svg className={`w-4 h-4 ml-2 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto hide-scrollbar">
                                            <div className="px-2 py-2 space-y-1">
                                                <button
                                                    type="button"
                                                    className={`w-full text-left px-4 py-2 text-sm rounded-xl transition ${!selectedArticle ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"}`}
                                                    onClick={() => handleSelectArticle(null)}
                                                >
                                                    Select an Article
                                                </button>
                                                {articles.map((article, idx) => (
                                                    <button
                                                        key={article.id}
                                                        type="button"
                                                        disabled={!article.can_access}
                                                        className={`w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                                                            selectedArticle && selectedArticle.id === article.id
                                                                ? "bg-blue-100 text-blue-700 font-medium"
                                                                : article.can_access
                                                                ? "hover:bg-gray-100 text-gray-700"
                                                                : "opacity-40 cursor-not-allowed text-gray-400"
                                                        }`}
                                                        onClick={() => article.can_access && handleSelectArticle(article)}
                                                        title={!article.can_access ? article.lock_message : ""}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {!article.can_access && <span className="text-sm">🔒</span>}
                                                            <span className="font-mono text-gray-500">{idx + 1}</span>
                                                            {". "}
                                                            {article.title}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
