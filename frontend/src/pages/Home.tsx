import React, { useEffect, useState, useMemo } from 'react';
import Hero, { type FilterState } from '../components/Hero';
import TourCard, { type Tour } from '../components/TourCard';
import TourGridSkeleton from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { ArrowRight, Flame, ShieldCheck, Users, CheckCircle2, Star, Sparkles, MapPin } from 'lucide-react';
import { getTours } from '../services/tourService';
import { Link } from 'react-router-dom';
import { TOP_AGENCIES } from './AgenciesDashboard';

// Comprehensive mock tours fallback data
const MOCK_FEATURED_TOURS: Tour[] = [
  {
    id: '1',
    _id: '1',
    name: 'Kedarkantha Summit Winter Trek',
    duration: 5,
    maxGroupSize: 12,
    difficulty: 'easy',
    ratingsAverage: 4.9,
    ratingsQuantity: 184,
    price: 399,
    priceDiscount: 100,
    agencyName: 'Himalayan High Expeditions',
    summary: 'Conquer the snow-capped summit of Kedarkantha (12,500 ft) with breathtaking pine forests and campsite views.',
    imageCover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Sankri, Uttarakhand' }
  },
  {
    id: '2',
    _id: '2',
    name: 'Hampta Pass & Chandratal Lake Expedition',
    duration: 6,
    maxGroupSize: 15,
    difficulty: 'medium',
    ratingsAverage: 4.8,
    ratingsQuantity: 142,
    price: 499,
    priceDiscount: 120,
    agencyName: 'Garhwal Trekkers Club',
    summary: 'A dramatic cross-over trek from lush green Kullu valley to the stark desert landscape of Lahaul & Spiti.',
    imageCover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Manali, Himachal Pradesh' }
  },
  {
    id: '3',
    _id: '3',
    name: 'Brahmatal Frozen Lake Trek',
    duration: 6,
    maxGroupSize: 10,
    difficulty: 'medium',
    ratingsAverage: 4.9,
    ratingsQuantity: 96,
    price: 450,
    priceDiscount: 90,
    agencyName: 'Garhwal Trekkers Club',
    summary: 'Walk on pristine mountain ridges offering unmatched views of Mt. Trishul and Mt. Nanda Ghunti peaks.',
    imageCover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Lohajung, Uttarakhand' }
  },
  {
    id: '4',
    _id: '4',
    name: 'Valley of Flowers & Hemkund Sahib',
    duration: 7,
    maxGroupSize: 16,
    difficulty: 'easy',
    ratingsAverage: 4.9,
    ratingsQuantity: 210,
    price: 550,
    priceDiscount: 150,
    agencyName: 'Himalayan High Expeditions',
    summary: 'Discover a UNESCO World Heritage alpine flower sanctuary blooming with endemic Himalayan flora.',
    imageCover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Govindghat, Uttarakhand' }
  },
  {
    id: '5',
    _id: '5',
    name: 'Leh Ladakh Motorcycle & Pass Circuit',
    duration: 10,
    maxGroupSize: 8,
    difficulty: 'difficult',
    ratingsAverage: 5.0,
    ratingsQuantity: 78,
    price: 1299,
    priceDiscount: 200,
    agencyName: 'Ladakh High Pass Riders',
    summary: 'Ride through Khardung La, Nubra Valley, and Pangong Tso Lake on an epic Himalayan high-altitude motor expedition.',
    imageCover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Leh, Ladakh' }
  },
  {
    id: '6',
    _id: '6',
    name: 'Kasol & Kheerganga Hot Spring Trail',
    duration: 3,
    maxGroupSize: 20,
    difficulty: 'easy',
    ratingsAverage: 4.7,
    ratingsQuantity: 312,
    price: 199,
    priceDiscount: 50,
    agencyName: 'Parvati Valley Backpackers',
    summary: 'Weekend backpacking trek through Parvati Valley ending at natural high-altitude geothermal springs.',
    imageCover: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Kasol, Himachal Pradesh' }
  }
];

const CATEGORY_TABS = [
  'All Featured Expeditions',
  'Winter Summit Treks',
  'Weekend Escapes',
  'Motorcycle Expeditions',
  'Backpacking Trails'
];

