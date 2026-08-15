import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List as ListIcon, Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import TourCard from '../components/TourCard';
import GeospatialHUD from '../components/GeospatialHUD';
import { getTours, getToursWithin } from '../services/tourService';

type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'duration-asc';
type ViewMode = 'grid' | 'list';

const DIFFICULTY_OPTIONS = ['All', 'easy', 'medium', 'difficult'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'duration-asc', label: 'Shortest First' },
];

const ToursDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [allTours, setAllTours] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState<SortOption>('rating-desc');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [geoActive, setGeoActive] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    setGeoActive(false);
    try {
      const data = await getTours();
      setAllTours(data || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeospatialSearch = async (distance: number, lat: string, lng: string) => {
    setLoading(true);
    try {
      const data = await getToursWithin(distance, `${lat},${lng}`, 'mi');
      setAllTours(data || []);
      setGeoActive(true);
    } catch (error) {
      console.error('Geospatial search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter + sort pipeline
  const filteredTours = useMemo(() => {
    let result = [...allTours];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.summary?.toLowerCase().includes(q) ||
          t.startLocation?.description?.toLowerCase().includes(q)
      );
    }

    if (difficulty !== 'All') {
      result = result.filter((t) => t.difficulty === difficulty);
    }

    result = result.filter((t) => (t.price || 0) <= maxPrice);

    result.sort((a, b) => {
      if (sort === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sort === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sort === 'duration-asc') return (a.duration || 0) - (b.duration || 0);
      return (b.ratingsAverage || 0) - (a.ratingsAverage || 0); // rating-desc default
    });

    return result;
  }, [allTours, searchQuery, difficulty, sort, maxPrice]);

  const SkeletonCard = () => (
    <div className="glass-card overflow-hidden h-[450px]">
      <div className="h-64 bg-white/5 animate-pulse"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 w-2/3 bg-white/5 rounded animate-pulse"></div>
        <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse"></div>
        <div className="pt-6 flex justify-between">
          <div className="h-8 w-1/3 bg-white/5 rounded animate-pulse"></div>
          <div className="h-8 w-1/4 bg-white/5 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const activeFiltersCount = [difficulty !== 'All', maxPrice < 10000].filter(Boolean).length;

  return (
    <div className="space-y-10">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-primary font-mono text-sm tracking-[0.3em] font-bold uppercase">Discover Curated Journeys</p>
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white tracking-tighter">
            TOUR <span className="text-gradient-cyan">COLLECTION</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {loading ? 'Loading experiences...' : `${filteredTours.length} experiences found`}
            {geoActive && <span className="text-accent ml-2 font-mono text-xs">[RADAR MODE]</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(geoActive || activeFiltersCount > 0 || searchQuery) && (
            <button
              onClick={() => { fetchTours(); setSearchQuery(''); setDifficulty('All'); setMaxPrice(10000); setSort('rating-desc'); }}
              className="btn-luxury-outline flex items-center gap-2 text-sm"
            >
              <X size={16} />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`btn-luxury-outline flex items-center gap-2 relative ${filterOpen ? 'border-primary/50 text-primary' : ''}`}
          >
            <SlidersHorizontal size={18} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-white font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <div className="bg-white/5 p-1 rounded-xl flex border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tours by name, location, or description..."
            className="floating-label-input pl-12 pr-4 h-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Expanded Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="hud-panel grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Difficulty Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setDifficulty(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                          difficulty === opt
                            ? 'bg-primary text-white border-primary'
                            : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Max Price: <span className="text-white">${maxPrice.toLocaleString()}</span>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={10000}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 font-mono">
                    <span>$100</span>
                    <span>$10,000</span>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort By</label>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="floating-label-input appearance-none pr-8 cursor-pointer"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Geospatial HUD ─── */}
      <GeospatialHUD onSearch={handleGeospatialSearch} />

      {/* ─── Sort pills (quick access) ─── */}
      <div className="flex gap-2 flex-wrap">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider border transition-all ${
              sort === opt.value
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ─── Tour Grid ─── */}
      <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
              <SkeletonCard />
            </motion.div>
          ))
        ) : (
          <AnimatePresence>
            {filteredTours.map((tour, i) => (
              <motion.div
                key={tour._id || tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                <TourCard tour={tour} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ─── Empty State ─── */}
      {!loading && filteredTours.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass-card"
        >
          <Search size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400 font-display">No experiences found in this sector.</p>
          <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or clearing the search.</p>
          <button
            onClick={() => { fetchTours(); setSearchQuery(''); setDifficulty('All'); setMaxPrice(10000); }}
            className="mt-6 text-primary hover:underline font-mono uppercase text-xs tracking-widest"
          >
            Reset All Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ToursDashboard;
