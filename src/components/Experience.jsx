import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import ParticleSystem from './ParticleSystem'
import Star from './Star'

const Experience = ({ gestureState }) => {
    const starVisible = gestureState === 'FIST';

    return (
        <Canvas
            dpr={[1, 2]}
            gl={{ antialias: false, toneMapping: 0 }}
            camera={{ position: [0, 0, 12], fov: 45 }}
            style={{ background: 'transparent' }} // Ensure transparent
        >
            {/* <color attach="background" args={['#000000']} /> */}

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />

            <group position={[0, -0.5, 0]}>
                <ParticleSystem mode={gestureState === 'IDLE' ? 'EXPLODE' : gestureState} />
                {starVisible && <Star position={[0, 3.2, 0]} />}
            </group>

            <OrbitControls
                enableZoom={true}
                enablePan={false}
                autoRotate={gestureState === 'FIST'}
                autoRotateSpeed={1.0}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.8}
            />

            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={0.2} // Higher threshold = only bright things glow (cleaner)
                    mipmapBlur
                    intensity={1.2} // Slightly lower to avoid washout
                    radius={0.5} // Sharper glow
                    levels={9}
                />
            </EffectComposer>
        </Canvas>
    )
}

export default Experience
