import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';

export function Star({ position, mode }) {
    const ref = useRef();

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.5;
            ref.current.rotation.x += delta * 0.2;

            // Pulse scale
            const t = state.clock.getElapsedTime();
            const scale = 1 + Math.sin(t * 2) * 0.2;

            // Visibility transition could be added here if we wanted it to hide in explode mode
            // For now, let's keep it visible in center, or make it disappear
            // User requirement: "Tree top has star". "Explode: particles explode".
            // Let's scale it to 0 when not in TREE mode? 
            // The prompt says "Star on top of tree". Doesn't explicitly say hide it otherwise.
            // But usually nebula doesn't have a star.
            // Let's keep it to verify gesture.
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={2}
                toneMapped={false}
            />
        </mesh>
    );
}

export default Star;
