"use client";

import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface BackgroundAudioProps {
    videoId: string;
    isPlaying: boolean;
    volume: number;
    introSkip: number;
    onEnded: () => void;
}

export default function BackgroundAudio({
    videoId,
    isPlaying,
    volume,
    introSkip,
    onEnded
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

    // Handle initial seek on ready or video change if needed
    // Note: react-youtube handles videoId changes automatically, 
    // but we might want to ensure we skip intro when a new video loads.

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        event.target.setVolume(volume);

        // If it's already supposed to be playing (e.g. auto start)
        if (isPlaying) {
            // Skip intro if defined
            if (introSkip > 0) {
                event.target.seekTo(introSkip, true);
            }
            event.target.playVideo();
        }
    };

    const onStateChange = (event: YouTubeEvent) => {
        // Standard YT Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
        if (event.data === YouTube.PlayerState.PLAYING) {
            // Ensure we are not stuck in intro if we just started
            // This is a bit tricky efficiently, usually seekTo on load/cue is better.
        }
    };

    // When videoId changes, components re-renders. 
    // We can use the onPlay event or just rely on the fact that when video changes, 
    // we want to seek to introSkip.

    // React-Youtube opts: 
    const opts = {
        height: '0',
        width: '0', // Hidden
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3, // Hide annotations
            modestbranding: 1,
            start: introSkip, // Start at introSkip directly
        },
    };

    return (
        <div className="hidden">
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onReady}
                onEnd={onEnded}
                onStateChange={onStateChange}
            />
        </div>
    );
}
