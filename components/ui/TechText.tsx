import { HTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TechTextProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    dimmed?: boolean;
    animate?: boolean;
}

export default function TechText({
    children,
    className,
    dimmed = false,
    animate = false,
    ...props
}: TechTextProps) {
    return (
        <span
            className={cn(
                "font-mono text-xs tracking-widest uppercase",
                dimmed ? "text-white/40" : "text-electric-cyan",
                animate && "animate-pulse",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
