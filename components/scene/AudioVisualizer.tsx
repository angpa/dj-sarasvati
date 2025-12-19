"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Box, Icosahedron } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing";

// Helper to get average volume from analyser
const getAverageVolume = (analyser: AnalyserNode | null, dataArray: Uint8Array) => {
    if (!analyser || !dataArray) return 0;
    try {
        analyser.getByteFrequencyData(dataArray as any);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return dataArray.length > 0 ? sum / dataArray.length : 0; // 0-255
    } catch (e) {
        return 0;
    }
};

export default function AudioVisualizer({ analyser }: { analyser: AnalyserNode | null }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringsRef = useRef<THREE.Group>(null);

    // Data array for frequency analysis
    const dataArray = useMemo(() => {
        return new Uint8Array(analyser ? analyser.frequencyBinCount : 128);
    }, [analyser]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Calculate volume
        let volume = 0;
        if (analyser) {
            volume = getAverageVolume(analyser, dataArray); // 0-255
        }

        // Normalized volume 0-1 (approx)
        const normVol = volume / 100;

        if (meshRef.current) {
            // Pulse based on real volume
            const scale = 2 + normVol * 1.5;
            meshRef.current.scale.setScalar(scale);
            meshRef.current.rotation.x = time * 0.5;
            meshRef.current.rotation.y = time * 0.3;
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + normVol * 4;
        }

        if (ringsRef.current) {
            ringsRef.current.rotation.z = time * 0.1;
            ringsRef.current.children.forEach((child, i) => {
                const ring = child as THREE.Mesh;
                // Add wave effect to rings
                // const z = Math.sin(time * 2 + i) * normVol * 2;
                // ring.position.z = z;

                // Distort rings based on volume
                ring.scale.x = 1 + Math.sin(time * 2 + i) * 0.1 + (normVol * 0.5);
                ring.scale.z = 1 + Math.cos(time * 2 + i) * 0.1 + (normVol * 0.5);

                // Color shift based on intensity
                (ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + normVol * 2;
            });
        }
    });

    return (
        <>
            <group>
                <Sphere ref={meshRef} args={[1, 32, 32]}>
                    <meshStandardMaterial
                        color="#000000"
                        emissive="#d946ef"
                        emissiveIntensity={2}
                        roughness={0.1}
                        metalness={1}
                    />
                </Sphere>

                <group ref={ringsRef}>
                    {[...Array(3)].map((_, i) => (
                        <Box key={i} args={[3.5 + i * 1.5, 0.1, 3.5 + i * 1.5]} rotation={[0.5, 0, 0]}>
                            <meshStandardMaterial
                                color="#ff00ff"
                                emissive="#00ffff"
                                emissiveIntensity={0.5}
                                transparent
                                opacity={0.3}
                            />
                        </Box>
                    ))}
                </group>

                {/* Particles */}
                <FloatingCrystals analyser={analyser} dataArray={dataArray} />
            </group>

            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={2.5} />
                <Noise opacity={0.05} />
                <ChromaticAberration offset={[0.002, 0.002] as any} />
            </EffectComposer>
        </>
    );
}

function FloatingCrystals({ analyser, dataArray }: { analyser: AnalyserNode | null, dataArray: Uint8Array }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        let volume = 0;
        if (analyser) {
            // We reuse the dataArray from parent but it might be updated already? 
            // Better to re-calculate or accept that it's shared buffer.
            // For simplicity, re-calculate here is fine as it's cheap sum loop.
            // Actually, we can just pass the volume if we calculated it in parent, but passing props is cheaper than context.
            try {
                if (dataArray && dataArray.length > 0) {
                    analyser.getByteFrequencyData(dataArray as any);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    volume = (sum / dataArray.length) / 100;
                }
            } catch (e) { }
        }

        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.1;
            groupRef.current.children.forEach((child, i) => {
                const radius = 8;
                const angle = (i / 6) * Math.PI * 2;
                const yBase = Math.sin(angle * 2) * 2;

                const y = yBase + Math.sin(time + i * 10) * (1 + volume * 2);
                child.position.y = y;

                (child as THREE.Mesh).rotation.x = time * 0.5 + i;
                (child as THREE.Mesh).rotation.y = time * 0.3;
            });
        }
    });

    return (
        <group ref={groupRef}>
            {[...Array(6)].map((_, i) => {
                const radius = 8;
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <Box key={i} args={[1, 1, 1]} position={[x, 0, z]}>
                        <meshStandardMaterial
                            color="#22d3ee"
                            emissive="#06b6d4"
                            emissiveIntensity={0.5}
                            transparent
                            opacity={0.8}
                        />
                    </Box>
                )
            })}
        </group>
    );
}
