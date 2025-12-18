import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// CRITICAL FIX: Reduced count to prevent GPU overload
const COUNT = 1200;
const DUMMY = new THREE.Object3D();
const POS = new THREE.Vector3();
const VEL = new THREE.Vector3();
const FORCE = new THREE.Vector3();

// Colors: Gold, Red, Emerald (Premium Palette)
const COLOR_PALETTE = [
    new THREE.Color('#F8F0E3'), // Cream Gold
    new THREE.Color('#FFD700'), // Pure Gold
    new THREE.Color('#C41E3A'), // Cardinal Red
    new THREE.Color('#50C878'), // Emerald
];

const ParticleSystem = ({ mode }) => {
    const meshRef = useRef();
    const prevMode = useRef(mode);

    const particles = useMemo(() => {
        const data = [];
        for (let i = 0; i < COUNT; i++) {
            // 1. NEBULA POS (Open/Explode State)
            const r = Math.pow(Math.random(), 3) * 6 + 1;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            const nebulaX = r * Math.sin(phi) * Math.cos(theta);
            const nebulaY = r * Math.sin(phi) * Math.sin(theta);
            const nebulaZ = r * Math.cos(phi);

            // 2. TREE POS (Fist State) -> Layered Conical
            const levels = 15;
            const levelIdx = Math.floor(Math.random() * levels);
            const levelHeight = (levelIdx / (levels - 1)) * 6 - 3;
            const normalizedH = (levelHeight + 3) / 6;
            const coneR = (1 - normalizedH) * 2.8;
            const ringTheta = Math.random() * Math.PI * 2;
            const layerJitterY = (Math.random() - 0.5) * 0.3;

            const treeX = coneR * Math.cos(ringTheta);
            const treeY = levelHeight + layerJitterY;
            const treeZ = coneR * Math.sin(ringTheta);

            data.push({
                pos: new THREE.Vector3(nebulaX, nebulaY, nebulaZ),
                vel: new THREE.Vector3(0, 0, 0),
                nebulaTarget: new THREE.Vector3(nebulaX, nebulaY, nebulaZ),
                treeTarget: new THREE.Vector3(treeX, treeY, treeZ),
                color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
                scale: Math.random() * 0.12 + 0.05,
                mass: 1 + Math.random(),
                drag: 0.9 + Math.random() * 0.05,
            });
        }
        return data;
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Clamp Delta
        const dt = Math.min(delta, 0.1);
        const t = state.clock.getElapsedTime();
        const isTree = mode === 'FIST';
        const isTransition = prevMode.current !== mode;

        meshRef.current.rotation.y += 0.002;

        particles.forEach((p, i) => {
            // SAFETY: NaN Reset
            if (isNaN(p.pos.x)) { p.pos.set(0, 0, 0); p.vel.set(0, 0, 0); }

            // --- HYBRID ENGINE ---
            // MODE A: TREE (Lerp - CRASH PROOF)
            // We use simple linear interpolation for the "Suction" to guarantee stability.
            if (isTree) {
                // Eliminate velocity influence when switching to Tree
                p.vel.multiplyScalar(0.9); // Rapidly kill momentum

                // Direct Lerp: Move 5% of the way to target per frame
                // This creates an "Zeno's Paradox" exponential slide -> looks like suction
                p.pos.lerp(p.treeTarget, 0.05);

                // Add tiny jitter for "life"
                if (Math.random() > 0.9) {
                    p.pos.x += (Math.random() - 0.5) * 0.01;
                    p.pos.y += (Math.random() - 0.5) * 0.01;
                    p.pos.z += (Math.random() - 0.5) * 0.01;
                }

            }
            // MODE B: EXPLODE (Physics - Controlled Chaos)
            else {
                FORCE.set(0, 0, 0);

                // Impulse on Start
                if (isTransition && (mode === 'OPEN' || mode === 'EXPLODE')) {
                    const dir = p.pos.clone().normalize();
                    if (dir.lengthSq() === 0) dir.set(0, 1, 0);
                    p.vel.add(dir.multiplyScalar(0.5));
                }

                // Nebula Attraction
                POS.copy(p.nebulaTarget).sub(p.pos);
                FORCE.addScaledVector(POS, 0.2);

                // Vortex
                const vortexStrength = 0.5;
                FORCE.x += -p.pos.z * vortexStrength;
                FORCE.z += p.pos.x * vortexStrength;

                // Integrate
                VEL.addScaledVector(FORCE, dt / p.mass);
                VEL.multiplyScalar(p.drag);
                VEL.clampLength(0, 1.5); // Speed Limit

                p.pos.add(VEL);
            }

            // SAFETY: Bounds Limit
            if (p.pos.lengthSq() > 5000) {
                p.pos.copy(p.nebulaTarget);
                p.vel.set(0, 0, 0);
            }

            DUMMY.position.copy(p.pos);
            // Pulse logic
            const pulse = 1 + Math.sin(t * 3 + i) * 0.2;
            DUMMY.scale.setScalar(p.scale * pulse);
            DUMMY.updateMatrix();
            meshRef.current.setMatrixAt(i, DUMMY.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        prevMode.current = mode;
    });

    useEffect(() => {
        if (meshRef.current) {
            particles.forEach((p, i) => {
                meshRef.current.setColorAt(i, p.color);
            });
            meshRef.current.instanceColor.needsUpdate = true;
        }
    }, [particles]);

    return (
        <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial toneMapped={false} color="#FFFFFF" />
        </instancedMesh>
    );
};

export default ParticleSystem;
