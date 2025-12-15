# DJ Sarasvatī - Cosmic Synthwave Audio Event

![Cosmic Aesthetic](https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1200&auto=format&fit=crop)

> *"The Cosmic DJ. An immersive audio experience powered by the void."*

**DJ Sarasvatī** is a Next.js web application designed with a high-end "Synthwave / Retro-Futuristic" aesthetic. It features a reactive 3D deep space background, neon accents, and a glassmorphism-based player interface.

## 🌌 Features

-   **Immersive 3D Background**: A "Warp Speed" starfield and reactive geometric visualizers built with `Three.js` and `@react-three/fiber`.
-   **Neon Aesthetics**: Custom Tailwind CSS configuration for glowing fuchsia and cyan accents against a deep void black.
-   **Glassmorphism UI**: High-performance backdrop blur and transparency effects for a premium "HUD" feel.
-   **Post-Processing**: Bloom and Chromatic Aberration effects for that retro-lens look.

## 🛠 Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
-   **3D Graphics**:
    -   [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber): React renderer for Three.js.
    -   [`@react-three/drei`](https://github.com/pmndrs/drei): Useful helpers for R3F.
    -   [`@react-three/postprocessing`](https://github.com/pmndrs/react-postprocessing): Effect composer for Bloom and Glitch effects.
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/angpa/dj-sarasvati.git
    cd dj-sarasvati
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Note: Use --legacy-peer-deps if you encounter version conflicts with R3F
    npm install --legacy-peer-deps
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to enter the void.

## 🎨 Customization

Key style configurations can be found in `tailwind.config.ts`:

-   **Colors**: `cosmic-black`, `neon-fuchsia`, `electric-cyan`.
-   **Fonts**: `Outfit` (Heading) and `JetBrains Mono` (Tech details).
