import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List as ListIcon, Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import TourCard from '../components/TourCard';
import { getTours } from '../services/tourService';
import { getAllToursList } from '../services/agencyStore';
import { useSearchParams } from 'react-router-dom';

type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'duration-asc';
type ViewMode = 'grid' | 'list';

const CATEGORY_TABS = [
  'All Treks & Trips',
  'Upcoming Treks',
  'Weekend Treks',
  'Backpacking Trips',
  'Bike Tours',
  'Camping Tours',
  'Customized Expeditions'
];

const DIFFICULTY_OPTIONS = ['All', 'easy', 'medium', 'difficult'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'duration-asc', label: 'Shortest Duration' },
];

const ToursDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [loading, setLoading] = useState(true);
  const [allTours, setAllTours] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All Treks & Trips');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState<SortOption>('rating-desc');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const data = await getTours();
      const merged = getAllToursList(data || []);
      setAllTours(merged);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      const merged = getAllToursList([]);
      setAllTours(merged);
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
      return (b.ratingsAverage || 0) - (a.ratingsAverage || 0);
    });

    return result;
  }, [allTours, searchQuery, difficulty, sort, maxPrice]);

  const activeFiltersCount = [difficulty !== 'All', maxPrice < 10000].filter(Boolean).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Category Scrollable Sub-Nav Bar (Light Theme) */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="category-tabs-nav">
          {CATEGORY_TABS.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategoryTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryTab === tab
                  ? 'bg-primary text-white shadow-md shadow-red-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-primary font-mono text-xs uppercase font-bold tracking-wider">Adventure Catalog</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            {selectedCategoryTab}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {loading ? 'Searching expeditions...' : `Showing ${filteredTours.length} verified adventure packages`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(activeFiltersCount > 0 || searchQuery) && (
            <button
              onClick={() => { fetchTours(); setSearchQuery(''); setDifficulty('All'); setMaxPrice(10000); setSort('rating-desc'); }}
              className="btn-luxury-outline py-2 px-3 text-xs flex items-center gap-1.5"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`btn-luxury-outline py-2 px-4 text-xs flex items-center gap-2 relative ${filterOpen ? 'border-primary text-primary bg-red-50' : ''}`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="bg-white p-1 flex border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by trek name, mountain pass, or location..."
            className="floating-label-input pl-11 pr-10 py-3 text-sm shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Expand Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 border border-slate-200 shadow-sm">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trek Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setDifficulty(opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                          difficulty === opt
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Max Price: <span className="text-slate-900 font-mono">${maxPrice.toLocaleString()}</span>
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
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>$100</span>
                    <span>$10,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort Packages</label>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="floating-label-input appearance-none pr-8 cursor-pointer text-xs"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tour Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 h-80 animate-pulse rounded-2xl shadow-sm" />
          ))
        ) : (
          filteredTours.map((tour) => (
            <TourCard key={tour._id || tour.id} tour={tour} viewMode={viewMode} />
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredTours.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <Search size={40} className="text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No trek packages match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your difficulty or maximum price filter.
          </p>
          <button
            onClick={() => { fetchTours(); setSearchQuery(''); setDifficulty('All'); setMaxPrice(10000); }}
            className="btn-luxury-outline py-2 px-6 text-xs text-primary border-red-200 hover:bg-red-50"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ToursDashboard;
