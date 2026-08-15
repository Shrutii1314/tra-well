import { motion } from 'framer-motion';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface Location {
  _id?: string;
  type?: string;
  coordinates?: [number, number]; // [lng, lat]
  description?: string;
  day?: number;
  address?: string;
}

interface TourMapProps {
  startLocation?: Location;
  locations?: Location[];
  tourName?: string;
}

const TourMap = ({ startLocation, locations = [], tourName }: TourMapProps) => {
  const allLocations = [
    ...(startLocation ? [{ ...startLocation, day: 0, description: `Start: ${startLocation.description || 'Base Camp'}` }] : []),
    ...locations
  ];

  if (allLocations.length === 0) {
    return null;
  }

  // Calculate coordinates bounds for SVG canvas projection
  const lats = allLocations.map(l => l.coordinates?.[1] || 0).filter(Boolean);
  const lngs = allLocations.map(l => l.coordinates?.[0] || 0).filter(Boolean);

  const minLat = Math.min(...(lats.length ? lats : [0])) - 0.5;
  const maxLat = Math.max(...(lats.length ? lats : [1])) + 0.5;
  const minLng = Math.min(...(lngs.length ? lngs : [0])) - 0.5;
  const maxLng = Math.max(...(lngs.length ? lngs : [1])) + 0.5;

  const getPos = (lng?: number, lat?: number) => {
    if (!lng || !lat) return { x: 50, y: 50 };
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 80 + 10; // % from 10 to 90
    const y = 90 - (((lat - minLat) / (maxLat - minLat || 1)) * 80); // inverted % for map Y
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) };
  };

  const points = allLocations.map(loc => {
    const pos = getPos(loc.coordinates?.[0], loc.coordinates?.[1]);
    return { ...loc, ...pos };
  });

  return (
    <div className="glass-card p-6 border-primary/20 space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="text-primary animate-spin-slow" size={20} />
          <h3 className="text-xl font-bold text-white font-display">Expedition Waypoint Radar</h3>
        </div>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          {points.length} GPS Checkpoints
        </span>
      </div>

      {/* Map Projection Viewport */}
      <div className="relative w-full h-80 rounded-2xl bg-surface-container-lowest border border-white/10 overflow-hidden group">
        {/* Grid Overlay Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:2rem_2rem]" />

        {/* SVG Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {points.length > 1 && (
            <polyline
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="3"
              strokeDasharray="6 4"
              points={points.map(p => `${p.x}%,${p.y}%`).join(' ')}
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Pins */}
        {points.map((pt, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.15 }}
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-10"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-mono text-xs font-bold shadow-lg transition-transform group-hover/pin:scale-125 ${
              idx === 0
                ? 'bg-primary text-background border-white'
                : 'bg-accent/20 text-accent border-accent/60 backdrop-blur-md'
            }`}>
              {idx === 0 ? <Navigation size={14} /> : pt.day || idx}
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:block w-48 p-3 glass-card text-xs z-20 pointer-events-none border-primary/40">
              <p className="font-bold text-primary">{pt.description}</p>
              {pt.coordinates && (
                <p className="text-[10px] text-gray-400 font-mono mt-1">
                  GPS: {pt.coordinates[1].toFixed(2)}°, {pt.coordinates[0].toFixed(2)}°
                </p>
              )}
            </div>
          </motion.div>
        ))}

        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-400">
          Tra-Well Satellite GeoEngine • {tourName}
        </div>
      </div>

      {/* Location list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {points.map((pt, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 text-xs">
            <MapPin size={14} className={idx === 0 ? 'text-primary' : 'text-accent'} />
            <div>
              <p className="font-bold text-gray-200">{pt.description}</p>
              {pt.address && <p className="text-gray-500 line-clamp-1">{pt.address}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourMap;
