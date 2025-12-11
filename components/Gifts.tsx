import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { THEME } from '../types';

interface GiftsProps {
  count?: number;
  treeLayers: { bottom: number; height: number; width: number }[];
  isTreeShape: boolean;
}

// "Heavy" elements: Gift boxes. Slower inertia.
const Gifts: React.FC<GiftsProps> = ({ count = 40, treeLayers, isTreeShape }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // --- Tree Position ---
      // Gifts sit deeper in the tree or at the bottom
      const layerIndex = Math.floor(Math.random() * treeLayers.length);
      const layer = treeLayers[layerIndex];
      const hPercent = Math.random() * 0.9; // Lower part of layers
      const y = layer.bottom + (hPercent * layer.height);
      
      // Better positioning: slightly closer to surface (0.85) to be visible but nested
      const r = layer.width * (1 - hPercent) * 0.85; 
      
      const angle = Math.random() * Math.PI * 2;
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );
      
      // Randomize orientation for gifts sitting on branches
      const treeRot = new THREE.Euler(
         Math.random() * 0.5, 
         Math.random() * Math.PI * 2, 
         Math.random() * 0.5
      );

      // --- Scatter Position ---
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const scatterR = 6 + Math.random() * 6; // Closer heavy scatter
      const scatterPos = new THREE.Vector3(
        scatterR * Math.sin(phi) * Math.cos(theta),
        3 + scatterR * Math.sin(phi) * Math.sin(theta),
        scatterR * Math.cos(phi)
      );

      // Saturated Colors for Gifts
      const colors = [THEME.colors.red, THEME.colors.gold, "#C41E3A", "#D6AF36"];
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

      return { 
        treePos, 
        treeRot,
        scatterPos, 
        // Reduced Scale: was 0.25 - 0.45, now 0.15 - 0.3
        scale: 0.15 + Math.random() * 0.15, 
        color,
        // Individual random speed factor for "heavy" feel
        inertia: 0.5 + Math.random() * 0.5 
      };
    });
  }, [count, treeLayers]);

  // Init Colors
  const initialized = useRef(false);
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (!initialized.current) {
        data.forEach((d, i) => meshRef.current!.setColorAt(i, d.color));
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        initialized.current = true;
    }

    // Heavy Movement: Slower speed
    const baseSpeed = 1.5 * delta;

    data.forEach((d, i) => {
      meshRef.current!.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      const targetPos = isTreeShape ? d.treePos : d.scatterPos;
      const targetRot = isTreeShape ? d.treeRot : new THREE.Euler(d.treeRot.x + state.clock.getElapsedTime(), d.treeRot.y + state.clock.getElapsedTime(), 0);

      // Apply inertia
      const step = baseSpeed * d.inertia;
      
      dummy.position.lerp(targetPos, step);
      
      // Rotate gifts when flying, stabilize when in tree
      const qTarget = new THREE.Quaternion().setFromEuler(targetRot);
      dummy.quaternion.slerp(qTarget, step);

      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={0.3}
        metalness={0.4}
      />
    </instancedMesh>
  );
};

export default Gifts;