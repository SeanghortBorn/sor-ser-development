import axios from 'axios';

/**
 * Utility functions for homophone checking
 */

// Format time (seconds to mm:ss)
export const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Format numbers with decimals
export const formatNumber = (v, decimals = 2) => {
    if (v == null || isNaN(v)) return "—";
    return Number(v).toFixed(decimals);
};

// Khmer word segmentation
export const calculateWordCount = async (text) => {
    if (!text || !text.trim()) return 0;
    try {
        const res = await axios.post(
            "/api/khmer-segment",
            { text },
            { headers: { "Content-Type": "application/json" } }
        );
        return res.data && Array.isArray(res.data.tokens)
            ? res.data.tokens.length
            : text.trim().split(/\s+/).length;
    } catch (e) {
        console.error("Khmer segment API error:", e);
        return text.trim().split(/\s+/).length;
    }
};

// Calculate reading time from word count
export const calculateReadingTime = (wordCount) => Math.ceil((wordCount / 200) * 60);

// Prepare distribution data for Pie chart
export const getDistributionData = (comparisonActivities) => {
    const types = ["replaced", "missing", "extra"];
    const colors = {
        replaced_accept: "#34d399",
        replaced_dismiss: "#f87171",
        missing_accept: "#60a5fa",
        missing_dismiss: "#fbbf24",
        extra_accept: "#a78bfa",
        extra_dismiss: "#f472b6",
    };

    const result = [];
    types.forEach((type) => {
        const acceptCount = comparisonActivities.filter(
            (act) => act.comparison_type === type && act.action === "accept"
        ).length;
        const dismissCount = comparisonActivities.filter(
            (act) => act.comparison_type === type && act.action === "dismiss"
        ).length;

        result.push({
            name: type === "replaced"
                ? "Incorrect Accept"
                : `${type.charAt(0).toUpperCase() + type.slice(1)} Accept`,
            value: acceptCount,
            color: colors[`${type}_accept`],
        });
        result.push({
            name: type === "replaced"
                ? "Incorrect Dismiss"
                : `${type.charAt(0).toUpperCase() + type.slice(1)} Dismiss`,
            value: dismissCount,
            color: colors[`${type}_dismiss`],
        });
    });

    return result.filter((d) => d.value > 0);
};

// Get count of comparison activities by type and action
export const getComparisonCount = (activities, type, action) => {
    return activities.filter(
        (act) => act.comparison_type === type && act.action === action
    ).length;
};

// Get audio activity count by type
export const getAudioActivityCount = (audioActivities, activityType) => {
    return audioActivities.filter((act) => act.activity_type === activityType).length;
};
