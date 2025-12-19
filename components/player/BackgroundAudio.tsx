"use client";

import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface BackgroundAudioProps {
    videoId: string;
    isPlaying: boolean;
    volume: number;
    introSkip?: number;
    outroSkip?: number;
    seekTime?: number | null; // Timestamp to seek to
    onEnded: () => void;
    onProgress?: (current: number, duration: number) => void;
    className?: string;
    disableAutoSkip?: boolean;
    muted?: boolean;
}

export default function BackgroundAudio({
    videoId,
    isPlaying,
    volume,
    introSkip = 0,
    outroSkip = 0,
    seekTime,
    onEnded,
    onProgress,
    className,
    disableAutoSkip = false,
    muted = false
}: BackgroundAudioProps) {
    const playerRef = useRef<YouTubePlayer | null>(null);

    // Sync Play/Pause state
    useEffect(() => {
        try {
            if (playerRef.current && playerRef.current.internalPlayer) {
                if (isPlaying) {
                    playerRef.current.playVideo();
                } else {
                    playerRef.current.pauseVideo();
                }
            }
        } catch (e) { console.warn("Player state sync failed", e); }
    }, [isPlaying]);

    // Sync Volume
    useEffect(() => {
        try {
            // Check if player is truly ready and internal player exists
            if (playerRef.current && playerRef.current.internalPlayer && typeof playerRef.current.setVolume === 'function') {
                if (muted) {
                    playerRef.current.mute();
                } else {
                    playerRef.current.unMute();
                    playerRef.current.setVolume(volume);
                }
            }
        } catch (e) {
            console.warn("Failed to set volume on player:", e);
        }
    }, [volume, muted]);

    // Sync Seek
    useEffect(() => {
        if (!playerRef.current || seekTime === null || seekTime === undefined) return;
        playerRef.current.seekTo(seekTime, true);
    }, [seekTime]);

    // Poll for progress & Check Outro Skip
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying) {
            interval = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const current = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();

                    // Report progress
                    if (onProgress) {
                        onProgress(current, duration);
                    }

                    // Check for Outro Skip
                    // Should be at least halfway through to avoid skipping immediately on broken metadata
                    if (!disableAutoSkip && outroSkip > 0 && duration > 0 && current > duration / 2) {
                        if (duration - current <= outroSkip) {
                            console.log("Auto-skipping outro");
                            onEnded(); // Trigger next track
                        }
                    }
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, onProgress, outroSkip, onEnded, disableAutoSkip]);

    const onReady = (event: YouTubeEvent) => {
        console.log("Player Ready"); // Debug
        playerRef.current = event.target;

        // Ensure player is unmuted and set volume
        if (typeof event.target.unMute === 'function') {
            if (muted) event.target.mute();
            else {
                event.target.unMute();
                event.target.setVolume(volume);
            }
        }

        if (isPlaying) {
            if (introSkip > 0) {
                event.target.seekTo(introSkip, true);
            }
            event.target.playVideo();
        }
    };

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            start: introSkip,
        },
    };

    return (
        <div className={className}>
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onReady}
                onEnd={onEnded}
                onError={(e: any) => {
                    console.error("YouTube Player Error:", e);
                    // Force skip on fatal errors to avoid stuck state
                    onEnded();
                }}
                className="w-full h-full object-cover"
                iframeClassName="w-full h-full object-cover"
            />
        </div>
    );
}
