"use client";

import { useState } from "react";
import GlassPlayer from "@/components/player/GlassPlayer";
import AudioVisualizer from "@/components/scene/AudioVisualizer";
import NeonButton from "@/components/ui/NeonButton";
import TechText from "@/components/ui/TechText";
import PlayerControls from "@/components/player/PlayerControls";
import { tracks } from "@/data/tracks";
import BackgroundAudio from "@/components/player/BackgroundAudio";
import { Maximize2, Minimize2, Mic } from "lucide-react";
import clsx from "clsx";
import { useAudioListener } from "@/hooks/useAudioListener";

export default function Home() {
    const [hasEntered, setHasEntered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(80);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [seekTime, setSeekTime] = useState<number | null>(null);

    const currentTrack = tracks[currentTrackIndex];

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
        setIsPlaying(true); // Auto-play on enter

        // Attempt to start listening immediately
        try {
            await startListening();
        } catch (e) {
            console.warn("Audio listener failed to start:", e);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
        setSeekTime(null); // Reset seek
    };

    const handlePrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
        setSeekTime(null); // Reset seek
    };

    const handleProgress = (current: number, total: number) => {
        setCurrentTime(current);
        setDuration(total);
        // Reset seekTime once we see that the time has updated close to it?
        // Actually, react-youtube seekTo works best if we just trigger it once.
        // We can pass a changing value (like valid number) to trigger useEffect.
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
                <div className="absolute inset-0 -z-10 opacity-30">
                    <AudioVisualizer audioVolume={audioVolume} />
                </div>
                <div className="flex flex-col items-center text-center space-y-4 w-full">
                    {/* Video Container - Dynamic Size based on Cinema Mode */}
                    <div
                        className={clsx(
                            "rounded-xl bg-black/50 shadow-inner flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden group transition-all duration-500 ease-in-out",
                            isCinemaMode ? "fixed inset-0 z-50 w-full h-full rounded-none border-none bg-black" : "w-80 h-80 md:w-96 md:h-96"
                        )}
                    >
                        <BackgroundAudio
                            videoId={currentTrack.videoId}
                            isPlaying={isPlaying}
                            volume={volume}
                            introSkip={currentTrack.introSkip}
                            outroSkip={currentTrack.outroSkip}
                            disableAutoSkip={isListening} // Disable timer-based skip if AI is listening
                            seekTime={seekTime}
                            onEnded={handleNext}
                            onProgress={handleProgress}
                            className={clsx(
                                "absolute inset-0 w-full h-full",
                                // In cinema mode, allow pointer events for controls if needed, but keeping consistent UI is better.
                                // Let's keep pointer-events-none for standard view to avoid YT UI interference.
                                // Actually, for cinema mode, user might want to see video clearly.
                                !isCinemaMode && "pointer-events-none"
                            )}
                        />
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
                        isPlaying={isPlaying}
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
                            isPlaying={isPlaying}
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
