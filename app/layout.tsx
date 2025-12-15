import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import SceneBackground from "@/components/scene/SceneBackground";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    weight: ["200", "400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
    title: "DJ Sarasvatī | Cosmic Event",
    description: "Immersive Audio Experience",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} ${jetbrainsMono.variable} font-heading antialiased bg-black text-white selection:bg-neon-fuchsia/30`}>
                <SceneBackground />
                <div className="relative z-10 min-h-screen flex flex-col">
                    {children}
                </div>
            </body>
        </html>
    );
}
