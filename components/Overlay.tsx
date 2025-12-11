import React from 'react';
import { Sparkles as SparklesIcon, Music, Github, Wand2 } from 'lucide-react';

interface OverlayProps {
  isTreeShape: boolean;
  toggleTreeShape: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ isTreeShape, toggleTreeShape }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10 text-[#F7E7CE]">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col animate-fade-in-down">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-emerald-400">Interactive 3D Experience</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-lg leading-tight">
            Twinkle<br />Christmas
          </h1>
        </div>
        
        <div className="pointer-events-auto flex gap-4">
            <button 
              onClick={toggleTreeShape}
              className={`p-3 rounded-full backdrop-blur-md border transition-all group duration-500
                ${isTreeShape 
                  ? 'bg-emerald-900/30 border-emerald-500/30 hover:bg-emerald-800/50' 
                  : 'bg-yellow-900/30 border-yellow-500/50 hover:bg-yellow-800/50 shadow-[0_0_15px_rgba(253,224,71,0.3)]'}
              `}
              title={isTreeShape ? "Explode Magic" : "Assemble Tree"}
            >
                <Wand2 className={`w-5 h-5 transition-transform duration-500 ${isTreeShape ? 'text-emerald-200' : 'text-yellow-200 rotate-180 scale-110'}`} />
            </button>
            <button className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group">
                <Music className="w-5 h-5 text-yellow-200 group-hover:scale-110 transition-transform" />
            </button>
        </div>
      </header>

      {/* Center Message */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto cursor-help group">
          <p className="font-serif italic text-xl text-emerald-200/50 group-hover:text-emerald-200 transition-colors duration-500">
            {isTreeShape ? "Tap the Wand to Scatter Magic" : "Tap the Wand to Restore Form"}
          </p>
      </div>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="max-w-md pointer-events-auto">
          <div className="bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-2xl shadow-2xl transition-opacity duration-1000">
             <h3 className="font-serif text-2xl text-yellow-100 mb-2">The Season of Joy</h3>
             <p className="text-sm text-emerald-100/70 leading-relaxed font-light">
               May your days be merry and bright. Crafted with <span className="text-yellow-400">React Three Fiber</span> for a luxurious holiday aesthetic.
             </p>
          </div>
        </div>

        <div className="flex items-center gap-6 pointer-events-auto">
            <a href="#" className="text-emerald-300/60 hover:text-yellow-400 transition-colors text-sm tracking-widest uppercase text-xs">
                About
            </a>
            <div className="h-px w-8 bg-emerald-500/30"></div>
            <a href="#" className="text-emerald-300/60 hover:text-yellow-400 transition-colors">
                <Github className="w-5 h-5" />
            </a>
        </div>
      </footer>
    </div>
  );
};

export default Overlay;