import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { Settings, Save, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';

export default function ArticleSettingsIndex({ auth, articles, articleOptions }) {
    const [expandedId, setExpandedId] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const headWeb = 'Article Progression Settings';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const handleSave = async (articleId) => {
        setSaving(true);

        // Get the article's current settings
        const article = articles.find(a => a.id === articleId);

        // Merge current settings with form changes, ensuring required fields have defaults
        const dataToSave = {
            ...article.setting,
            ...(formData[articleId] || {}),
            // Ensure these fields always have valid values
            unlock_delay_days: formData[articleId]?.unlock_delay_days ?? article.setting.unlock_delay_days ?? 0,
            unlock_delay_hours: formData[articleId]?.unlock_delay_hours ?? article.setting.unlock_delay_hours ?? 0,
        };

        router.put(`/article-settings/${articleId}`, dataToSave, {
            onSuccess: () => {
                alert('Settings updated successfully!');
                setSaving(false);
            },
            onError: (errors) => {
                console.error('Save error:', errors);
                alert('Failed to save settings: ' + (errors.message || 'Unknown error'));
                setSaving(false);
            },
            onFinish: () => {
                setSaving(false);
            }
        });
    };

    const handleFieldChange = (articleId, field, value) => {
        setFormData(prev => ({
            ...prev,
            [articleId]: {
                ...(prev[articleId] || articles.find(a => a.id === articleId)?.setting || {}),
                [field]: value,
            }
        }));
    };

    const handleMoveUp = (e, index) => {
        e.stopPropagation();
        if (index === 0) return;

        const newArticles = [...articles];
        const temp = newArticles[index - 1];
        newArticles[index - 1] = newArticles[index];
        newArticles[index] = temp;

        saveOrder(newArticles);
    };

    const handleMoveDown = (e, index) => {
        e.stopPropagation();
        if (index === articles.length - 1) return;

        const newArticles = [...articles];
        const temp = newArticles[index + 1];
        newArticles[index + 1] = newArticles[index];
        newArticles[index] = temp;

        saveOrder(newArticles);
    };

    const saveOrder = (orderedArticles) => {
        const orderData = orderedArticles.map((article, index) => ({
            article_id: article.id,
            display_order: index + 1
        }));

        router.post('/article-settings/update-order', { order: orderData }, {
            onSuccess: () => {
                // Update display_order in formData
                orderedArticles.forEach((article, index) => {
                    handleFieldChange(article.id, 'display_order', index + 1);
                });
                window.location.reload(); // Reload to show updated order
            },
            onError: (errors) => {
                console.error('Order update error:', errors);
                alert('Failed to update order');
            }
        });
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title="Article Settings" />

            <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-200">
                        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-600" />
                                Article Progression Settings
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Configure the progression order, prerequisites, and settings for each article
                            </p>
                        </div>
                        <div className="p-6">
                            {articles.map((article, index) => {
                                const isExpanded = expandedId === article.id;
                                const currentData = formData[article.id] || article.setting;

                                return (
                                    <div key={article.id} className="border border-gray-200 rounded-xl mb-4 overflow-hidden hover:shadow-md transition-all duration-200">
                                        {/* Header */}
                                        <div
                                            className="p-4 hover:bg-gray-50 flex justify-between items-center transition-colors cursor-pointer"
                                            onClick={() => setExpandedId(isExpanded ? null : article.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Order controls */}
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        onClick={(e) => handleMoveUp(e, index)}
                                                        disabled={index === 0}
                                                        className={`p-0.5 rounded-lg transition ${
                                                            index === 0
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                                        }`}
                                                        title="Move up"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleMoveDown(e, index)}
                                                        disabled={index === articles.length - 1}
                                                        className={`p-0.5 rounded-lg transition ${
                                                            index === articles.length - 1
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                                        }`}
                                                        title="Move down"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <span className="font-bold text-blue-600 text-sm">#{currentData?.display_order}</span>
                                                <span className="text-base font-medium text-gray-900">
                                                    {article.title}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    currentData?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {currentData?.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <ChevronRight
                                                className={`w-5 h-5 transition-transform text-gray-400 ${isExpanded ? 'rotate-90' : ''}`}
                                            />
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="p-6 border-t bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Availability Mode */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Availability Mode
                                                        </label>
                                                        <select
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.availability_mode || 'always'}
                                                            onChange={(e) => handleFieldChange(article.id, 'availability_mode', e.target.value)}
                                                        >
                                                            <option value="always">Always Available</option>
                                                            <option value="sequential">Sequential (After Prerequisite)</option>
                                                            <option value="time_gated">Time Gated</option>
                                                        </select>
                                                    </div>

                                                    {/* Prerequisite Article */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Prerequisite Article
                                                        </label>
                                                        <select
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.prerequisite_article_id || ''}
                                                            onChange={(e) => handleFieldChange(article.id, 'prerequisite_article_id', e.target.value || null)}
                                                            disabled={currentData?.availability_mode === 'always'}
                                                        >
                                                            <option value="">None</option>
                                                            {articleOptions.filter(a => a.id !== article.id).map(option => (
                                                                <option key={option.id} value={option.id}>
                                                                    {option.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Completion Threshold - OPTIONAL */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Minimum Accuracy % to Unlock Next <span className="text-gray-400">(Optional)</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.min_completion_percentage ?? ''}
                                                            onChange={(e) => handleFieldChange(article.id, 'min_completion_percentage', e.target.value ? parseFloat(e.target.value) : null)}
                                                            placeholder="Optional"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Users must achieve this accuracy % to unlock the next article (optional)
                                                        </p>
                                                    </div>

                                                    {/* Minimum Typing Speed - NEW */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Minimum Typing Speed (WPM) to Unlock Next
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="999"
                                                            step="1"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.min_typing_speed ?? ''}
                                                            onChange={(e) => handleFieldChange(article.id, 'min_typing_speed', e.target.value ? parseFloat(e.target.value) : null)}
                                                            placeholder="Optional"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Users must achieve this WPM to unlock the next article (optional)
                                                        </p>
                                                    </div>

                                                    {/* Minimum Typed Words Percentage - REQUIRED */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Minimum Typed Words % to Unlock Next <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="1"
                                                            required
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.min_typed_words_percentage ?? 70}
                                                            onChange={(e) => handleFieldChange(article.id, 'min_typed_words_percentage', parseFloat(e.target.value))}
                                                            placeholder="e.g., 70 for 70%"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Minimum percentage of article words that must be typed (e.g., 70% = 70 words out of 100) - REQUIRED
                                                        </p>
                                                    </div>

                                                    {/* Typing Mode */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Typing Mode
                                                        </label>
                                                        <select
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.typing_mode || 'nlp_only'}
                                                            onChange={(e) => handleFieldChange(article.id, 'typing_mode', e.target.value)}
                                                        >
                                                            <option value="none">Adaptive (Based on User Role)</option>
                                                            <option value="nlp_only">NLP Only (Basic Features)</option>
                                                            <option value="nlp_la">NLP+LA (Full Features)</option>
                                                        </select>
                                                    </div>

                                                    {/* Max Attempts */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Maximum Attempts
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.max_attempts ?? ''}
                                                            onChange={(e) => handleFieldChange(article.id, 'max_attempts', e.target.value ? parseInt(e.target.value) : null)}
                                                            placeholder="Unlimited"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Maximum number of attempts allowed (optional)
                                                        </p>
                                                    </div>

                                                    {/* Group A Redirect - NEW */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Group A (NLP-only) Redirect After Completion
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="/homophone-check"
                                                            value={currentData?.group_a_redirect || ''}
                                                            onChange={(e) => handleFieldChange(article.id, 'group_a_redirect', e.target.value)}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Where to redirect NLP-only users after completing this article
                                                        </p>
                                                    </div>

                                                    {/* Group B Redirect - NEW */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Group B (NLP+LA) Redirect After Completion
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="/users/{id}/progress"
                                                            value={currentData?.group_b_redirect || ''}
                                                            onChange={(e) => handleFieldChange(article.id, 'group_b_redirect', e.target.value)}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Where to redirect NLP+LA users (use {'{id}'} for user ID)
                                                        </p>
                                                    </div>

                                                    {/* Unlock Delay Days */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Unlock Delay (Days)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.unlock_delay_days ?? 0}
                                                            onChange={(e) => handleFieldChange(article.id, 'unlock_delay_days', parseInt(e.target.value))}
                                                            disabled={currentData?.availability_mode !== 'time_gated'}
                                                        />
                                                    </div>

                                                    {/* Unlock Delay Hours */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Unlock Delay (Hours)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="23"
                                                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={currentData?.unlock_delay_hours ?? 0}
                                                            onChange={(e) => handleFieldChange(article.id, 'unlock_delay_hours', parseInt(e.target.value))}
                                                            disabled={currentData?.availability_mode !== 'time_gated'}
                                                        />
                                                    </div>

                                                    {/* Active Status */}
                                                    <div className="flex items-center">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                checked={currentData?.is_active ?? true}
                                                                onChange={(e) => handleFieldChange(article.id, 'is_active', e.target.checked)}
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">Article is Active</span>
                                                        </label>
                                                    </div>

                                                    {/* Required Status */}
                                                    <div className="flex items-center">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                checked={currentData?.is_required ?? true}
                                                                onChange={(e) => handleFieldChange(article.id, 'is_required', e.target.checked)}
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">Required to Complete</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Save Button */}
                                                <div className="mt-6 flex justify-end">
                                                    <button
                                                        onClick={() => handleSave(article.id)}
                                                        disabled={saving}
                                                        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-sm active:scale-95 font-medium"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        {saving ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
            </div>
        </AdminLayout>
    );
}