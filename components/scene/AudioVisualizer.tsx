"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

export default function AudioVisualizer() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            // Rotate the entire group slowly
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
            groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Central "Sun" or Main Core */}
            <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#000000"
                    emissive="#d946ef"
                    emissiveIntensity={2}
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
                    <FloatingCrystal key={i} position={[x, y, z]} delay={i * 0.5} />
                );
            })}
        </group>
    );
}

function FloatingCrystal({ position, delay }: { position: [number, number, number], delay: number }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            // Individual rotation and bobbing
            const time = clock.getElapsedTime();
            ref.current.rotation.x = time * 0.5 + delay;
            ref.current.rotation.y = time * 0.3 + delay;
            ref.current.position.y = position[1] + Math.sin(time + delay) * 1;
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