const Home: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All Featured Expeditions');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    destination: 'all',
    maxPrice: 3000,
    groupSize: 'all',
    duration: 'all',
    startDate: '',
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const data = await getTours();
      if (data && Array.isArray(data) && data.length > 0) {
        setTours(data);
      } else {
        setTours(MOCK_FEATURED_TOURS);
      }
    } catch (err) {
      console.warn('Backend unavailable, rendering curated featured tours:', err);
      setTours(MOCK_FEATURED_TOURS);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      destination: 'all',
      maxPrice: 3000,
      groupSize: 'all',
      duration: 'all',
      startDate: '',
    });
  };

  // Filter tours based on category tabs and Hero Filter Bar values
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      // Price filter
      if (tour.price > activeFilters.maxPrice) return false;

      // Destination filter
      if (activeFilters.destination !== 'all') {
        const dest = activeFilters.destination.toLowerCase();
        const loc = (tour.startLocation?.description || '').toLowerCase();
        const name = tour.name.toLowerCase();
        if (!loc.includes(dest) && !name.includes(dest)) return false;
      }

      // Group size filter
      if (activeFilters.groupSize !== 'all') {
        const group = tour.maxGroupSize || 10;
        if (activeFilters.groupSize === 'solo' && group > 2) return false;
        if (activeFilters.groupSize === 'small' && (group < 3 || group > 6)) return false;
        if (activeFilters.groupSize === 'medium' && (group < 7 || group > 12)) return false;
        if (activeFilters.groupSize === 'large' && group < 12) return false;
      }

      // Duration filter
      if (activeFilters.duration !== 'all') {
        const dur = tour.duration;
        if (activeFilters.duration === 'short' && dur > 3) return false;
        if (activeFilters.duration === 'medium' && (dur < 4 || dur > 7)) return false;
        if (activeFilters.duration === 'long' && (dur < 8 || dur > 14)) return false;
        if (activeFilters.duration === 'expedition' && dur < 15) return false;
      }

      // Category tab filter
      if (selectedCategoryTab === 'Winter Summit Treks' && !tour.name.toLowerCase().includes('winter') && !tour.name.toLowerCase().includes('summit')) return false;
      if (selectedCategoryTab === 'Weekend Escapes' && tour.duration > 4) return false;
      if (selectedCategoryTab === 'Motorcycle Expeditions' && !tour.name.toLowerCase().includes('motorcycle') && !tour.name.toLowerCase().includes('pass')) return false;
      if (selectedCategoryTab === 'Backpacking Trails' && tour.difficulty === 'difficult') return false;

      return true;
    });
  }, [tours, activeFilters, selectedCategoryTab]);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner with Interactive Filter Bar */}
      <Hero onFilterChange={handleHeroFilterChange} initialFilters={activeFilters} />

      {/* Category Scrollable Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="category-tabs-nav flex-1">
          {CATEGORY_TABS.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategoryTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryTab === tab
                  ? 'bg-primary text-white shadow-md shadow-red-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Tours Grid Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold tracking-wider mb-1">
              <Flame size={16} className="text-red-600 animate-pulse" />
              <span>Handpicked Mountain Expeditions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Featured Tours & Expeditions <span className="text-primary">(2026 Season)</span>
            </h2>
          </div>

          <Link to="/tours" className="btn-luxury-outline text-xs py-2 px-4 flex items-center gap-1 font-bold shrink-0">
            <span>Explore All Packages</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* UI States: Loading Skeleton vs Empty Fallback vs Tour Cards Grid */}
        {loading ? (
          <TourGridSkeleton count={6} />
        ) : filteredTours.length === 0 ? (
          <EmptyState
            title="No Expeditions Match Your Criteria"
            message="No tours found matching your selected destination, price, or duration settings. Try resetting your filter controls."
            onReset={handleResetFilters}
          />
        ) : (
          /* Responsive Grid: 1 Column Mobile, 3 Columns Desktop */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour._id || tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      {/* ─── TOP VERIFIED AGENCIES SECTION / CAROUSEL ─── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-mono text-xs uppercase font-bold tracking-wider mb-1">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Certified Local Outfitters</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Top Verified Agencies
            </h2>
          </div>

          <Link to="/agencies" className="btn-luxury-outline text-xs py-2 px-4 flex items-center gap-1 font-bold shrink-0">
            <span>View All Agencies</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOP_AGENCIES.map((agency) => (
            <div key={agency.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={agency.logo} alt={agency.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 font-display line-clamp-1 flex items-center gap-1">
                      {agency.name}
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <MapPin size={12} className="text-primary" /> {agency.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star size={12} className="fill-amber-400" />
                    <span>{agency.rating.toFixed(1)}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{agency.hostedToursCount} Active Tours</span>
                </div>
              </div>

              <Link
                to={`/agencies/${agency.id}`}
                className="btn-luxury-outline text-xs py-2 px-3 w-full flex items-center justify-center gap-1 font-bold"
              >
                <span>View Profile</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Tra-Well Feature Banner */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles size={14} /> The Tra-Well Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Why Trekkers & Travelers Trust Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: 'Wilderness Safety First', desc: 'Every trek leader is certified in Wilderness First Aid with emergency oxygen & satellite coms.' },
            { icon: Users, title: 'Certified Mountain Guides', desc: 'Veteran mountaineers with over 10+ years of regional high-altitude trekking leadership.' },
            { icon: CheckCircle2, title: 'Transparent Direct Pricing', desc: 'Direct trek booking rates with no middleman margins or unexpected surcharges.' },
            { icon: Star, title: '4.9★ Traveler Rating', desc: 'Trusted by over 12,500+ passionate adventurers across India and worldwide.' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-center sm:text-left hover:border-red-200 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-primary flex items-center justify-center mx-auto sm:mx-0 border border-red-100">
                <item.icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
