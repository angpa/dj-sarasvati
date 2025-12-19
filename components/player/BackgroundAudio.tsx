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
    disableAutoSkip = false
}: BackgroundAudioProps) {
    const playerRef = useRef<YouTubePlayer | null>(null);

    // Sync Play/Pause state
    useEffect(() => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
        }
    }, [isPlaying]);

    // Sync Volume
    useEffect(() => {
        if (!playerRef.current) return;
        playerRef.current.setVolume(volume);
    }, [volume]);

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
        playerRef.current = event.target;
        event.target.setVolume(volume);

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
                className="w-full h-full object-cover"
                iframeClassName="w-full h-full object-cover"
            />
        </div>
    );
}
