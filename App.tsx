import React, { Suspense, useState } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { Loader } from '@react-three/drei';

function App() {
  const [isTreeShape, setIsTreeShape] = useState(true);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Scene isTreeShape={isTreeShape} />
        </Suspense>
      </div>

      {/* UI Layer */}
      <Overlay 
        isTreeShape={isTreeShape} 
        toggleTreeShape={() => setIsTreeShape(!isTreeShape)} 
      />

      {/* Loading Screen */}
      <Loader 
        containerStyles={{ background: '#021a0f' }} 
        innerStyles={{ background: '#0B6623', height: 2, width: '200px' }}
        barStyles={{ background: '#FFD700', height: 2 }}
        dataStyles={{ fontFamily: 'Playfair Display', color: '#F7E7CE', fontSize: '1.2rem' }}
        dataInterpolation={(p) => `Loading Magic ${p.toFixed(0)}%`}
      />
    </div>
  );
}

export default App;