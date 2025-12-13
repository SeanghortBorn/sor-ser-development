import React, { memo } from 'react';
import { CheckCircle, Clock, Lock } from 'lucide-react';

/**
 * ArticleCard Component
 *
 * Displays article information in a card format for selection.
 */
const ArticleCard = memo(({
    article,
    isSelected = false,
    isCompleted = false,
    isLocked = false,
    onClick,
}) => {
    const handleClick = () => {
        if (!isLocked && onClick) {
            onClick(article);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                p-4 rounded-xl border-2 transition-all cursor-pointer
                ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
            `}
            role="button"
            tabIndex={isLocked ? -1 : 0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {article.title}
                    </h3>

                    {article.category && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {article.category}
                        </span>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                        {article.word_count && (
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {article.word_count} words
                            </span>
                        )}

                        {article.reading_time && (
                            <span>
                                ~{article.reading_time} min
                            </span>
                        )}
                    </div>
                </div>

                <div className="ml-3 flex-shrink-0">
                    {isCompleted && (
                        <CheckCircle className="text-green-500" size={24} />
                    )}
                    {isLocked && (
                        <Lock className="text-gray-400" size={24} />
                    )}
                </div>
            </div>

            {article.description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {article.description}
                </p>
            )}

            {article.accuracy !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Best Accuracy:</span>
                        <span className={`font-semibold ${
                            article.accuracy >= 80 ? 'text-green-600' :
                            article.accuracy >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                            {article.accuracy}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;
