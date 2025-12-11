import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { THEME } from '../types';

interface NeedlesProps {
  count?: number;
  treeLayers: { bottom: number; height: number; width: number }[];
  isTreeShape: boolean;
}

// Custom Shader for the "Magical Needle" effect
const needleVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Breathing/Twinkle effect based on time and position
    float breath = 1.0 + 0.4 * sin(uTime * 3.0 + position.x * 2.0 + position.y);
    
    // Size attenuation
    gl_PointSize = aScale * uPixelRatio * (60.0 / -mvPosition.z) * breath;
    
    // Slight opacity fade based on breath for extra twinkle
    vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + position.z);
  }
`;

const needleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Soft circular particle
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Glow from center
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

const Needles: React.FC<NeedlesProps> = ({ count = 6000, treeLayers, isTreeShape }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Use a ref for the shader uniforms to update time
  const uniforms = useRef({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  });

  // 1. Generate Data
  const { positions, colors, scales, targetData } = useMemo(() => {
    const posArray = new Float32Array(count * 3);
    const colArray = new Float32Array(count * 3);
    const scaleArray = new Float32Array(count);
    
    const targets = []; // Store targets in plain JS objects for CPU lerping

    const colorGreen = new THREE.Color(THEME.colors.emerald);
    const colorGold = new THREE.Color(THEME.colors.gold);
    const colorRed = new THREE.Color(THEME.colors.red);
    const colorDeep = new THREE.Color(THEME.colors.deepEmerald);

    for (let i = 0; i < count; i++) {
      // --- Tree Shape Calculation ---
      const layerIndex = Math.floor(Math.random() * treeLayers.length);
      const layer = treeLayers[layerIndex];
      const hPercent = Math.random(); // 0 to 1
      const y = layer.bottom + (hPercent * layer.height);
      const rBase = layer.width * (1 - hPercent);
      
      // TIGHTER DISTRIBUTION: 
      // Bias towards the outer shell for better shape definition (0.8 to 1.1)
      // instead of widely scattered.
      const r = rBase * (0.8 + Math.random() * 0.3); 
      
      const theta = Math.random() * Math.PI * 2;

      const treePos = new THREE.Vector3(
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
      );

      // --- Scatter Shape Calculation ---
      // Distribute in a large sphere
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * v - 1);
      const span = 2 * Math.PI * u;
      const radius = 10 + Math.random() * 10; // Wide scatter

      const scatterPos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(span),
        5 + radius * Math.sin(phi) * Math.sin(span), // Offset center vertically
        radius * Math.cos(phi)
      );

      // --- Color Logic ---
      // 70% Deep Green/Emerald, 15% Gold, 15% Red
      const rand = Math.random();
      let c;
      if (rand > 0.85) c = colorGold;
      else if (rand > 0.70) c = colorRed;
      else if (rand > 0.4) c = colorGreen;
      else c = colorDeep;

      // Fill Arrays
      posArray[i * 3] = treePos.x;
      posArray[i * 3 + 1] = treePos.y;
      posArray[i * 3 + 2] = treePos.z;

      colArray[i * 3] = c.r;
      colArray[i * 3 + 1] = c.g;
      colArray[i * 3 + 2] = c.b;

      scaleArray[i] = 0.5 + Math.random() * 0.5;

      // Store target info
      targets.push({ treePos, scatterPos, currentPos: treePos.clone() });
    }

    return { 
      positions: posArray, 
      colors: colArray, 
      scales: scaleArray, 
      targetData: targets 
    };
  }, [count, treeLayers]);

  // 2. Animation Loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Update Shader Time
    uniforms.current.uTime.value = state.clock.getElapsedTime();

    // Lerp Positions (CPU side for particle physics feel)
    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    const array = positionsAttribute.array as Float32Array;

    // "Lightweight" particles move fast
    const speed = 4.0 * delta;

    for (let i = 0; i < count; i++) {
      const d = targetData[i];
      const target = isTreeShape ? d.treePos : d.scatterPos;
      
      // Lerp
      d.currentPos.lerp(target, speed);
      
      // Add subtle noise/drift when scattered
      if (!isTreeShape) {
         d.currentPos.y += Math.sin(state.clock.elapsedTime + i) * 0.002;
      }

      array[i * 3] = d.currentPos.x;
      array[i * 3 + 1] = d.currentPos.y;
      array[i * 3 + 2] = d.currentPos.z;
    }

    positionsAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={count}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        uniforms={uniforms.current}
        vertexShader={needleVertexShader}
        fragmentShader={needleFragmentShader}
        transparent
      />
    </points>
  );
};

export default Needles;