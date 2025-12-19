"use client";

import { useState, useRef, useEffect } from "react";
import GlassPlayer from "@/components/player/GlassPlayer";
import AudioVisualizer from "@/components/scene/AudioVisualizer";
import { Canvas } from "@react-three/fiber";
import NeonButton from "@/components/ui/NeonButton";
import TechText from "@/components/ui/TechText";
import PlayerControls from "@/components/player/PlayerControls";
import { tracks } from "@/data/tracks";
import BackgroundAudio from "@/components/player/BackgroundAudio";
import { Maximize2, Minimize2 } from "lucide-react";
import clsx from "clsx";
import { useAudioEngine } from "@/hooks/useAudioEngine";

type Deck = 'A' | 'B';

export default function Home() {
    const [hasEntered, setHasEntered] = useState(false);
    const [activeDeck, setActiveDeck] = useState<Deck>('A');

    // Track indices
    const [trackIndexA, setTrackIndexA] = useState(0);
    const [trackIndexB, setTrackIndexB] = useState(1);

    // Engine Controls
    const {
        loadTrack, play, pause, setCrossfade,
        analyser, isReady,
        deckA, deckB, crossfade: engineCrossfade
    } = useAudioEngine();

    // Local volume state (master)
    const [volume, setVolume] = useState(80);

    // UI State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isCinemaMode, setIsCinemaMode] = useState(false);

    // Initial Load & Track Sync
    useEffect(() => {
        if (isReady && hasEntered) {
            // Load initial tracks
            loadTrack('A', tracks[trackIndexA].videoId);
            loadTrack('B', tracks[trackIndexB].videoId);
        }
    }, [isReady, hasEntered]);

    // Track Loading Effects
    // When indices change, load the new track into the engine
    useEffect(() => {
        if (hasEntered && isReady) loadTrack('A', tracks[trackIndexA].videoId);
    }, [trackIndexA, isReady, hasEntered, loadTrack]);

    useEffect(() => {
        if (hasEntered && isReady) loadTrack('B', tracks[trackIndexB].videoId);
    }, [trackIndexB, isReady, hasEntered, loadTrack]);


    // Playback Sync
    // Determine effective playback state from Engine
    const isPlayingA = deckA.isPlaying;
    const isPlayingB = deckB.isPlaying;

    // Derived active track for Display info
    const currentTrack = activeDeck === 'A' ? tracks[trackIndexA] : tracks[trackIndexB];

    // Auto-Mix Logic (Replaces Audio Listener)
    // We check the ACTIVE deck's remaining time
    const activeDeckState = activeDeck === 'A' ? deckA : deckB;
    useEffect(() => {
        if (activeDeckState.isPlaying && activeDeckState.duration > 0) {
            const remaining = activeDeckState.duration - activeDeckState.currentTime;
            // Crossfade 5 seconds before end
            if (remaining < 5 && remaining > 0.5) {
                // Trigger Next if not already doing so
                // Check if B is not playing
                const otherDeckStart = activeDeck === 'A' ? !isPlayingB : !isPlayingA;
                if (otherDeckStart) {
                    handleNext();
                }
            }
        }
    }, [activeDeckState.currentTime, activeDeck, isPlayingA, isPlayingB]);

    // Progress Sync for UI
    useEffect(() => {
        setCurrentTime(activeDeckState.currentTime);
        setDuration(activeDeckState.duration);
    }, [activeDeckState.currentTime, activeDeckState.duration]);


    const handleEnter = async () => {
        setHasEntered(true);
        // Play Deck A
        setTimeout(() => play('A'), 1000); // Small delay to ensuring loading
    };

    const togglePlay = () => {
        if (activeDeck === 'A') {
            if (isPlayingA) pause('A'); else play('A');
        } else {
            if (isPlayingB) pause('B'); else play('B');
        }
    };

    // Crossfader Animation Ref
    const fadeRequestRef = useRef<number>();
    const fadeStartTimeRef = useRef<number>(0);
    const fadeDuration = 5000;
    const fadeTargetRef = useRef<number>(0); // 0 or 1

    const animateFade = () => {
        const now = Date.now();
        const elapsed = now - fadeStartTimeRef.current;
        const progress = Math.min(elapsed / fadeDuration, 1);

        // Lerp
        const start = fadeTargetRef.current === 1 ? 0 : 1;
        const current = start + (fadeTargetRef.current - start) * progress;

        setCrossfade(current);

        if (progress < 1) {
            fadeRequestRef.current = requestAnimationFrame(animateFade);
        } else {
            // Fade complete
            // Stop the OTHER deck
            if (fadeTargetRef.current === 0) pause('B'); // Faded to A
            else pause('A'); // Faded to B
        }
    };

    const handleNext = () => {
        console.log("Triggering Mix...");

        // Determine Next Deck
        const nextDeck = activeDeck === 'A' ? 'B' : 'A';
        // Calculate next track index for the INACTIVE deck to be ready?
        // Actually, if we are mixing TO B, B should already be loaded with the Next Track from previous cycle?
        // In a simple A->B->A list:
        // 1. Start A[0], B[1]. Active A.
        // 2. Mix to B. Active B. B[1] plays. A stops.
        // 3. Prepare A with [2].

        const nextIdx = (activeDeck === 'A' ? trackIndexB : trackIndexA) + 1; // Actually logic is simpler:
        // Current implementation:
        // A active. B is "next".
        // Mix to B.
        // Once mixed, update A to be "next + 1".

        if (nextDeck === 'A') {
            // Transitioning TO A.
            // Ensure A is playing
            play('A');
            fadeTargetRef.current = 0; // Fade to 0 (A)

            // Queue next track for B
            const nextTrackForB = (trackIndexA + 1 + 1) % tracks.length;
            // Wait, A is playing track X. B was X+1.
            // We go to B.
            // Now A needs X+2.
            // So when we handleNext FROM B later...
        } else {
            // Transitioning TO B
            play('B');
            fadeTargetRef.current = 1; // Fade to 1 (B)
        }

        fadeStartTimeRef.current = Date.now();
        cancelAnimationFrame(fadeRequestRef.current!);
        animateFade();

        setActiveDeck(nextDeck);

        // Update the "Old" deck to the new standard after a delay
        setTimeout(() => {
            const nextTrackIndex = (Math.max(trackIndexA, trackIndexB) + 1) % tracks.length;
            if (nextDeck === 'A') setTrackIndexB(nextTrackIndex);
            else setTrackIndexA(nextTrackIndex);
        }, 6000); // Wait for fade to finish
    };

    const handlePrev = () => {
        // Simplified: Just cut to start of current or prev track
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        // Seek logic for Engine?
        // engine.seek(deck, time)
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const toggleCinemaMode = () => setIsCinemaMode(!isCinemaMode);

    if (!hasEntered) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
                    <div className="text-center space-y-2">
                        <TechText animate>System Ready</TechText>
                        <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-fuchsia-glow via-white to-electric-cyan-bright">
                            SARASVATĪ
                        </h1>
                        <p className="text-electric-cyan/60 tracking-[0.5em] text-sm uppercase">. Native Audio Engine .</p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <NeonButton onClick={handleEnter} className="mt-8 text-xl px-10 py-4" glow>
                            INITIALIZE CORE
                        </NeonButton>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 transition-opacity duration-1000">
            {/* Audio Visualizer Backend */}
            {/* Note: R3F Canvas handles the 3D scene. The audio is now driven by 'analyser' */}
            <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
                <div className="w-full h-full">
                    <Canvas>
                        <ambientLight intensity={0.5} />
                        <AudioVisualizer analyser={analyser} />
                    </Canvas>
                </div>
            </div>

            <GlassPlayer>
                <div className="flex flex-col items-center text-center space-y-4 w-full">
                    {/* Video Container (MUTED VISUALS) */}
                    <div
                        className={clsx(
                            "rounded-xl bg-black/50 shadow-inner flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden group transition-all duration-500 ease-in-out",
                            isCinemaMode ? "fixed inset-0 z-50 w-full h-full rounded-none border-none bg-black" : "w-80 h-80 md:w-96 md:h-96"
                        )}
                    >
                        {/* Deck A Visuals */}
                        <div className={clsx("absolute inset-0 transition-opacity duration-500", activeDeck === 'A' ? "opacity-100 z-10" : "opacity-0 z-0")}>
                            <BackgroundAudio
                                videoId={tracks[trackIndexA].videoId}
                                isPlaying={isPlayingA} // Sync video with audio state
                                volume={0} // Muted
                                muted={true} // Strict mute
                                onEnded={() => { }} // Audio engine handles logic now
                                className="w-full h-full"
                            />
                        </div>

                        {/* Deck B Visuals */}
                        <div className={clsx("absolute inset-0 transition-opacity duration-500", activeDeck === 'B' ? "opacity-100 z-10" : "opacity-0 z-0")}>
                            <BackgroundAudio
                                videoId={tracks[trackIndexB].videoId}
                                isPlaying={isPlayingB}
                                volume={0}
                                muted={true}
                                onEnded={() => { }}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Cinema Toggle Button */}
                        <button
                            onClick={toggleCinemaMode}
                            className={clsx(
                                "absolute z-50 p-2 rounded-full bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10",
                                isCinemaMode ? "top-8 right-8" : "top-2 right-2 opacity-0 group-hover:opacity-100"
                            )}
                        >
                            {isCinemaMode ? <Minimize2 size={24} /> : <Maximize2 size={20} />}
                        </button>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-3xl font-light tracking-wide text-white">{currentTrack.title}</h2>
                        <p className="text-electric-cyan font-mono text-sm tracking-widest">ARTIST: {currentTrack.artist}</p>
                    </div>

                    {/* Progress Bar (Visual Only for now) */}
                    <div className="w-full h-1 bg-white/10 rounded-full mt-6 relative overflow-visible">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-fuchsia to-electric-cyan shadow-[0_0_10px_#d946ef] transition-all duration-1000 ease-linear pointer-events-none"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                    </div>

                    <div className="flex justify-between w-full text-xs font-mono text-white/50 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    <PlayerControls
                        isPlaying={activeDeck === 'A' ? isPlayingA : isPlayingB}
                        onPlayPause={togglePlay}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                </div>
            </GlassPlayer>
        </main>
    );
}
