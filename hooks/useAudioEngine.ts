import { useRef, useEffect, useState, useCallback } from 'react';

interface AudioEngineState {
    isReady: boolean;
    isPlaying: boolean;
    volume: number;
    crossfade: number; // 0 (Deck A) to 1 (Deck B)
    deckA: DeckState;
    deckB: DeckState;
}

interface DeckState {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    videoId: string | null;
}

export function useAudioEngine() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<GainNode | null>(null); // Master Gain
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Decks
    const deckA_Ref = useRef<HTMLAudioElement | null>(null);
    const deckB_Ref = useRef<HTMLAudioElement | null>(null);
    const gainA_Ref = useRef<GainNode | null>(null);
    const gainB_Ref = useRef<GainNode | null>(null);

    const [state, setState] = useState<AudioEngineState>({
        isReady: false,
        isPlaying: false,
        volume: 1,
        crossfade: 0,
        deckA: { currentTime: 0, duration: 0, isPlaying: false, videoId: null },
        deckB: { currentTime: 0, duration: 0, isPlaying: false, videoId: null },
    });

    // Initialize Audio Engine
    useEffect(() => {
        if (!typeof window) return;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        // Master Chain
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        destinationRef.current = masterGain;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        masterGain.connect(analyser); // Analyze post-master volume
        analyserRef.current = analyser;

        // Create Decks (HTML Audio Elements are easier to stream than XHR+Buffer)
        const audioA = new Audio();
        audioA.crossOrigin = "anonymous";
        const sourceA = ctx.createMediaElementSource(audioA);
        const gainA = ctx.createGain();
        sourceA.connect(gainA).connect(masterGain);
        deckA_Ref.current = audioA;
        gainA_Ref.current = gainA;

        const audioB = new Audio();
        audioB.crossOrigin = "anonymous";
        const sourceB = ctx.createMediaElementSource(audioB);
        const gainB = ctx.createGain();
        sourceB.connect(gainB).connect(masterGain);
        deckB_Ref.current = audioB;
        gainB_Ref.current = gainB;

        // Set initial crossfade (Deck A active)
        gainA.gain.value = 1;
        gainB.gain.value = 0;

        // Event Listeners for State Updates
        const updateState = () => {
            setState(prev => ({
                ...prev,
                deckA: { ...prev.deckA, currentTime: audioA.currentTime, duration: audioA.duration || 0, isPlaying: !audioA.paused },
                deckB: { ...prev.deckB, currentTime: audioB.currentTime, duration: audioB.duration || 0, isPlaying: !audioB.paused },
            }));
        };

        audioA.addEventListener('timeupdate', updateState);
        audioB.addEventListener('timeupdate', updateState);
        audioA.addEventListener('play', () => { if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume(); updateState(); });
        audioB.addEventListener('play', () => { if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume(); updateState(); });
        audioA.addEventListener('pause', updateState);
        audioB.addEventListener('pause', updateState);

        setState(prev => ({ ...prev, isReady: true }));

        return () => {
            ctx.close();
            audioA.remove();
            audioB.remove();
        };
    }, []);

    // Methods
    const loadTrack = useCallback(async (deck: 'A' | 'B', videoId: string) => {
        try {
            const res = await fetch(`/api/stream?videoId=${videoId}`);
            if (!res.ok) throw new Error("Stream fetch failed");
            const data = await res.json();

            const audio = deck === 'A' ? deckA_Ref.current : deckB_Ref.current;
            if (audio) {
                audio.src = data.url;
                audio.load();
                setState(prev => ({
                    ...prev,
                    [deck === 'A' ? 'deckA' : 'deckB']: { ...prev[deck === 'A' ? 'deckA' : 'deckB'], videoId }
                }));
            }
        } catch (e) {
            console.error("Failed to load track:", e);
        }
    }, []);

    const play = useCallback(async (deck: 'A' | 'B') => {
        const audio = deck === 'A' ? deckA_Ref.current : deckB_Ref.current;
        if (audio) {
            try {
                // Resume context if needed
                if (audioContextRef.current?.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
                await audio.play();
            } catch (error) {
                console.error(`Error playing Deck ${deck}:`, error);
            }
        }
    }, []);

    const pause = useCallback((deck: 'A' | 'B') => {
        const audio = deck === 'A' ? deckA_Ref.current : deckB_Ref.current;
        if (audio) audio.pause();
    }, []);

    const setCrossfade = useCallback((value: number) => {
        // value 0 = Deck A, 1 = Deck B
        if (!gainA_Ref.current || !gainB_Ref.current) return;

        // Equal Power Crossfade curve (optional, using linear for now as requested)
        // Linear:
        const clamped = Math.max(0, Math.min(1, value));

        // Preventing rapid volume jumps
        const now = audioContextRef.current?.currentTime || 0;
        gainA_Ref.current.gain.setTargetAtTime(1 - clamped, now, 0.1);
        gainB_Ref.current.gain.setTargetAtTime(clamped, now, 0.1);

        setState(prev => ({ ...prev, crossfade: clamped }));
    }, []);

    // Beat Detection
    const [beat, setBeat] = useState(false);

    const analyzeBeat = useCallback(() => {
        if (!analyserRef.current) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Analyze sub-bass (first 10 bins, approx 0-200Hz depending on sample rate/fft)
        if (dataArray && dataArray.length > 0) {
            const lowEnd = dataArray.slice(0, 10);
            const avgLow = lowEnd.reduce((a, b) => a + b, 0) / lowEnd.length;

            // Dynamic threshold or fixed for now as per request > 210
            if (avgLow > 210) {
                setBeat(true);
                setTimeout(() => setBeat(false), 100);
            }
        }
        requestAnimationFrame(analyzeBeat);
    }, []);

    useEffect(() => {
        if (state.isReady) {
            analyzeBeat();
        }
    }, [state.isReady, analyzeBeat]);

    return {
        ...state,
        loadTrack,
        play,
        pause,
        setCrossfade,
        analyser: analyserRef.current,
        beat // Export beat state
    };
}
