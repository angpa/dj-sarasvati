"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function StarField({ count = 2000, speed = 1 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random initial positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 800;
        const y = (Math.random() - 0.5) * 800;
        const z = (Math.random() - 0.5) * 800;
        temp.push({ x, y, z });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    particles.forEach((particle, i) => {
      // Move star towards camera (positive Z)
      particle.z += 20 * speed * delta * 5; 

      // Reset when too close
      if (particle.z > 400) {
        particle.z = -400;
        particle.x = (Math.random() - 0.5) * 800;
        particle.y = (Math.random() - 0.5) * 800;
      }

      dummy.position.set(particle.x, particle.y, particle.z);
      // Scale based on speed for warp effect (stretch Z)
      const scale = 1.0 + (speed - 1) * 0.5;
      dummy.scale.set(1, 1, scale);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </instancedMesh>
  );
}
