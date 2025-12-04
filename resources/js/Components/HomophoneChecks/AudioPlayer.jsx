import React from "react";
import { formatTime } from "@/utils/homophoneUtils";

/**
 * Audio player component with playback controls
 */
export default function AudioPlayer({
    audioRef,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    onTogglePlay,
    onSkipBackward,
    onSkipForward,
    onSeek,
    onTimeUpdate,
    onLoadedMetadata,
    onEnded,
}) {
    if (!audioUrl) return null;

    return (
        <div className="flex-1 mr-4">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                className="hidden"
            />
            <div className="bg-white border border-gray-300 rounded-xl px-3 py-1 shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                        onClick={onTogglePlay}
                        className="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
                    >
                        {isPlaying ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <div className="flex space-x-0">
                        {/* Skip Backward 10s */}
                        <button
                            onClick={onSkipBackward}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
                            title="Back 10s"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-700"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <text
                                    x="12"
                                    y="16"
                                    fontSize="8"
                                    fill="currentColor"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                >
                                    10
                                </text>
                            </svg>
                        </button>

                        {/* Skip Forward 10s */}
                        <button
                            onClick={onSkipForward}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
                            title="Forward 10s"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-700"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <text
                                    x="12"
                                    y="16"
                                    fontSize="8"
                                    fill="currentColor"
                                    textAnchor="middle"
                                    fontWeight="bold"
                                >
                                    10
                                </text>
                            </svg>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-gray-600 font-medium min-w-[35px]">
                            {formatTime(currentTime)}
                        </span>
                        <div
                            className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative"
                            onClick={onSeek}
                        >
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{
                                    width: `${((currentTime / duration) * 100) || 0}%`,
                                }}
                            />
                        </div>
                        <span className="text-xs text-gray-600 font-medium min-w-[35px]">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
