import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioListenerState {
    isListening: boolean;
    volume: number; // 0 to 1
    hasPermission: boolean;
    error: string | null;
}

interface AudioListenerControls {
    startListening: () => Promise<void>;
    stopListening: () => void;
}

export function useAudioListener(
    onSilenceDetected?: () => void,
    silenceThreshold: number = 0.02, // Very low volume threshold
    silenceDuration: number = 2000 // Time in ms below threshold to trigger
): AudioListenerState & AudioListenerControls {
    const [state, setState] = useState<AudioListenerState>({
        isListening: false,
        volume: 0,
        hasPermission: false,
        error: null,
    });

    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const silenceStartRef = useRef<number | null>(null);

    const stopListening = useCallback(() => {
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        setState(prev => ({ ...prev, isListening: false, volume: 0 }));
    }, []);

    const analyzeAudio = useCallback(() => {
        if (!analyserRef.current || !state.isListening) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate RMS (Volume)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVolume = average / 255; // Normalize to 0-1

        setState(prev => ({ ...prev, volume: normalizedVolume }));

        // Check for silence / fade out
        if (normalizedVolume < silenceThreshold) {
            if (silenceStartRef.current === null) {
                silenceStartRef.current = Date.now();
            } else {
                const elapsed = Date.now() - silenceStartRef.current;
                if (elapsed > silenceDuration) {
                    console.log("🔊 Silence/Fade-out detected! Triggering mix...");
                    silenceStartRef.current = null; // Reset
                    if (onSilenceDetected) onSilenceDetected();
                }
            }
        } else {
            silenceStartRef.current = null;
        }

        rafIdRef.current = requestAnimationFrame(analyzeAudio);
    }, [state.isListening, silenceThreshold, silenceDuration, onSilenceDetected]);

    // Re-trigger analysis loop when listening state changes
    useEffect(() => {
        if (state.isListening && !rafIdRef.current) {
            analyzeAudio();
        }
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [state.isListening, analyzeAudio]);

    const startListening = useCallback(async () => {
        try {
            // Request screen capture with audio
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true, // Required to get audio in most browsers
                audio: true,
                selfBrowserSurface: "include", // Explicitly allow capturing the current tab
                preferCurrentTab: true, // Hint to browser to prioritize current tab
            } as any); // Cast to any because TS might not have these experimental types yet

            // If user didn't share audio, we might get a track with no audio or just video
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error("No audio track found. Please ensure 'Share Tab Audio' is checked.");
            }

            streamRef.current = stream;

            // Handle stream ending (user stops sharing)
            stream.getVideoTracks()[0].onended = () => {
                stopListening();
            };

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            source.connect(analyser);
            // connect to destination if we want to hear it too? 
            // Usually getDisplayMedia mutes the tab locally to avoid feedback loop if it's the same tab.
            // But if we are capturing the tab, the audio is already playing. 
            // We DO NOT want to connect to destination (speakers) as it will cause echo/feedback.

            setState(prev => ({
                ...prev,
                isListening: true,
                hasPermission: true,
                error: null
            }));

        } catch (err: any) {
            console.error("Error starting audio listener:", err);
            setState(prev => ({
                ...prev,
                isListening: false,
                hasPermission: false,
                error: err.message || "Failed to access audio."
            }));
        }
    }, [stopListening]);

    return {
        ...state,
        startListening,
        stopListening
    };
}
