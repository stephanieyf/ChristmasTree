import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Snow: React.FC<{ count?: number }> = ({ count = 400 }) => {
  const mesh = useRef<THREE.Points>(null);
  
  // Create random particles
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 25;
      const y = (Math.random() - 0.5) * 20 + 5;
      const z = (Math.random() - 0.5) * 25;
      temp[i * 3] = x;
      temp[i * 3 + 1] = y;
      temp[i * 3 + 2] = z;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    // Animate snow falling
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      let y = positions[i * 3 + 1];
      
      // Fall down
      y -= 0.02 + Math.random() * 0.01;
      
      // Reset if below floor
      if (y < -5) {
        y = 15;
        // Randomize X/Z again for variety
        positions[i * 3] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      }
      
      positions[i * 3 + 1] = y;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Gentle rotation of the whole system
    mesh.current.rotation.y += 0.001;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;