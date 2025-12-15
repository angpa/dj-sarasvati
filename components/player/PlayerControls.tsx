import NeonButton from '../ui/NeonButton';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'; // Assuming lucide-react is available or use SVGs

export default function PlayerControls({
    isPlaying,
    onPlayPause,
    onNext,
    onPrev
}: {
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
}) {
    return (
        <div className="flex items-center gap-6 mt-4">
            <NeonButton onClick={onPrev} variant="secondary" className="px-4 py-2" aria-label="Previous Track">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
            </NeonButton>

            <NeonButton onClick={onPlayPause} variant="primary" className="px-8 py-3 text-lg" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
            </NeonButton>

            <NeonButton onClick={onNext} variant="secondary" className="px-4 py-2" aria-label="Next Track">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
            </NeonButton>
        </div>
    );
}
