import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, ContactShadows, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import ChristmasTree from './Tree';
import Snow from './Snow';
import { THEME } from '../types';

const CameraController = () => {
    useFrame((state) => {
        // Subtle drift for cinematic feel
        const t = state.clock.getElapsedTime();
        state.camera.position.y = 2 + Math.sin(t * 0.1) * 0.5;
    });
    return null;
}

interface SceneProps {
  isTreeShape: boolean;
}

const Scene: React.FC<SceneProps> = ({ isTreeShape }) => {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
      {/* Cinematic Camera */}
      <PerspectiveCamera makeDefault position={[6, 2, 8]} fov={50} />
      <CameraController />
      <OrbitControls 
        autoRotate 
        autoRotateSpeed={isTreeShape ? 0.5 : 0.1} // Slow down rotation when exploded
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.8} 
        minDistance={4}
        maxDistance={15}
      />

      {/* Lighting - Crucial for Luxury Look */}
      <ambientLight intensity={0.2} color={THEME.colors.emerald} />
      <spotLight
        position={[10, 20, 10]}
        angle={0.2}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        color={THEME.colors.champagne}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0044ff" />

      {/* Environment for reflections on Gold balls */}
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Main Objects */}
      <ChristmasTree isTreeShape={isTreeShape} />
      <Snow count={600} />

      {/* Floor Shadows */}
      <ContactShadows opacity={0.6} scale={20} blur={2} far={4} resolution={256} color="#000000" />

      {/* Post Processing for the "Glow" */}
      <EffectComposer disableNormalPass>
        {/* Bloom is the key to the 'Twinkle' effect */}
        <Bloom 
            luminanceThreshold={1.1} // Only very bright things (like the Star emissive) glow
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.02} /> 
      </EffectComposer>

      {/* Background Color */}
      <color attach="background" args={[THEME.colors.deepEmerald]} />
      <fog attach="fog" args={[THEME.colors.deepEmerald, 8, 25]} />
    </Canvas>
  );
};

export default Scene;