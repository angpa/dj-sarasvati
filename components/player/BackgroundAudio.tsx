"use client";

import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface BackgroundAudioProps {
    videoId: string;
    isPlaying: boolean;
    volume: number;
    introSkip: number;
    onEnded: () => void;
    onProgress?: (current: number, duration: number) => void;
    className?: string;
}

export default function BackgroundAudio({
    videoId,
    isPlaying,
    volume,
    introSkip,
    onEnded,
    onProgress,
    className
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

    // Poll for progress
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && onProgress) {
            interval = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const current = playerRef.current.getCurrentTime();
                    const duration = playerRef.current.getDuration();
                    onProgress(current, duration);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, onProgress]);

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
