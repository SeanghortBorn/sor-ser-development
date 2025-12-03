import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Settings,
    GripVertical,
    Clock,
    Lock,
    Unlock,
    ChevronDown,
    ChevronUp,
    Save,
    RotateCcw,
    Zap,
    BookOpen,
    BarChart2,
    Eye,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

/**
 * ArticleSettings/Index.jsx
 * 
 * Admin page for managing article progression settings
 * Features:
 * - Drag & drop reordering
 * - Edit settings for each article
 * - Quick setup sequential chain
 * - Bulk update typing modes
 */

export default function ArticleSettingsIndex({ articles, articleOptions }) {
    const { flash } = usePage().props;
    const [expandedId, setExpandedId] = useState(null);
    const [editingArticle, setEditingArticle] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [localArticles, setLocalArticles] = useState(articles);

    // ═══════════════════════════════════════════════════════════════════
    // FORM STATE
    // ═══════════════════════════════════════════════════════════════════
    const [formData, setFormData] = useState({
        display_order: 0,
        prerequisite_article_id: null,
        unlock_delay_days: 0,
        unlock_delay_hours: 0,
        availability_mode: 'sequential',
        typing_mode: 'nlp_only',
        slug: '',
        category: '',
        description: '',
        is_active: true,
        is_required: true,
        max_attempts: null,
        min_completion_accuracy: null,
    });

    // ═══════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════

    const handleExpand = (articleId) => {
        if (expandedId === articleId) {
            setExpandedId(null);
            setEditingArticle(null);
        } else {
            const article = localArticles.find(a => a.id === articleId);
            setExpandedId(articleId);
            setEditingArticle(article);
            setFormData({
                display_order: article.setting.display_order || 0,
                prerequisite_article_id: article.setting.prerequisite_article_id || null,
                unlock_delay_days: article.setting.unlock_delay_days || 0,
                unlock_delay_hours: article.setting.unlock_delay_hours || 0,
                availability_mode: article.setting.availability_mode || 'sequential',
                typing_mode: article.setting.typing_mode || 'nlp_only',
                slug: article.setting.slug || '',
                category: article.setting.category || '',
                description: article.setting.description || '',
                is_active: article.setting.is_active ?? true,
                is_required: article.setting.is_required ?? true,
                max_attempts: article.setting.max_attempts || null,
                min_completion_accuracy: article.setting.min_completion_accuracy || null,
            });
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (articleId) => {
        router.put(route('article-settings.update', articleId), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setExpandedId(null);
                setEditingArticle(null);
            },
        });
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset ALL article settings to default? This cannot be undone.')) {
            router.post(route('article-settings.reset'), {}, {
                preserveScroll: true,
            });
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // DRAG & DROP
    // ═══════════════════════════════════════════════════════════════════

    const handleDragStart = (e, article) => {
        setDraggedItem(article);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, article) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === article.id) return;
    };

    const handleDrop = (e, targetArticle) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetArticle.id) return;

        const newArticles = [...localArticles];
        const draggedIndex = newArticles.findIndex(a => a.id === draggedItem.id);
        const targetIndex = newArticles.findIndex(a => a.id === targetArticle.id);

        // Remove dragged item and insert at target position
        const [removed] = newArticles.splice(draggedIndex, 1);
        newArticles.splice(targetIndex, 0, removed);

        // Update display_order for all items
        const updatedArticles = newArticles.map((article, index) => ({
            ...article,
            setting: { ...article.setting, display_order: index + 1 }
        }));

        setLocalArticles(updatedArticles);

        // Save new order to server
        const orderData = updatedArticles.map(a => ({
            article_id: a.id,
            display_order: a.setting.display_order,
        }));

        router.post(route('article-settings.update-order'), { order: orderData }, {
            preserveScroll: true,
        });

        setDraggedItem(null);
    };

    // ═══════════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════════

    const getAvailabilityBadge = (mode) => {
        const badges = {
            always: { color: 'bg-green-100 text-green-800', icon: Unlock, text: 'Always' },
            sequential: { color: 'bg-blue-100 text-blue-800', icon: Lock, text: 'Sequential' },
            time_gated: { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Time-Gated' },
        };
        const badge = badges[mode] || badges.sequential;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <badge.icon className="w-3 h-3" />
                {badge.text}
            </span>
        );
    };

    const getTypingModeBadge = (mode) => {
        if (mode === 'nlp_la') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <BarChart2 className="w-3 h-3" />
                    NLP + LA
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <BookOpen className="w-3 h-3" />
                NLP Only
            </span>
        );
    };

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Article Progression Settings
                    </h2>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset All
                    </button>
                </div>
            }
        >
            <Head title="Article Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            {flash.error}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• <strong>Drag & drop</strong> articles to reorder them</li>
                            <li>• Click on an article row to <strong>expand and edit</strong> its settings</li>
                            <li>• Set <strong>prerequisites</strong> to require users complete other articles first</li>
                            <li>• Use <strong>time-gated</strong> mode to add waiting periods between articles</li>
                            <li>• Choose <strong>NLP + LA</strong> for full features (experimental group)</li>
                        </ul>
                    </div>

                    {/* Articles List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                                <div className="col-span-1">#</div>
                                <div className="col-span-4">Article</div>
                                <div className="col-span-2">Mode</div>
                                <div className="col-span-2">Typing</div>
                                <div className="col-span-2">Prerequisite</div>
                                <div className="col-span-1">Active</div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {localArticles.map((article, index) => (
                                <div key={article.id}>
                                    {/* Main Row */}
                                    <div
                                        className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition ${
                                            expandedId === article.id ? 'bg-blue-50' : ''
                                        } ${draggedItem?.id === article.id ? 'opacity-50' : ''}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, article)}
                                        onDragOver={(e) => handleDragOver(e, article)}
                                        onDrop={(e) => handleDrop(e, article)}
                                        onClick={() => handleExpand(article.id)}
                                    >
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-1 flex items-center gap-2">
                                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                                <span className="text-gray-500">{article.setting.display_order}</span>
                                            </div>
                                            <div className="col-span-4">
                                                <div className="font-medium text-gray-900">{article.title}</div>
                                                {article.setting.slug && (
                                                    <div className="text-xs text-gray-500">slug: {article.setting.slug}</div>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                {getAvailabilityBadge(article.setting.availability_mode)}
                                            </div>
                                            <div className="col-span-2">
                                                {getTypingModeBadge(article.setting.typing_mode)}
                                            </div>
                                            <div className="col-span-2 text-sm text-gray-600">
                                                {article.setting.prerequisite_title || '-'}
                                                {article.setting.unlock_delay_days > 0 && (
                                                    <span className="text-orange-600 ml-1">
                                                        (+{article.setting.unlock_delay_days}d)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="col-span-1 flex items-center justify-between">
                                                {article.setting.is_active ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-gray-300" />
                                                )}
                                                {expandedId === article.id ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Edit Form */}
                                    {expandedId === article.id && (
                                        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                
                                                {/* Availability Mode */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Availability Mode
                                                    </label>
                                                    <select
                                                        value={formData.availability_mode}
                                                        onChange={(e) => handleInputChange('availability_mode', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="always">Always Available</option>
                                                        <option value="sequential">Sequential (requires prerequisite)</option>
                                                        <option value="time_gated">Time-Gated (requires waiting period)</option>
                                                    </select>
                                                </div>

                                                {/* Prerequisite */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Prerequisite Article
                                                    </label>
                                                    <select
                                                        value={formData.prerequisite_article_id || ''}
                                                        onChange={(e) => handleInputChange('prerequisite_article_id', e.target.value || null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        disabled={formData.availability_mode === 'always'}
                                                    >
                                                        <option value="">None</option>
                                                        {articleOptions
                                                            .filter(opt => opt.id !== article.id)
                                                            .map(opt => (
                                                                <option key={opt.id} value={opt.id}>{opt.title}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>

                                                {/* Typing Mode */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Typing Mode
                                                    </label>
                                                    <select
                                                        value={formData.typing_mode}
                                                        onChange={(e) => handleInputChange('typing_mode', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="nlp_only">NLP Only (Basic features)</option>
                                                        <option value="nlp_la">NLP + LA (Full features with analytics)</option>
                                                    </select>
                                                </div>

                                                {/* Unlock Delay Days */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unlock Delay (Days)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.unlock_delay_days}
                                                        onChange={(e) => handleInputChange('unlock_delay_days', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        disabled={formData.availability_mode !== 'time_gated'}
                                                    />
                                                </div>

                                                {/* Unlock Delay Hours */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Unlock Delay (Hours)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="23"
                                                        value={formData.unlock_delay_hours}
                                                        onChange={(e) => handleInputChange('unlock_delay_hours', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        disabled={formData.availability_mode !== 'time_gated'}
                                                    />
                                                </div>

                                                {/* Slug */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Slug (identifier)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.slug}
                                                        onChange={(e) => handleInputChange('slug', e.target.value)}
                                                        placeholder="e.g., demo, pretest, p01"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>

                                                {/* Min Accuracy */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Min Accuracy to Pass (%)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.1"
                                                        value={formData.min_completion_accuracy || ''}
                                                        onChange={(e) => handleInputChange('min_completion_accuracy', e.target.value ? parseFloat(e.target.value) : null)}
                                                        placeholder="Leave empty for no minimum"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>

                                                {/* Max Attempts */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Max Attempts
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={formData.max_attempts || ''}
                                                        onChange={(e) => handleInputChange('max_attempts', e.target.value ? parseInt(e.target.value) : null)}
                                                        placeholder="Unlimited"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>

                                                {/* Toggles */}
                                                <div className="flex items-center gap-6">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.is_active}
                                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">Active</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.is_required}
                                                            onChange={(e) => handleInputChange('is_required', e.target.checked)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">Required</span>
                                                    </label>
                                                </div>

                                                {/* Description */}
                                                <div className="md:col-span-2 lg:col-span-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description (shown to users)
                                                    </label>
                                                    <textarea
                                                        value={formData.description}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Brief description of this article..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-6 flex justify-end gap-3">
                                                <button
                                                    onClick={() => setExpandedId(null)}
                                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSave(article.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}