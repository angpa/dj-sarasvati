"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from 'postprocessing';
import StarField from "./StarField";
import AudioVisualizer from "./AudioVisualizer";

export default function SceneBackground() {
    return (
        <div className="fixed inset-0 z-0 bg-cosmic-black pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 75 }}
                gl={{ antialias: false, alpha: false }}
                dpr={[1, 2]} // Optimization for varying pixel ratios
            >
                <color attach="background" args={['#030008']} />

                {/* Ambient Light for base visibility */}
                <ambientLight intensity={0.5} />
                {/* Point Lights for accents */}
                <pointLight position={[10, 10, 10]} intensity={1} color="#f0abfc" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#22d3ee" />

                <StarField count={500} speed={1.5} />
                <AudioVisualizer />

                {/* <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.2}
                        mipmapBlur
                        intensity={1.5}
                        radius={0.8}
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL} // Use blend mode if needed
                        offset={[0.002, 0.002]} // RGB shift
                    />
                    <Noise opacity={0.05} />
                </EffectComposer> */}
            </Canvas>
        </div>
    );
}
