"use client";

import { useState } from "react";
import GlassPlayer from "@/components/player/GlassPlayer";
import AudioVisualizer from "@/components/scene/AudioVisualizer";
import { Canvas } from "@react-three/fiber";
import NeonButton from "@/components/ui/NeonButton";
import TechText from "@/components/ui/TechText";
import PlayerControls from "@/components/player/PlayerControls";
import { tracks } from "@/data/tracks";
import BackgroundAudio from "@/components/player/BackgroundAudio";
import { Maximize2, Minimize2, Mic } from "lucide-react";
import clsx from "clsx";
import { useAudioListener } from "@/hooks/useAudioListener";
import { useCrossfader } from "@/hooks/useCrossfader";

type Deck = 'A' | 'B';

export default function Home() {
    const [hasEntered, setHasEntered] = useState(false);
    const [activeDeck, setActiveDeck] = useState<Deck>('A');
    // Track indices for each deck
    const [trackIndexA, setTrackIndexA] = useState(0);
    const [trackIndexB, setTrackIndexB] = useState(1); // Preload next ?

    const [isPlayingA, setIsPlayingA] = useState(false);
    const [isPlayingB, setIsPlayingB] = useState(false);

    const [volume, setVolume] = useState(80);
    // Shared Seek/Time state - effectively monitors the ACTIVE deck
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seekTime, setSeekTime] = useState<number | null>(null);

    const [isCinemaMode, setIsCinemaMode] = useState(false);

    // Crossfader Hook
    const { ratio, fadeTo, isFading } = useCrossfader({
        duration: 5000,
        onFadeComplete: () => {
            console.log("Fade complete. Stopping inactive deck.");
            if (activeDeck === 'A') {
                // We just faded TO A. Stop B.
                setIsPlayingB(false);
            } else {
                // We just faded TO B. Stop A.
                setIsPlayingA(false);
            }
        }
    });

    // Determine effective volumes
    // Volume is 0-100, ratio is 0-1. 
    // Deck A = (1 - ratio) * volume
    // Deck B = ratio * volume
    const volA = (1 - ratio) * volume;
    const volB = ratio * volume;

    // Derived active track for Display info
    const currentTrack = activeDeck === 'A' ? tracks[trackIndexA] : tracks[trackIndexB];

    // Initialize Audio Listener
    // Trigger next track on silence, with a very low threshold and 2s duration
    const { startListening, isListening, volume: audioVolume, error: audioError } = useAudioListener(
        () => {
            console.log("Auto-mixing triggered by audio analysis");
            handleNext();
        },
        0.01, // Threshold
        2000  // Duration
    );

    const handleEnter = async () => {
        setHasEntered(true);
        // Start Deck A
        setIsPlayingA(true);
        setIsPlayingB(false);
        setActiveDeck('A');

        // Attempt to start listening immediately

        // Attempt to start listening immediately
        try {
            await startListening();
        } catch (e) {
            console.warn("Audio listener failed to start:", e);
        }
    };

    const togglePlay = () => {
        if (activeDeck === 'A') setIsPlayingA(!isPlayingA);
        else setIsPlayingB(!isPlayingB);
    };

    const handleNext = () => {
        console.log("Triggering Next Track Transition...");

        // Determine Next Deck
        const nextDeck = activeDeck === 'A' ? 'B' : 'A';

        // Calculate next track index based on current active track
        const currentIdx = activeDeck === 'A' ? trackIndexA : trackIndexB;
        const nextIdx = (currentIdx + 1) % tracks.length;

        // Prepare Next Deck
        if (nextDeck === 'A') {
            setTrackIndexA(nextIdx);
            setIsPlayingA(true);
        } else {
            setTrackIndexB(nextIdx);
            setIsPlayingB(true);
        }

        // Start Crossfade
        setActiveDeck(nextDeck); // Switch "Active" label immediately for Metadata? Or after?
        // Let's switch metadata immediately so user sees what's coming/playing
        fadeTo(nextDeck);
        setSeekTime(null);
    };

    const handlePrev = () => {
        // Simple cut for Prev for now, or just restart?
        // Let's keep logic simple: Fade to previous track
        const currentIdx = activeDeck === 'A' ? trackIndexA : trackIndexB;
        const prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;

        const nextDeck = activeDeck === 'A' ? 'B' : 'A';

        if (nextDeck === 'A') {
            setTrackIndexA(prevIdx);
            setIsPlayingA(true);
        } else {
            setTrackIndexB(prevIdx);
            setIsPlayingB(true);
        }

        setActiveDeck(nextDeck);
        fadeTo(nextDeck);
    };

    // We only want progress updates from the ACTIVE deck to drive the UI
    const handleProgress = (deck: Deck) => (current: number, total: number) => {
        if (deck === activeDeck) {
            setCurrentTime(current);
            setDuration(total);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        const newTime = percentage * duration;

        setSeekTime(newTime);
        // We need to clear it shortly after to allow re-seeking to same spot, 
        // or just rely on newTime typically being slightly different.
        // A better pattern for BackgroundAudio might be to use a timestamp or request ID for seeking.
        // For now, simple value change is likely fine.
        setTimeout(() => setSeekTime(null), 100);
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const toggleCinemaMode = () => {
        setIsCinemaMode(!isCinemaMode);
    };

    if (!hasEntered) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
                    <div className="text-center space-y-2">
                        <TechText animate>System Ready</TechText>
                        <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-fuchsia-glow via-white to-electric-cyan-bright">
                            SARASVATĪ
                        </h1>
                        <p className="text-electric-cyan/60 tracking-[0.5em] text-sm uppercase">. The Cosmic DJ .</p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <NeonButton onClick={handleEnter} className="mt-8 text-xl px-10 py-4" glow>
                            ENTER EXPERIENCE
                        </NeonButton>
                        <p className="text-white/30 text-xs max-w-md text-center mt-2">
                            * Select "This Tab" and "Share Audio" when prompted to enable AI Auto-Mixing.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 transition-opacity duration-1000">
            {/* Audio Source Indicator */}
            <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
                <div className={clsx(
                    "w-2 h-2 rounded-full",
                    isListening ? "bg-green-500 animate-pulse" : "bg-red-500"
                )} />
                <span className="text-xs font-mono text-white/50">
                    {isListening ? "AI LISTENING" : "AI OFFLINE"}
                </span>
            </div>

            <GlassPlayer>
                <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
                    {/* The Canvas was missing! R3F hooks need a Canvas context. */}
                    <div className="w-full h-full">
                        <Canvas>
                            <ambientLight intensity={0.5} />
                            <AudioVisualizer audioVolume={audioVolume} />
                        </Canvas>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 w-full">
                    {/* Video Container - Dynamic Size based on Cinema Mode */}
                    <div
                        className={clsx(
                            "rounded-xl bg-black/50 shadow-inner flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden group transition-all duration-500 ease-in-out",
                            isCinemaMode ? "fixed inset-0 z-50 w-full h-full rounded-none border-none bg-black" : "w-80 h-80 md:w-96 md:h-96"
                        )}
                    >
                        {/* Deck A */}
                        <div className={clsx("absolute inset-0 transition-opacity duration-500", activeDeck === 'A' ? "opacity-100 z-10" : "opacity-0 z-0")}>
                            <BackgroundAudio
                                videoId={tracks[trackIndexA].videoId}
                                isPlaying={isPlayingA}
                                volume={volA}
                                introSkip={tracks[trackIndexA].introSkip}
                                outroSkip={tracks[trackIndexA].outroSkip}
                                disableAutoSkip={isListening}
                                seekTime={activeDeck === 'A' ? seekTime : null}
                                onEnded={handleNext}
                                onProgress={handleProgress('A')}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Deck B */}
                        <div className={clsx("absolute inset-0 transition-opacity duration-500", activeDeck === 'B' ? "opacity-100 z-10" : "opacity-0 z-0")}>
                            <BackgroundAudio
                                videoId={tracks[trackIndexB].videoId}
                                isPlaying={isPlayingB}
                                volume={volB}
                                introSkip={tracks[trackIndexB].introSkip}
                                outroSkip={tracks[trackIndexB].outroSkip}
                                disableAutoSkip={isListening}
                                seekTime={activeDeck === 'B' ? seekTime : null}
                                onEnded={handleNext}
                                onProgress={handleProgress('B')}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Visual Overlay - Only allows clicks if NOT cinema mode (strictly speaking visualizer might block clicks if not careful) */}
                        <div className={clsx(
                            "absolute inset-0 w-full h-full",
                            !isCinemaMode && "pointer-events-none" // Pass clicks to YouTube only in Cinema Mode? Or never?
                            // Actually, let's keep interactions blocked for standard view to keep it clean.
                        )} />
                        {/* Overlay Gradient (Only in non-cinema mode or minimal in cinema) */}
                        <div className={clsx(
                            "absolute inset-0 pointer-events-none transition-opacity duration-300",
                            isCinemaMode ? "opacity-0" : "bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100"
                        )} />

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

                    {/* Progress Bar */}
                    <div
                        className="w-full h-1 bg-white/10 rounded-full mt-6 relative overflow-visible cursor-pointer group/progress"
                        onClick={handleSeek}
                    >
                        {/* Hit Area for easier clicking */}
                        <div className="absolute -top-2 -bottom-2 -left-0 -right-0 bg-transparent z-10" />

                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-fuchsia to-electric-cyan shadow-[0_0_10px_#d946ef] transition-all duration-1000 ease-linear pointer-events-none"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                        {/* Hover Indicator */}
                        <div className="absolute top-0 left-0 h-full w-full opacity-0 group-hover/progress:opacity-20 bg-white transition-opacity duration-200 pointer-events-none" />
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

            <div className="fixed bottom-8 flex gap-8">
                <TechText dimmed>VOL: {volume}%</TechText>
                <TechText dimmed>BPM: 128</TechText>
            </div>

            {/* Cinema Mode Controls Overlay */}
            {isCinemaMode && (
                <div className="fixed bottom-10 left-0 right-0 z-[60] flex justify-center pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl pointer-events-auto flex gap-8 items-center animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="text-left">
                            <h2 className="text-lg font-light text-white">{currentTrack.title}</h2>
                            <p className="text-electric-cyan text-xs tracking-widest">{currentTrack.artist}</p>
                        </div>
                        <PlayerControls
                            isPlaying={activeDeck === 'A' ? isPlayingA : isPlayingB}
                            onPlayPause={togglePlay}
                            onNext={handleNext}
                            onPrev={handlePrev}
                        />
                        <button onClick={toggleCinemaMode} className="text-white/50 hover:text-white">
                            <Minimize2 size={20} />
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
