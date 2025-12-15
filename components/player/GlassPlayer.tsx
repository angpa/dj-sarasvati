import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassPlayerProps {
    children: ReactNode;
    className?: string;
}

export default function GlassPlayer({ children, className }: GlassPlayerProps) {
    return (
        <div
            className={cn(
                "relative w-full max-w-2xl p-8 rounded-[2rem]",
                "bg-black/30 backdrop-blur-xl",
                "border border-white/10",
                "shadow-[0_0_60px_rgba(0,0,0,0.8)]",
                "flex flex-col items-center gap-6",
                className
            )}
        >
            {/* Decorative top line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-neon-fuchsia to-transparent opacity-50" />

            {children}
        </div>
    );
}
