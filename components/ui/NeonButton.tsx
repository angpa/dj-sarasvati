import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    glow?: boolean;
}

export default function NeonButton({
    children,
    className,
    variant = 'primary',
    glow = true,
    ...props
}: NeonButtonProps) {
    const baseStyles = "relative px-6 py-2 rounded-full font-heading font-bold transition-all duration-300 ease-out border uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-black/50 border-neon-fuchsia text-white hover:bg-neon-fuchsia hover:text-black hover:shadow-neon-pink-strong",
        secondary: "bg-black/50 border-electric-cyan text-white hover:bg-electric-cyan hover:text-black hover:shadow-neon-cyan",
        danger: "bg-black/50 border-red-500 text-white hover:bg-red-500 hover:text-black hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]",
    };

    const glowStyles = glow ? (
        variant === 'primary' ? 'shadow-neon-pink' :
            variant === 'secondary' ? 'shadow-neon-cyan' : ''
    ) : '';

    return (
        <button
            className={cn(baseStyles, variants[variant], glowStyles, className)}
            {...props}
        >
            {children}
        </button>
    );
}
