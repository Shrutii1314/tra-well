import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  MessageSquare,
  Globe2,
  ChevronDown,
  X,
  CreditCard,
  QrCode,
  Building,
  DollarSign,
  Download,
  User,
  Mail,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { getTour, getReviewsForTour, createReview, deleteReview } from '../services/tourService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import TourMap from '../components/TourMap';

// Difficulty styling configuration
const difficultyMeta: Record<string, { color: string; label: string }> = {
  easy: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Easy' },
  medium: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Moderate' },
  moderate: { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Moderate' },
  difficult: { color: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Difficult' },
};

// Interactive Star Rating Component
const StarRating = ({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange?.(star)}
        className={`transition-transform duration-150 ${onChange ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
        />
      </button>
    ))}
  </div>
);

// Fallback high-res gallery images
const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop'
];

// Fallback day-by-day itinerary
const DEFAULT_ITINERARY = [
  {
    day: 1,
    title: 'Arrival & Basecamp Orientation',
    distance: '210 km drive (8 hrs)',
    altitude: '6,400 ft',
    description: 'Scenic mountain drive along the river valley. Briefing on high-altitude trek safety, equipment checks, and dinner at basecamp.'
  },
  {
    day: 2,
    title: 'Trek to Juda Ka Talab Campsite',
    distance: '4 km trek (5 hrs)',
    altitude: '9,100 ft',
    description: 'Steep climb through dense pine and oak forests. Setup campsite next to the famous frozen lake surrounded by snow peaks.'
  },
  {
    day: 3,
    title: 'Juda Ka Talab to Summit Base Camp',
    distance: '4 km trek (3.5 hrs)',
    altitude: '11,250 ft',
    description: 'Gradual ascent with wide open meadows offering clear vistas of Swargarohini, Bandarpoonch, and Black Peak ranges.'
  },
  {
    day: 4,
    title: 'Summit Day & Descent to Hargaon',
    distance: '6 km trek (7 hrs)',
    altitude: '12,500 ft Summit',
    description: 'Early morning 3 AM summit push to catch 360° sunrise over the Himalayan range. Celebrate at summit peak and descend to Hargaon camp.'
  },
  {
    day: 5,
    title: 'Descent to Base Camp & Departure',
    distance: '6 km trek (4 hrs)',
    altitude: '6,400 ft Base',
    description: 'Final trek back through lush pine forests. Certificate distribution and farewell transfer back to town.'
  }
];

const TourDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Core Tour & Reviews Data State
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  // Media Gallery Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Itinerary Accordion State (open day indices)
  const [openItineraryDays, setOpenItineraryDays] = useState<number[]>([1]);

  // Sidebar Booking State
  const [selectedBatchDate, setSelectedBatchDate] = useState<string>('');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  // Multi-step Booking Modal State (4 Steps)
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [agreePolicy, setAgreePolicy] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'base'>('card');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingRefId, setBookingRefId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Guest Details Form State (Lead & Additional Travelers)
  const [guestDetails, setGuestDetails] = useState({
    leadName: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    age: '28',
    gender: 'male',
    emergencyContact: '+91 98765 00000',
    specialRequests: ''
  });

  // Review Form State
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      try {
        if (id) {
          const data = await getTour(id);
          setTour(data);
          if (data?.startDates?.[0]) {
            setSelectedBatchDate(data.startDates[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching tour detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTourData();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const data = await getReviewsForTour(id);
        setReviews(data || []);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // Gallery images array
  const galleryImages = useMemo(() => {
    if (!tour) return DEFAULT_GALLERY;
    const imgs = [tour.imageCover, ...(tour.images || [])].filter(Boolean);
    return imgs.length > 0 ? imgs : DEFAULT_GALLERY;
  }, [tour]);

  // Price calculations
  const adultPrice = tour ? (tour.priceDiscount ? tour.price : tour.price) : 399;
  const childPrice = Math.round(adultPrice * 0.7); // 30% discount for children
  const rawSubtotal = adultCount * adultPrice + childCount * childPrice;
  const taxFee = Math.round(rawSubtotal * 0.05); // 5% taxes
  const totalAmount = Math.max(0, rawSubtotal + taxFee - appliedDiscount);

  // Available seat calculation
  const maxCapacity = tour?.maxGroupSize || 12;
  const remainingSeats = Math.max(2, maxCapacity - (adultCount + childCount + 3));

  // Toggle itinerary day accordion
  const toggleItineraryDay = (dayNum: number) => {
    setOpenItineraryDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'EARLYBIRD10') {
      setAppliedDiscount(Math.round(rawSubtotal * 0.1)); // 10% off
    } else if (promoCode.trim().toUpperCase() === 'TRAWELL50') {
      setAppliedDiscount(50);
    } else {
      alert('Invalid promo code. Try EARLYBIRD10 for 10% off!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const newReview = await createReview(id!, { review: reviewText, rating: reviewRating });
      setReviews((prev) => [newReview, ...prev]);
      setReviewText('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== reviewId));
    } catch {
      alert('Could not delete review.');
    }
  };

  // Step 3 Payment Handler -> Advance to Step 4 Confirmation
  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate('/auth');
      return;
    }
    setBookingSubmitting(true);
    setBookingError('');
    try {
      await createBooking(
        {
          tourId: tour._id || tour.id,
          startDate: selectedBatchDate || tour.startDates?.[0] || new Date().toISOString(),
          guests: adultCount + childCount
        },
        token
      );
      const generatedBkId = `TW-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedTxnId = `TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRefId(generatedBkId);
      setTransactionId(generatedTxnId);
      setBookingStep(4);
    } catch (err: any) {
      setBookingError(err?.response?.data?.message || 'Booking payment processing failed. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Pagination calculations for reviews
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage) || 1;
  const displayedReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  }, [reviews, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Loading Tour Package...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center my-12 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 font-display">Tour Package Not Found</h2>
        <p className="text-slate-600 text-xs sm:text-sm">The expedition you are looking for might have been updated or moved.</p>
        <button onClick={() => navigate('/tours')} className="btn-luxury-primary text-xs py-2 px-6">
          Explore All Expeditions
        </button>
      </div>
    );
  }

  const difficulty = difficultyMeta[tour.difficulty?.toLowerCase()] || difficultyMeta['easy'];
  const agencyName = tour.agencyName || 'Himalayan High Expeditions';
  const itineraryData = tour.locations && tour.locations.length > 0
    ? tour.locations.map((loc: any, idx: number) => ({
        day: loc.day || idx + 1,
        title: loc.description || `Day ${idx + 1} Expedition Trail`,
        distance: loc.distance || '5 km trek (4-5 hrs)',
        altitude: loc.altitude || `${7000 + idx * 1200} ft`,
        description: loc.address || loc.summary || 'Trek along scenic mountain trails with expert guides and photography spots.'
      }))
    : DEFAULT_ITINERARY;

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* Top Back Nav Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Explore Tours</span>
      </button>

      {/* ─── 1. MEDIA GALLERY & PHOTO LIGHTBOX ─── */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${difficulty.color}`}>
                {difficulty.label}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                <span>Hosted by {agencyName}</span>
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Star size={13} className="fill-amber-400" />
                <span>{tour.ratingsAverage?.toFixed(1) || '4.9'}</span>
                <span className="text-slate-400 text-[11px] font-normal">({reviews.length || tour.ratingsQuantity || 128} reviews)</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
              {tour.name}
            </h1>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
              <MapPin size={14} className="text-primary shrink-0" />
              <span>{tour.startLocation?.description || 'Himalayas, Uttarakhand, India'}</span>
            </div>
          </div>
        </div>

        {/* Gallery Grid (1 Main Cover + 4 Thumbnails Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 relative">
          {/* Main Large Cover */}
          <div 
            onClick={() => { setActiveImgIndex(0); setLightboxOpen(true); }}
            className="md:col-span-2 h-72 sm:h-[400px] relative cursor-pointer overflow-hidden group"
          >
            <img
              src={galleryImages[0]}
              alt={tour.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors"></div>
          </div>

          {/* 4 Photo Thumbnail Grid */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3">
            {galleryImages.slice(1, 5).map((imgUrl, i) => (
              <div
                key={i}
                onClick={() => { setActiveImgIndex(i + 1); setLightboxOpen(true); }}
                className="h-[194px] relative cursor-pointer overflow-hidden group rounded-xl"
              >
                <img
                  src={imgUrl}
                  alt={`${tour.name} gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors"></div>
              </div>
            ))}
          </div>

          {/* Trigger Button: View All Photos */}
          <button
            onClick={() => { setActiveImgIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-900 text-xs font-extrabold px-4 py-2 rounded-xl shadow-lg border border-slate-200 backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <Sparkles size={14} className="text-primary" />
            <span>View All Photos ({galleryImages.length})</span>
          </button>
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8"
          >
            <div className="flex justify-between items-center text-white z-10">
              <span className="text-xs font-mono text-slate-300">
                Photo {activeImgIndex + 1} of {galleryImages.length}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center py-4">
              <button
                onClick={() => setActiveImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                className="absolute left-2 sm:left-6 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 z-10"
              >
                <ChevronLeft size={24} />
              </button>

              <motion.img
                key={activeImgIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={galleryImages[activeImgIndex]}
                alt="Fullscreen gallery view"
                className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />

              <button
                onClick={() => setActiveImgIndex((prev) => (prev + 1) % galleryImages.length)}
                className="absolute right-2 sm:right-6 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="flex justify-center items-center gap-2 overflow-x-auto py-2 z-10">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImgIndex ? 'border-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MAIN LAYOUT GRID (Left Content + Sticky Booking Sidebar) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-10">

          {/* Tour Specs Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { icon: Clock, label: 'Duration', val: `${tour.duration} Days / ${tour.duration - 1} Nights` },
              { icon: Users, label: 'Max Group Size', val: `${tour.maxGroupSize || 12} Trekkers` },
              { icon: MapPin, label: 'Pickup Point', val: tour.startLocation?.description || 'Dehradun Base' },
              { icon: Globe2, label: 'Language', val: 'English & Hindi' },
              { icon: ShieldCheck, label: 'Hosted By', val: agencyName },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <stat.icon size={15} className="text-primary shrink-0" />
                  <span>{stat.label}</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 font-display truncate">
                  {stat.val}
                </div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Expedition Overview
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {tour.description || tour.summary || 'Embark on an unforgettable mountain expedition tailored for outdoor lovers. Led by certified alpine trek masters.'}
            </p>
          </section>

          {/* Detailed Day-by-Day Itinerary Accordion */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Day by Day Trail</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  Detailed Itinerary
                </h2>
              </div>
              <button
                onClick={() => {
                  if (openItineraryDays.length === itineraryData.length) {
                    setOpenItineraryDays([]);
                  } else {
                    setOpenItineraryDays(itineraryData.map((d: any) => d.day));
                  }
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                {openItineraryDays.length === itineraryData.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            <div className="space-y-3">
              {itineraryData.map((dayItem: any) => {
                const isOpen = openItineraryDays.includes(dayItem.day);
                return (
                  <div key={dayItem.day} className="border border-slate-200 rounded-2xl overflow-hidden transition-colors">
                    <button
                      onClick={() => toggleItineraryDay(dayItem.day)}
                      className="w-full bg-slate-50 hover:bg-slate-100/80 p-4 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-red-50 text-primary border border-red-200 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                          D{dayItem.day}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 font-display">{dayItem.title}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>{dayItem.distance}</span>
                            <span>•</span>
                            <span className="text-primary font-bold">{dayItem.altitude}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in">
                        {dayItem.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Inclusions & Exclusions Checklist */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Inclusions & Exclusions Checklist
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80">
                <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>What's Included</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  {[
                    'Wilderness First Aid Certified Lead Trek Leader',
                    'All Nutritious Meals (Breakfast, Hot Lunch, Evening Snacks, Dinner)',
                    'High-Altitude 4-Season Tents & Sleeping Bags (-10°C Rated)',
                    'Forest Permit Fees, Permits & Camping Taxes',
                    'Emergency Medical Oxygen Cylinders & Pulse Oximeters',
                    'Shared Ground Transportation from Pickup Point'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 bg-rose-50/50 p-5 rounded-2xl border border-rose-200/80">
                <h3 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                  <XCircle size={16} className="text-rose-600" />
                  <span>What's Excluded</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  {[
                    'Personal High-Altitude Travel & Medical Insurance',
                    'Personal Backpack Offloading Porter Charges ($15/day)',
                    'Unscheduled Emergency Evacuation / Hospitalization Costs',
                    'Personal Trekking Clothes, Boots, and Trekking Poles',
                    'Tips & Gratuities for Support Staff'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Map Waypoints */}
          <TourMap startLocation={tour.startLocation} locations={tour.locations} tourName={tour.name} />

          {/* Reviews & Ratings */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8" id="reviews-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Traveler Feedback</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  Ratings & Verified Reviews
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                <Star size={20} className="text-amber-500 fill-amber-400" />
                <span className="text-xl font-extrabold text-slate-900 font-mono">
                  {tour.ratingsAverage?.toFixed(1) || '4.9'}
                </span>
                <span className="text-xs text-slate-500 font-medium">({reviews.length || 128} reviews)</span>
              </div>
            </div>

            {/* Write Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <span>Write a Review</span>
                </h3>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Your Rating:</span>
                  <StarRating value={reviewRating} onChange={setReviewRating} size={22} />
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience about the trail, guide, and campsite..."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-primary transition-colors resize-none"
                />

                {reviewError && <p className="text-red-600 text-xs font-bold">{reviewError}</p>}

                <button
                  type="submit"
                  disabled={submittingReview || !reviewText.trim()}
                  className="btn-luxury-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submittingReview ? 'Posting...' : 'Submit Review'}</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
                <span>Want to leave a review? </span>
                <button onClick={() => navigate('/auth')} className="text-primary font-bold hover:underline">
                  Log in to your account
                </button>
              </div>
            )}

            {/* Reviews List & Pagination */}
            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="text-xs text-slate-400 font-mono py-4 text-center">Loading reviews...</div>
              ) : displayedReviews.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">No reviews submitted yet for this expedition.</div>
              ) : (
                displayedReviews.map((rev: any, idx: number) => {
                  const revId = rev._id || rev.id;
                  const canDelete = user && (user.id === (rev.user?._id || rev.user?.id || rev.user) || user.role === 'admin');
                  return (
                    <div key={revId || idx} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            {(rev.user?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">{rev.user?.name || 'Verified Explorer'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent Trekker'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StarRating value={rev.rating || 5} size={14} />
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteReview(revId)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Delete review"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.review}</p>
                    </div>
                  );
                })
              )}

              {/* Pagination Controls */}
              {totalReviewPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t border-slate-100 text-xs font-bold">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                  >
                    Previous
                  </button>

                  <span className="text-slate-500 font-mono">
                    Page {currentPage} of {totalReviewPages}
                  </span>

                  <button
                    disabled={currentPage === totalReviewPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalReviewPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ─── 3. RIGHT COLUMN: INTERACTIVE STICKY BOOKING SIDEBAR ─── */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-24 space-y-6">
            
            {/* Header & Price Tag */}
            <div className="pb-4 border-b border-slate-200 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Starting Rate</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Save 20% Early Bird
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">${adultPrice}</span>
                <span className="text-xs text-slate-500 font-medium">/ person</span>
              </div>
            </div>

            {/* Date Selector for Available Batches */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1"><Calendar size={14} className="text-primary" /> Departure Batch</span>
                <span className="text-[10px] text-amber-600 font-mono font-bold">🔥 {remainingSeats} Seats Left</span>
              </label>
              <select
                value={selectedBatchDate}
                onChange={(e) => setSelectedBatchDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-primary transition-colors"
              >
                {tour.startDates && tour.startDates.length > 0 ? (
                  tour.startDates.map((d: string, idx: number) => (
                    <option key={idx} value={d}>
                      {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} Batch
                    </option>
                  ))
                ) : (
                  <>
                    <option value="2026-11-02">Nov 02, 2026 Batch</option>
                    <option value="2026-11-09">Nov 09, 2026 Batch</option>
                    <option value="2026-11-16">Nov 16, 2026 Batch</option>
                    <option value="2026-12-07">Dec 07, 2026 Batch</option>
                  </>
                )}
              </select>
            </div>

            {/* Guest Counter (+/- Adults & Children) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Users size={14} className="text-primary" /> Select Guests
              </label>

              {/* Adults Counter */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Adults (12+ yrs)</p>
                  <p className="text-[10px] text-slate-500 font-mono">${adultPrice} / person</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount((a) => Math.max(1, a - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:bg-slate-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-xs">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount((a) => Math.min(10, a + 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:bg-slate-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">Children (5-11 yrs)</p>
                  <p className="text-[10px] text-slate-500 font-mono">${childPrice} (30% OFF)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount((c) => Math.max(0, c - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:bg-slate-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-xs">{childCount}</span>
                  <button
                    onClick={() => setChildCount((c) => Math.min(5, c + 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:bg-slate-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Live Real-time Price Calculation */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Adults ({adultCount} × ${adultPrice})</span>
                <span className="font-mono">${adultCount * adultPrice}</span>
              </div>
              {childCount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Children ({childCount} × ${childPrice})</span>
                  <span className="font-mono">${childCount * childPrice}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Service Fees (5%)</span>
                <span className="font-mono">${taxFee}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount Applied</span>
                  <span className="font-mono">-${appliedDiscount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-extrabold text-slate-900 text-sm">
                <span>Total Amount</span>
                <span className="text-xl font-mono text-primary">${totalAmount}</span>
              </div>
            </div>

            {/* Book Now Action Trigger Button */}
            <button
              onClick={() => {
                setBookingStep(1);
                setBookingModalOpen(true);
              }}
              className="w-full btn-luxury-primary py-3.5 text-sm font-extrabold shadow-lg uppercase tracking-wider"
            >
              Book Package Now
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Shield size={14} className="text-emerald-600" />
              <span>Instant Confirmation & Free Date Changes</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── 5. MULTI-STEP CHECKOUT MODAL & PAYMENT FLOW (4 STEPS) ─── */}
      <AnimatePresence>
        {bookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
                    Step {bookingStep} of 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
                    {bookingStep === 1 && 'Step 1: Lead & Guest Details'}
                    {bookingStep === 2 && 'Step 2: Order Summary & Review'}
                    {bookingStep === 3 && 'Step 3: Simulated Payment Checkout'}
                    {bookingStep === 4 && 'Step 4: Reservation Confirmed!'}
                  </h3>
                </div>
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Progress Bar */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      step <= bookingStep ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* ── STEP 1: GUEST DETAILS ── */}
              {bookingStep === 1 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <User size={13} className="text-primary" /> Lead Passenger Name
                      </label>
                      <input
                        type="text"
                        value={guestDetails.leadName}
                        onChange={(e) => setGuestDetails({ ...guestDetails, leadName: e.target.value })}
                        required
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Mail size={13} className="text-primary" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                        required
                        placeholder="john@example.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Age</label>
                      <input
                        type="number"
                        value={guestDetails.age}
                        onChange={(e) => setGuestDetails({ ...guestDetails, age: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Gender</label>
                      <select
                        value={guestDetails.gender}
                        onChange={(e) => setGuestDetails({ ...guestDetails, gender: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Phone</label>
                      <input
                        type="text"
                        value={guestDetails.phone}
                        onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={guestDetails.emergencyContact}
                      onChange={(e) => setGuestDetails({ ...guestDetails, emergencyContact: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Special Requests / Dietary Notes</label>
                    <input
                      type="text"
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      placeholder="e.g., Vegetarian meal, asthma kit needed..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!guestDetails.leadName || !guestDetails.email) {
                        alert('Please fill out lead passenger name and email address.');
                        return;
                      }
                      setBookingStep(2);
                    }}
                    className="w-full btn-luxury-primary py-3 text-xs font-bold shadow-md"
                  >
                    Proceed to Order Summary
                  </button>
                </div>
              )}

              {/* ── STEP 2: ORDER SUMMARY & REVIEW ── */}
              {bookingStep === 2 && (
                <div className="space-y-4 text-xs">
                  {/* Order Table Summary */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Package Name:</span>
                      <span>{tour.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Departure Date:</span>
                      <span className="font-mono text-slate-800">{selectedBatchDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests Breakdown:</span>
                      <span>{adultCount} Adult(s), {childCount} Child(ren)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hosted By:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        {agencyName} <ShieldCheck size={13} />
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Enter Promo Code (e.g. EARLYBIRD10)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 font-mono text-slate-900"
                      />
                      <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <button onClick={handleApplyPromo} className="btn-luxury-outline py-2 px-4 font-bold shrink-0">
                      Apply
                    </button>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">${rawSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxes & Service Fee (5%):</span>
                      <span className="font-mono">${taxFee}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Coupon Discount Applied:</span>
                        <span className="font-mono">-${appliedDiscount}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold">
                      <span>Total Amount:</span>
                      <span className="text-primary font-mono text-base">${totalAmount}</span>
                    </div>
                  </div>

                  {/* Cancellation Policy Checkbox */}
                  <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreePolicy}
                      onChange={(e) => setAgreePolicy(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span>
                      I agree to the <strong>Cancellation & Refund Policy</strong> (Free cancellation up to 48 hours prior to departure).
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button onClick={() => setBookingStep(1)} className="btn-luxury-outline py-2.5 px-4 font-bold flex-1">
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!agreePolicy) {
                          alert('Please accept the cancellation policy to proceed.');
                          return;
                        }
                        setBookingStep(3);
                      }}
                      className="btn-luxury-primary py-2.5 px-4 font-bold flex-[2]"
                    >
                      Proceed to Payment Checkout
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: SIMULATED PAYMENT ── */}
              {bookingStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-700">Choose Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                        { id: 'upi', label: 'Instant UPI / GPay', icon: QrCode },
                        { id: 'netbanking', label: 'NetBanking', icon: Building },
                        { id: 'base', label: 'Pay at Base Station', icon: DollarSign },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`p-3 rounded-xl border flex items-center gap-2 font-bold text-left transition-all ${
                            paymentMethod === pm.id
                              ? 'bg-red-50 border-primary text-primary'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <pm.icon size={16} />
                          <span>{pm.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulated Card / UPI Details Input */}
                  {paymentMethod === 'card' ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">Card Number</label>
                        <input
                          type="text"
                          defaultValue="4242 •••• •••• 4242"
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-600">Expiry Date</label>
                          <input type="text" defaultValue="12/28" className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono" />
                        </div>
                        <div>
                          <label className="font-bold text-slate-600">CVV Code</label>
                          <input type="password" defaultValue="888" className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                      <QrCode size={48} className="mx-auto text-slate-700" />
                      <p className="font-mono text-xs font-bold text-slate-900">UPI ID: trawell@upi</p>
                      <p className="text-[11px] text-slate-500">Scan using Google Pay, PhonePe, or Paytm</p>
                    </div>
                  )}

                  {bookingError && (
                    <p className="text-red-600 text-xs font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {bookingError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => setBookingStep(2)} className="btn-luxury-outline py-2.5 px-4 font-bold flex-1">
                      Back
                    </button>
                    <button
                      onClick={handleSimulatedPayment}
                      disabled={bookingSubmitting}
                      className="btn-luxury-primary py-2.5 px-4 font-bold flex-[2] flex items-center justify-center gap-2"
                    >
                      {bookingSubmitting ? 'Processing Payment...' : `Pay $${totalAmount} & Confirm`}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: CONFIRMATION & DIGITAL QR TICKET ── */}
              {bookingStep === 4 && (
                <div className="text-center space-y-5 py-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-slate-900 font-display">Reservation Confirmed!</h3>
                    <p className="text-xs text-slate-600">
                      Booking Ref ID: <strong className="font-mono text-primary">{bookingRefId}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">Txn ID: {transactionId}</p>
                  </div>

                  {/* Digital QR Ticket Preview */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3 text-left flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">{tour.name}</p>
                      <p className="text-slate-600">Departure Date: <strong>{selectedBatchDate}</strong></p>
                      <p className="text-slate-600">Primary Guest: <strong>{guestDetails.leadName}</strong></p>
                      <p className="text-emerald-700 font-bold font-mono">Paid Total: ${totalAmount}</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-300 text-center shrink-0">
                      <QrCode size={52} className="text-slate-900 mx-auto" />
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">Digital QR Ticket</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => alert(`Digital E-Ticket PDF downloaded for ${bookingRefId}`)}
                      className="btn-luxury-outline py-2.5 px-4 text-xs font-bold flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>Download Digital Ticket</span>
                    </button>

                    <button
                      onClick={() => {
                        setBookingModalOpen(false);
                        navigate('/my-dashboard');
                      }}
                      className="btn-luxury-primary py-2.5 px-4 text-xs font-bold flex-1"
                    >
                      View in My Bookings
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TourDetail;
