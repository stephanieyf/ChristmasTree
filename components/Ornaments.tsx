import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { THEME } from '../types';

interface OrnamentsProps {
  count?: number;
  treeLayers: { bottom: number; height: number; width: number }[];
  isTreeShape: boolean;
}

// "Medium/Light" elements: Shiny Baubles. 
const Ornaments: React.FC<OrnamentsProps> = ({ count = 200, treeLayers, isTreeShape }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // --- Tree Position ---
      const layerIndex = Math.floor(Math.random() * treeLayers.length);
      const layer = treeLayers[layerIndex];
      const hPercent = Math.random();
      const y = layer.bottom + (hPercent * layer.height);
      
      // Radius perfectly on the cone slope surface (1.0)
      const r = layer.width * (1 - hPercent) * 1.0; 
      
      const angle = Math.random() * Math.PI * 2;
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );

      // --- Scatter Position ---
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const scatterR = 8 + Math.random() * 8; 
      
      const scatterPos = new THREE.Vector3(
        scatterR * Math.sin(phi) * Math.cos(theta),
        4 + scatterR * Math.sin(phi) * Math.sin(theta),
        scatterR * Math.cos(phi)
      );

      return { 
        treePos, 
        scatterPos, 
        // Reduced Scale: was 0.12 - 0.30, now 0.08 - 0.18
        scale: 0.08 + Math.random() * 0.1,
        // Mix of Gold, Champagne, and some Red for baubles
        color: Math.random() > 0.8 ? THEME.colors.red : (Math.random() > 0.5 ? THEME.colors.champagne : THEME.colors.gold)
      };
    });
  }, [count, treeLayers]);

  const initialized = useRef(false);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (!initialized.current) {
        data.forEach((d, i) => {
            meshRef.current!.setColorAt(i, new THREE.Color(d.color));
        });
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        initialized.current = true;
    }

    // Medium Speed: Faster than gifts, slower than needles
    const speed = 2.5 * delta; 

    data.forEach((d, i) => {
      meshRef.current!.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      const targetPos = isTreeShape ? d.treePos : d.scatterPos;
      
      dummy.position.lerp(targetPos, speed);
      
      // Constant rotation for shimmer
      dummy.rotation.x += 0.01;
      dummy.rotation.y += 0.01;
      
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        roughness={0.1}
        metalness={1.0}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

export default Ornaments;