import React from "react";

/**
 * Article selection component with access control
 */
export default function ArticleSelector({
    articles = [],
    selectedArticle,
    onSelectArticle,
}) {
    return (
        <div className="space-y-2">
            {articles.map((article) => (
                <button
                    key={article.id}
                    onClick={() => {
                        if (article.can_access) {
                            onSelectArticle(article);
                        }
                    }}
                    disabled={!article.can_access}
                    className={`
                        w-full p-3 rounded-xl border text-left transition-all
                        ${selectedArticle?.id === article.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }
                        ${article.can_access
                            ? "hover:bg-gray-50 cursor-pointer opacity-100"
                            : "cursor-not-allowed opacity-40"
                        }
                    `}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">
                            {article.can_access ? "✅" : "🔒"}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{article.title}</span>
                                {article.is_completed && (
                                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                                        Completed
                                    </span>
                                )}
                            </div>
                            {!article.can_access && article.lock_message && (
                                <div className="text-xs text-gray-500 mt-1">
                                    🔒 {article.lock_message}
                                </div>
                            )}
                            {article.is_completed && article.best_accuracy && (
                                <div className="text-xs text-gray-600 mt-1">
                                    Best: {article.best_accuracy}%
                                    {article.typing_speed && ` • ${article.typing_speed} WPM`}
                                </div>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
