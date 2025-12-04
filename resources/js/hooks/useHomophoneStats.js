import { useState } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching homophone statistics
 * Consolidates duplicate API fetching logic
 */
export function useHomophoneStats() {
    const [activityStats, setActivityStats] = useState(null);
    const [loadingActivityStats, setLoadingActivityStats] = useState(false);
    const [accuracyStats, setAccuracyStats] = useState(null);
    const [loadingAccuracyStats, setLoadingAccuracyStats] = useState(false);
    const [comparisonActivities, setComparisonActivities] = useState([]);
    const [loadingComparisonActivities, setLoadingComparisonActivities] = useState(false);
    const [audioActivities, setAudioActivities] = useState([]);
    const [loadingAudioActivities, setLoadingAudioActivities] = useState(false);

    // Generic API fetcher with multiple endpoint fallback
    const fetchFromEndpoints = async (endpoints, setData, setLoading, params = {}) => {
        setLoading(true);
        try {
            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        params,
                        headers: { Accept: "application/json" },
                        validateStatus: (status) => status < 500,
                    });

                    if (res.status === 200) {
                        const data = res.data?.data ?? res.data ?? null;
                        if (data) {
                            setData(Array.isArray(data) ? data[0] || data : data);
                            return;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            setData(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivityStats = async (grammarCheckerId) => {
        if (!grammarCheckerId) return;

        const endpoints = [
            `/api/user-activities/stats`,
            `/api/user-activity-stats`,
            `/api/stats/user-activities`,
        ];

        await fetchFromEndpoints(
            endpoints,
            setActivityStats,
            setLoadingActivityStats,
            { grammar_checker_id: grammarCheckerId }
        );
    };

    const fetchAccuracyStats = async (grammarCheckerId) => {
        if (!grammarCheckerId) return;

        const endpoints = [
            `/api/user-homophone-accuracies?grammar_checker_id=${grammarCheckerId}`,
            `/api/homophone-accuracies?grammar_checker_id=${grammarCheckerId}`,
            `/api/accuracies?grammar_checker_id=${grammarCheckerId}`,
        ];

        await fetchFromEndpoints(endpoints, setAccuracyStats, setLoadingAccuracyStats);
    };

    const fetchComparisonActivities = async (grammarCheckerId) => {
        if (!grammarCheckerId) return;

        setLoadingComparisonActivities(true);
        try {
            const res = await axios.get(`/api/user-comparison-activities`, {
                params: { grammar_checker_id: grammarCheckerId, limit: 50 },
                headers: { Accept: "application/json" },
            });
            const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
            setComparisonActivities(data);
        } catch (err) {
            console.error("Error fetching comparison activities:", err);
            setComparisonActivities([]);
        } finally {
            setLoadingComparisonActivities(false);
        }
    };

    const fetchAudioActivities = async (grammarCheckerId) => {
        if (!grammarCheckerId) return;

        const endpoints = [`/api/user-audio-activities`, `/api/audio-activities`];

        setLoadingAudioActivities(true);
        try {
            for (const endpoint of endpoints) {
                try {
                    const res = await axios.get(endpoint, {
                        params: { grammar_checker_id: grammarCheckerId },
                        headers: { Accept: "application/json" },
                        validateStatus: (status) => status < 500,
                    });

                    if (res.status === 200) {
                        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                        setAudioActivities(data);
                        return;
                    }
                } catch (err) {
                    continue;
                }
            }
            setAudioActivities([]);
        } catch (err) {
            console.error("Error fetching audio activities:", err);
            setAudioActivities([]);
        } finally {
            setLoadingAudioActivities(false);
        }
    };

    const fetchAllStats = async (grammarCheckerId) => {
        await Promise.all([
            fetchActivityStats(grammarCheckerId),
            fetchAccuracyStats(grammarCheckerId),
            fetchComparisonActivities(grammarCheckerId),
            fetchAudioActivities(grammarCheckerId),
        ]);
    };

    const resetStats = () => {
        setActivityStats(null);
        setAccuracyStats(null);
        setComparisonActivities([]);
        setAudioActivities([]);
    };

    return {
        activityStats,
        loadingActivityStats,
        accuracyStats,
        loadingAccuracyStats,
        comparisonActivities,
        loadingComparisonActivities,
        audioActivities,
        loadingAudioActivities,
        fetchActivityStats,
        fetchAccuracyStats,
        fetchComparisonActivities,
        fetchAudioActivities,
        fetchAllStats,
        resetStats,
    };
}
