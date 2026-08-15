import React, { useState } from 'react';
import { Search, Navigation, Target } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface GeospatialHUDProps {
  onSearch: (distance: number, lat: string, lng: string) => void;
}

const GeospatialHUD: React.FC<GeospatialHUDProps> = ({ onSearch }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [distance, setDistance] = useState(500);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleScan = () => {
    if (!lat || !lng) return;
    setIsScanning(true);
    onSearch(distance, lat, lng);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="hud-panel relative overflow-hidden">
      <AnimatePresence>
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="radar-ping"></div>
            <div className="radar-ping animate-[radar_2s_italic_0.5s_infinite]"></div>
            <div className="absolute inset-0 bg-accent/5 animate-pulse"></div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
            <Navigation size={20} className={isScanning ? 'animate-spin' : ''} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Geospatial Explorer</h3>
            <p className="text-xs text-gray-500 font-mono">SYSTEM READY // RADAR STANDBY</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Range (KM)</label>
            <div className="relative">
              <input 
                type="number" 
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="floating-label-input pr-10" 
                placeholder="Radius"
              />
              <Target size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Latitude</label>
            <input 
              type="text" 
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="floating-label-input font-mono" 
              placeholder="0.0000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Longitude</label>
            <input 
              type="text" 
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="floating-label-input font-mono" 
              placeholder="0.0000"
            />
          </div>
        </div>

        <button 
          onClick={handleScan}
          disabled={isScanning}
          className={`mt-8 w-full btn-luxury flex items-center justify-center gap-2 ${isScanning ? 'bg-gray-800 cursor-not-allowed' : 'bg-accent text-white neo-glow-cyan'}`}
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="font-mono tracking-tighter">SCANNING SECTOR...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span className="font-bold">INITIALIZE RADAR SCAN</span>
            </>
          )}
        </button>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute top-0 right-0 p-2">
        <div className="text-[8px] font-mono text-accent/40 leading-none">
          SECURE_CON_OX4<br />
          LAT: {lat || '0.000'}<br />
          LNG: {lng || '0.000'}
        </div>
      </div>
    </div>
  );
};

export default GeospatialHUD;
