"use client";

import { useState } from "react";
import GlassPlayer from "@/components/player/GlassPlayer";
import NeonButton from "@/components/ui/NeonButton";
import TechText from "@/components/ui/TechText";
import PlayerControls from "@/components/player/PlayerControls";
import { tracks } from "@/data/tracks";
import BackgroundAudio from "@/components/player/BackgroundAudio";

export default function Home() {
    const [hasEntered, setHasEntered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(80);

    const currentTrack = tracks[currentTrackIndex];

    const handleEnter = () => {
        setHasEntered(true);
        setIsPlaying(true); // Auto-play on enter
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
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

                    <NeonButton onClick={handleEnter} className="mt-8 text-xl px-10 py-4" glow>
                        ENTER EXPERIENCE
                    </NeonButton>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 transition-opacity duration-1000">
            {/* Hidden Audio Player */}
            <BackgroundAudio
                videoId={currentTrack.videoId}
                isPlaying={isPlaying}
                volume={volume}
                introSkip={currentTrack.introSkip}
                onEnded={handleNext}
            />

            <div className="w-full max-w-4xl flex flex-col items-center gap-2 mb-8">
                <div className="flex justify-between w-full px-4 text-xs text-white/30 font-mono">
                    <span>SESS: 0X92F</span>
                    <span>FREQ: 432HZ</span>
                </div>
            </div>

            <GlassPlayer>
                <div className="flex flex-col items-center text-center space-y-4 w-full">
                    <div className="w-64 h-64 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-inner flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300')] bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110" />
                        <div className="w-16 h-1 bg-white/20 rounded-full animate-pulse" />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-3xl font-light tracking-wide text-white">{currentTrack.title}</h2>
                        <p className="text-electric-cyan font-mono text-sm tracking-widest">ARTIST: {currentTrack.artist}</p>
                    </div>

                    <div className="w-full h-1 bg-white/10 rounded-full mt-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-neon-fuchsia to-electric-cyan shadow-[0_0_10px_#d946ef]" />
                    </div>

                    <div className="flex justify-between w-full text-xs font-mono text-white/50 mt-1">
                        <span>01:23</span>
                        <span>04:44</span>
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
        </main>
    );
}
