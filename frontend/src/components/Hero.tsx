import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, Users, Clock, Calendar, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface FilterState {
  destination: string;
  maxPrice: number;
  groupSize: string;
  duration: string;
  startDate: string;
}

interface HeroProps {
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const DEFAULT_FILTERS: FilterState = {
  destination: 'all',
  maxPrice: 2000,
  groupSize: 'all',
  duration: 'all',
  startDate: '',
};

const Hero: React.FC<HeroProps> = ({ onFilterChange, initialFilters }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>(initialFilters || DEFAULT_FILTERS);
  const [quickKeyword, setQuickKeyword] = useState('');

  const handleChange = (field: keyof FilterState, value: any) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange(filters);
    } else {
      const params = new URLSearchParams({
        destination: filters.destination !== 'all' ? filters.destination : '',
        maxPrice: filters.maxPrice.toString(),
        groupSize: filters.groupSize !== 'all' ? filters.groupSize : '',
        duration: filters.duration !== 'all' ? filters.duration : '',
        startDate: filters.startDate,
        keyword: quickKeyword
      });
      navigate(`/tours?${params.toString()}`);
    }
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setQuickKeyword('');
    if (onFilterChange) {
      onFilterChange(DEFAULT_FILTERS);
    }
  };

  return (
    <section className="relative pt-2 pb-8 space-y-8">
      {/* Hero Banner Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 text-white min-h-[520px] flex items-center justify-center p-6 sm:p-12">
        {/* Background Image with Dark Atmospheric Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>

        {/* Content Box */}
        <div className="relative z-10 w-full max-w-5xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-widest backdrop-blur-md shadow-lg">
              <Sparkles size={14} className="text-amber-400" />
              <span>Unforgettable Expeditions & Mountain Treks</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight font-display drop-shadow-md">
              Discover Extraordinary Trails <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                & Bespoke Adventures
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Book certified trekking expeditions, weekend mountain escapes, and luxury custom tours guided by veteran mountaineers.
            </p>
          </motion.div>

          {/* Interactive Filter Bar */}
          <motion.form
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            onSubmit={handleFilterSubmit}
            className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xl text-slate-900 space-y-4"
          >
            {/* Quick Search Input & Title */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <MapPin size={16} className="text-primary" />
                <span>Find Your Next Destination</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-primary flex items-center gap-1 transition-colors font-medium ml-auto sm:ml-0"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* 5 Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-left">
              {/* 1. Destination Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1">
                  <MapPin size={12} className="text-primary" /> Destination
                </label>
                <select
                  value={filters.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                >
                  <option value="all">All Destinations</option>
                  <option value="Himalayas">Himalayas, India</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="Himachal">Himachal Pradesh</option>
                  <option value="Ladakh">Leh & Ladakh</option>
                  <option value="Goa">Goa & Coastal</option>
                  <option value="Rajasthan">Rajasthan Heritage</option>
                </select>
              </div>

              {/* 2. Price Range Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><DollarSign size={12} className="text-primary" /> Price</span>
                  <span className="text-primary font-mono font-bold">${filters.maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={3000}
                  step={50}
                  value={filters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                  className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer my-2"
                />
              </div>

              {/* 3. Group Size */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1">
                  <Users size={12} className="text-primary" /> Group Size
                </label>
                <select
                  value={filters.groupSize}
                  onChange={(e) => handleChange('groupSize', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                >
                  <option value="all">Any Group Size</option>
                  <option value="solo">Solo / Duo (1-2)</option>
                  <option value="small">Small Group (3-6)</option>
                  <option value="medium">Medium Group (7-12)</option>
                  <option value="large">Large Group (12+)</option>
                </select>
              </div>

              {/* 4. Duration */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1">
                  <Clock size={12} className="text-primary" /> Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                >
                  <option value="all">Any Duration</option>
                  <option value="short">1 - 3 Days</option>
                  <option value="medium">4 - 7 Days</option>
                  <option value="long">8 - 14 Days</option>
                  <option value="expedition">15+ Days</option>
                </select>
              </div>

              {/* 5. Start Date Picker */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1">
                  <Calendar size={12} className="text-primary" /> Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Filter Action Submit Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Keyword search (e.g. Kedarkantha, Brahmatal, Kasol)..."
                  value={quickKeyword}
                  onChange={(e) => setQuickKeyword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-primary focus:bg-white transition-colors"
                />
                <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto btn-luxury-primary py-2.5 px-8 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 uppercase tracking-wider shrink-0"
              >
                <Search size={15} />
                <span>Search Tours</span>
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
