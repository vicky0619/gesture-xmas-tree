import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';

// FIXED: Variable name mismatch (ref vs meshRef) which might cause crash
export function Star({ position, mode }) {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            meshRef.current.rotation.x += delta * 0.2;

            // Pulse scale
            const t = state.clock.getElapsedTime();
            const scale = 1 + Math.sin(t * 2) * 0.2;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={3}
                toneMapped={false}
            />
        </mesh>
    );
}

export default Star;
