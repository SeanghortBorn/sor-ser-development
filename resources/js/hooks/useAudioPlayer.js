import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for audio player functionality
 */
export function useAudioPlayer(userId, selectedArticle, checkerId, sessionId) {
    const audioRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [pauseStartTime, setPauseStartTime] = useState(null);

    const trackAudioActivity = async (activityType, extraData = {}) => {
        if (!userId || !selectedArticle?.audios_id) return;

        try {
            await axios.post("/api/track/audio-activity", {
                audio_id: selectedArticle.audios_id,
                article_id: selectedArticle.id,
                grammar_checker_id: checkerId ?? null,
                activity_type: activityType,
                playback_position: audioRef.current?.currentTime || 0,
                session_id: sessionId,
                ...extraData,
            });
        } catch (err) {
            console.error(`Track audio ${activityType} error:`, err);
        }
    };

    const togglePlay = async () => {
        if (!audioUrl || !audioRef.current) {
            setAudioError("No audio available to play.");
            return;
        }

        if (isPlaying) {
            // Pausing
            const pauseTime = Date.now();
            setPauseStartTime(pauseTime);
            audioRef.current.pause();
            setIsPlaying(false);
            await trackAudioActivity("audio_pause", { pause_duration: 0 });
        } else {
            // Resuming
            let pauseDuration = 0;
            if (pauseStartTime) {
                pauseDuration = (Date.now() - pauseStartTime) / 1000;
                setPauseStartTime(null);
            }

            try {
                await audioRef.current.play();
                setIsPlaying(true);
                await trackAudioActivity("audio_play", { pause_duration: pauseDuration });
            } catch (e) {
                console.error("Playback failed:", e);
                setAudioError("Failed to play audio. Please try again.");
                setIsPlaying(false);
            }
        }
    };

    const skipForward = async () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(
                audioRef.current.currentTime + 10,
                audioRef.current.duration
            );
            await trackAudioActivity("audio_forward");
        }
    };

    const skipBackward = async () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(
                audioRef.current.currentTime - 10,
                0
            );
            await trackAudioActivity("audio_rewind");
        }
    };

    const handleSeek = (e) => {
        if (audioRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = pos * audioRef.current.duration;
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const loadAudio = async (audioId) => {
        if (!audioId) {
            setAudioUrl(null);
            return;
        }

        try {
            const res = await axios.get(`/api/audios/${audioId}`);
            const audioData = res.data?.data;
            if (audioData && audioData.file_path) {
                setAudioUrl(audioData.file_path);
                setAudioError(null);
            } else {
                setAudioUrl(null);
                setAudioError("Audio file not found");
            }
        } catch (e) {
            console.error("Failed to fetch audio:", e);
            setAudioError("Unable to load audio for this article.");
            setAudioUrl(null);
        }
    };

    const resetAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
    };

    return {
        audioRef,
        audioUrl,
        isPlaying,
        audioError,
        currentTime,
        duration,
        togglePlay,
        skipForward,
        skipBackward,
        handleSeek,
        handleTimeUpdate,
        handleLoadedMetadata,
        handleAudioEnded,
        loadAudio,
        resetAudio,
        setAudioError,
    };
}
