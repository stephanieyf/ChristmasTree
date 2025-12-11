import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { THEME } from '../types';
import Ornaments from './Ornaments';
import Needles from './Needles';
import Gifts from './Gifts';
import { Sparkles } from '@react-three/drei';

const Star: React.FC<{ isTreeShape: boolean }> = ({ isTreeShape }) => {
  const starRef = useRef<THREE.Group>(null);
  
  // Define positions
  const treePos = new THREE.Vector3(0, 6.2, 0);
  const scatterPos = new THREE.Vector3(0, 10, -5); 

  useFrame((state, delta) => {
    if (starRef.current) {
      // Rotation
      starRef.current.rotation.y += delta * 0.5;
      
      // Pulse Scale
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
      
      // Position Morph
      const target = isTreeShape ? treePos : scatterPos;
      starRef.current.position.lerp(target, delta * 2);
      
      // Scale Morph
      starRef.current.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), delta * 2);
    }
  });

  return (
    <group ref={starRef} position={[0, 6.2, 0]}>
        <mesh>
            <octahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial
                color={THEME.colors.gold}
                emissive={THEME.colors.gold}
                emissiveIntensity={3} 
                toneMapped={false} 
            />
        </mesh>
        <pointLight intensity={2} distance={5} color={THEME.colors.warmLight} decay={2} />
    </group>
  );
};

interface TreeProps {
  isTreeShape: boolean;
}

const ChristmasTree: React.FC<TreeProps> = ({ isTreeShape }) => {
  // Define tree structure (bottom Y, Height, Radius)
  const layers = useMemo(() => [
    { bottom: 0.5, height: 2.0, width: 2.2 },
    { bottom: 2.0, height: 1.8, width: 1.8 },
    { bottom: 3.5, height: 1.5, width: 1.4 },
    { bottom: 4.8, height: 1.2, width: 1.0 },
  ], []);

  return (
    <group position={[0, -2, 0]}>
      {/* Trunk */}
      <Trunk isTreeShape={isTreeShape} />

      {/* 1. Needles Layer (Points, Very Light weight) */}
      <Needles treeLayers={layers} count={5000} isTreeShape={isTreeShape} />

      {/* 2. Baubles Layer (Spheres, Medium weight) */}
      <Ornaments treeLayers={layers} count={150} isTreeShape={isTreeShape} />
      
      {/* 3. Gifts Layer (Boxes, Heavy weight) */}
      <Gifts treeLayers={layers} count={40} isTreeShape={isTreeShape} />

      {/* The Topper */}
      <Star isTreeShape={isTreeShape} />

      {/* Extra Magic Sparkles - only when tree is formed */}
      {isTreeShape && (
        <Sparkles 
          count={50} 
          scale={6} 
          size={4} 
          speed={0.4} 
          opacity={1} 
          color={THEME.colors.gold}
          position={[0, 3, 0]}
        />
      )}
    </group>
  );
};

const Trunk: React.FC<{ isTreeShape: boolean }> = ({ isTreeShape }) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
      if(mesh.current) {
          const targetScale = isTreeShape ? 1 : 0;
          mesh.current.scale.lerp(new THREE.Vector3(1, targetScale, 1), delta * 3);
      }
  })
  return (
      <mesh ref={mesh} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 1.5, 16]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
  )
}

export default ChristmasTree;