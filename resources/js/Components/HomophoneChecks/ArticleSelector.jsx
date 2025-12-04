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
                        w-full p-3 rounded-lg border text-left transition-all
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
                            <div className="font-medium">{article.title}</div>
                            {!article.can_access && article.lock_message && (
                                <div className="text-xs text-gray-500 mt-1">
                                    🔒 {article.lock_message}
                                </div>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
