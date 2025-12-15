import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "cosmic-black": "#000000",
                "void-purple": "#030008",
                "neon-fuchsia": {
                    DEFAULT: "#d946ef",
                    glow: "#f0abfc",
                },
                "electric-cyan": {
                    DEFAULT: "#06b6d4",
                    bright: "#22d3ee",
                },
            },
            fontFamily: {
                heading: ["var(--font-outfit)", "sans-serif"],
                mono: ["var(--font-jetbrains-mono)", "monospace"],
            },
            backgroundImage: {
                "gradient-cosmic": "linear-gradient(to right, #f0abfc, #ffffff, #22d3ee)",
            },
            boxShadow: {
                "neon-pink": "0 0 30px rgba(244, 114, 182, 0.3)",
                "neon-pink-strong": "0 0 50px rgba(244, 114, 182, 0.6)",
                "neon-cyan": "0 0 30px rgba(34, 211, 238, 0.3)",
            },
            animation: {
                pulse: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "spin-slow": "spin 20s linear infinite",
            },
        },
    },
    plugins: [],
};
export default config;
