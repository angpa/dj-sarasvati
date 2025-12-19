"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

export default function AudioVisualizer({ audioVolume = 0 }: { audioVolume?: number }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            // Rotate the entire group slowly, speed up with volume
            groupRef.current.rotation.y += 0.005 + (audioVolume * 0.05);
            groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    // Base scale + volume impact
    const scale = 2 + (audioVolume * 1.5);

    return (
        <group ref={groupRef}>
            {/* Central "Sun" or Main Core */}
            <Sphere args={[scale, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#000000"
                    emissive="#d946ef"
                    emissiveIntensity={2 + (audioVolume * 4)}
                    roughness={0.1}
                    metalness={1}
                />
            </Sphere>

            {/* Floating Geometries around */}
            {[...Array(6)].map((_, i) => {
                const radius = 8;
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle * 2) * 2;
                const z = Math.sin(angle) * radius;

                return (
                    <FloatingCrystal key={i} position={[x, y, z]} delay={i * 0.5} audioVolume={audioVolume} />
                );
            })}
        </group>
    );
}

function FloatingCrystal({ position, delay, audioVolume }: { position: [number, number, number], delay: number, audioVolume: number }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            // Individual rotation and bobbing
            const time = clock.getElapsedTime();
            ref.current.rotation.x = time * 0.5 + delay + (audioVolume * 2);
            ref.current.rotation.y = time * 0.3 + delay;
            ref.current.position.y = position[1] + Math.sin(time + delay) * (1 + audioVolume * 2);
        }
    });

    return (
        <Box ref={ref} args={[1, 1, 1]} position={position}>
            <meshStandardMaterial
                color="#22d3ee"
                emissive="#06b6d4"
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
                roughness={0}
                metalness={0.8}
            />
        </Box>
    );
}
