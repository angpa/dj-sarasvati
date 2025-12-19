import { useState, useCallback, useRef, useEffect } from 'react';

export type CrossfadeDirection = 'TO_A' | 'TO_B' | 'NONE';

interface UseCrossfaderProps {
    duration?: number; // Duration of fade in ms
    onFadeComplete?: () => void;
}

export function useCrossfader({ duration = 5000, onFadeComplete }: UseCrossfaderProps = {}) {
    const [ratio, setRatio] = useState(0); // 0 = Deck A, 1 = Deck B
    const [isFading, setIsFading] = useState(false);
    const [direction, setDirection] = useState<CrossfadeDirection>('NONE');

    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);
    const onCompleteRef = useRef(onFadeComplete);

    // Keep callback ref fresh
    useEffect(() => {
        onCompleteRef.current = onFadeComplete;
    }, [onFadeComplete]);

    const fadeTo = useCallback((target: 'A' | 'B') => {
        setIsFading(true);
        setDirection(target === 'A' ? 'TO_A' : 'TO_B');
        startTimeRef.current = performance.now();

        const startRatio = target === 'A' ? 1 : 0; // If fading to A, we start at B (1)
        // Ideally we should start from *current* ratio if interrupting, but for now simple swap.
        // Actually, if we are already at 0 (A), calling fadeTo A should do nothing? 
        // Let's assume we always cross from one to the other fully.

        const animate = (now: number) => {
            if (!startTimeRef.current) return;

            const elapsed = now - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // If Target A (0), we go from Current -> 0
            // If Target B (1), we go from Current -> 1
            // Simple linear fade:
            const newRatio = target === 'B' ? progress : (1 - progress);

            setRatio(newRatio);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setIsFading(false);
                setDirection('NONE');
                startTimeRef.current = null;
                if (onCompleteRef.current) onCompleteRef.current();
            }
        };

        rafRef.current = requestAnimationFrame(animate);
    }, [duration]);

    // Force set (for checking or instant cuts)
    const setCrossfader = useCallback((val: number) => {
        setRatio(Math.max(0, Math.min(1, val)));
    }, []);

    return {
        ratio,       // 0 (A) to 1 (B)
        isFading,
        direction,
        fadeTo,
        setCrossfader
    };
}
