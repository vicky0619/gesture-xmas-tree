import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 3000;
const DUMMY = new THREE.Object3D();
const COLOR_GOLD = new THREE.Color('#FFD700');
const COLOR_RED = new THREE.Color('#FF0000');
const COLOR_EMERALD = new THREE.Color('#50C878');
const COLORS = [COLOR_GOLD, COLOR_RED, COLOR_EMERALD];

const ParticleSystem = ({ mode }) => {
    // Two meshes: Cubes and Spheres
    const cubesRef = useRef();
    const spheresRef = useRef();

    // Generate stable random data
    const particles = useMemo(() => {
        const data = [];
        for (let i = 0; i < COUNT; i++) {
            // Explode Target: Sphere distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 3 + Math.random() * 4; // Radius 3 to 7
            const explodeX = r * Math.sin(phi) * Math.cos(theta);
            const explodeY = r * Math.sin(phi) * Math.sin(theta);
            const explodeZ = r * Math.cos(phi);

            // Tree Target: Conical Spiral
            // Height from -3 to 3 (Total h=6)
            const h = (Math.random() * 6) - 3;
            const treeY = h;
            // Radius depends on height. Bottom (y=-3) -> R=2.5. Top (y=3) -> R=0.1
            const normalizedH = (h + 3) / 6; // 0 to 1
            const spiralR = (1 - normalizedH) * 2.5 + 0.2;
            const spiralTheta = h * 5 + Math.random() * 0.5; // Spiral tightness
            const treeX = spiralR * Math.cos(spiralTheta);
            const treeZ = spiralR * Math.sin(spiralTheta);

            // Assign color randomly
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];

            // Random scales
            const scale = 0.05 + Math.random() * 0.1;

            data.push({
                start: new THREE.Vector3(explodeX, explodeY, explodeZ), // Initial state
                treePos: new THREE.Vector3(treeX, treeY, treeZ),
                explodePos: new THREE.Vector3(explodeX, explodeY, explodeZ),
                currentPos: new THREE.Vector3(explodeX, explodeY, explodeZ), // Start exploded
                color: color,
                scale: scale,
                speed: 0.02 + Math.random() * 0.05,
                type: Math.random() > 0.5 ? 'CUBE' : 'SPHERE', // 50/50 split
                rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
            });
        }
        return data;
    }, []);

    useFrame((state, delta) => {
        // We will update both meshes each frame
        // Split indices? No, we have logic in loop to pick mesh
        // Actually, InstancedMesh API requires us to index 0..N per mesh used.
        // So we need to separate particles into two buckets: Cubes and Spheres arrays.
        // But doing it dynamically is hard.
        // Simplified: Just use ONE mesh (Spheres) OR make two useMemos.
        // Let's stick to user request "Small balls + small cubes".
        // I will split the data into two arrays inside useMemo, but here I have one array.
        // I will re-architect useMemo below to return { cubes: [], spheres: [] }
    });

    return (
        <group>
            <SubSystem data={particles.filter(p => p.type === 'CUBE')} geometry="box" mode={mode} />
            <SubSystem data={particles.filter(p => p.type === 'SPHERE')} geometry="sphere" mode={mode} />
        </group>
    );
};

const SubSystem = ({ data, geometry, mode }) => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        let targetVectorName = mode === 'FIST' ? 'treePos' : 'explodePos';
        // Add subtle rotation to the whole group?
        // Let's rotate individual particles or move them.

        // Time for Nebula rotation
        const t = state.clock.getElapsedTime();

        data.forEach((particle, i) => {
            // Determine Target
            const target = particle[targetVectorName];

            // Logic for "Explode" movement:
            // If explode, add some rotation/orbiting to make it a "Nebula" (swirly)
            let tx = target.x;
            let ty = target.y;
            let tz = target.z;

            if (mode === 'OPEN') {
                // Swirl effect
                const angle = t * 0.2;
                const rx = tx * Math.cos(angle) - tz * Math.sin(angle);
                const rz = tx * Math.sin(angle) + tz * Math.cos(angle);
                tx = rx;
                tz = rz;
            }

            // Lerp current position to target
            // Use 'damp' like smoothing
            // particle.currentPos.lerp(tempVec, particle.speed); 
            // We need to lerp x,y,z manually to avoid creating Vector3 per frame? 
            // particle.currentPos is reusable

            const lerpFactor = mode === 'FIST' ? 0.05 : 0.03; // Faster snap to tree

            particle.currentPos.x += (tx - particle.currentPos.x) * lerpFactor;
            particle.currentPos.y += (ty - particle.currentPos.y) * lerpFactor;
            particle.currentPos.z += (tz - particle.currentPos.z) * lerpFactor;

            DUMMY.position.set(
                particle.currentPos.x,
                particle.currentPos.y,
                particle.currentPos.z
            );

            // Rotate the particle itself
            DUMMY.rotation.x += delta * particle.speed;
            DUMMY.rotation.y += delta * particle.speed;

            DUMMY.scale.setScalar(particle.scale);
            DUMMY.updateMatrix();
            meshRef.current.setMatrixAt(i, DUMMY.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    // Set colors once on mount (optimized)
    useEffect(() => {
        if (meshRef.current) {
            data.forEach((particle, i) => {
                meshRef.current.setColorAt(i, particle.color);
            });
            meshRef.current.instanceColor.needsUpdate = true;
        }
    }, [data]);

    return (
        <instancedMesh ref={meshRef} args={[null, null, data.length]}>
            {geometry === 'box' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[1, 8, 8]} />}
            <meshBasicMaterial
                toneMapped={false}
            />
        </instancedMesh>
    );
};

export default ParticleSystem;
