"use client";

import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

type Track = {
    artist: string;
    title: string;
    videoId: string;
    introSkip: number;
};

export default function Home() {
    const playerRef = useRef<any>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        fetch("/tracks.json")
            .then(res => res.json())
            .then(setTracks);
    }, []);

    useEffect(() => {
        if (!tracks.length) return;

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player("player", {
                videoId: tracks[index].videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onStateChange: onStateChange,
                },
            });
        };

        function onStateChange(event: any) {
            if (event.data === window.YT.PlayerState.PLAYING) {
                const skip = tracks[index].introSkip;
                if (skip > 0) {
                    setTimeout(() => {
                        playerRef.current.seekTo(skip, true);
                        console.log(`[sarasvatī] intro skipped at ${skip}s`);
                    }, skip * 1000);
                }
            }

            if (event.data === window.YT.PlayerState.ENDED) {
                const next = (index + 1) % tracks.length;
                setIndex(next);
                playerRef.current.loadVideoById(tracks[next].videoId);
                console.log(`[sarasvatī] next track`);
            }
        }
    }, [tracks, index]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "black",
            }}
        >
            <div id="player" style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
