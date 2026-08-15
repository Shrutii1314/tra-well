import { useState, useEffect } from 'react';
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
  Navigation,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  MessageSquare,
  Award,
  TrendingUp
} from 'lucide-react';
import { getTour, getReviewsForTour, createReview, deleteReview } from '../services/tourService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import TourMap from '../components/TourMap';

const difficultyMeta: Record<string, { color: string; label: string }> = {
  easy: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Easy' },
  medium: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Medium' },
  difficult: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', label: 'Difficult' },
};

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange?.(star)}
        className={`transition-all duration-150 ${onChange ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={20}
          className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
        />
      </button>
    ))}
  </div>
);

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');


  // Gallery state
  const [activeImg, setActiveImg] = useState(0);

  // Review form state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        if (id) {
          const data = await getTour(id);
          setTour(data);
        }
      } catch (error) {
        console.error('Error fetching tour detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
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
    if (id) fetchReviews();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmitting(true);
    setReviewError('');
    try {
      const newReview = await createReview(id!, { review: reviewText, rating: reviewRating });
      setReviews((prev) => [newReview, ...prev]);
      setReviewText('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId && r.id !== reviewId));
    } catch {
      alert('Could not delete review.');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
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
          startDate: bookingDate || tour.startDates?.[0] || new Date().toISOString(),
          guests: bookingGuests
        },
        token
      );
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(err?.response?.data?.message || 'Booking submission failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };


  // Build image gallery
  const galleryImages = tour
    ? [tour.imageCover, ...(tour.images || [])].filter(Boolean)
    : [];

  const nextImg = () => setActiveImg((i) => (i + 1) % galleryImages.length);
  const prevImg = () => setActiveImg((i) => (i - 1 + galleryImages.length) % galleryImages.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={20} className="text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Experience not found</h2>
        <button onClick={() => navigate('/tours')} className="mt-6 btn-luxury-outline">
          Return to Collection
        </button>
      </div>
    );
  }

  const difficulty = difficultyMeta[tour.difficulty] || difficultyMeta['easy'];
  const nextStartDate = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Available Now';

  return (
    <div className="space-y-16 pb-20">
      {/* ─── Hero / Gallery ─── */}
      <div className="relative rounded-3xl overflow-hidden group" style={{ height: '65vh' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            src={galleryImages[activeImg] || `https://picsum.photos/seed/${tour._id || tour.id}/1600/900`}
            alt={tour.name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Gallery Controls */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-white hover:text-primary transition-all hover:scale-110"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-white hover:text-primary transition-all hover:scale-110"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-primary w-6' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hero Content */}
        <div className="absolute inset-x-0 bottom-0 p-10 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group/back mb-4"
          >
            <ArrowLeft size={20} className="transition-transform group-hover/back:-translate-x-1" />
            <span className="font-mono text-sm tracking-widest uppercase">Back to Collection</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${difficulty.color}`}>
              {difficulty.label}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={16} fill="currentColor" />
              <span className="font-bold text-white">{tour.ratingsAverage?.toFixed(1) || '—'}</span>
              <span className="text-gray-400 text-sm">({tour.ratingsQuantity || 0} reviews)</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tighter leading-none">
            {tour.name.toUpperCase()}
          </h1>
        </div>
      </div>

      {/* ─── Main Grid ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        {/* ── Left Content ── */}
        <div className="lg:col-span-2 space-y-14">

          {/* Stats Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Duration', value: `${tour.duration} Days` },
              { icon: Users, label: 'Group Size', value: `Up to ${tour.maxGroupSize}` },
              { icon: MapPin, label: 'Starting Point', value: tour.startLocation?.description || 'TBD' },
              { icon: Calendar, label: 'Next Start', value: nextStartDate },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 space-y-2 group hover:border-primary/50 transition-colors"
              >
                <item.icon size={22} className="text-accent group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{item.label}</p>
                <p className="text-base font-bold text-white leading-tight">{item.value}</p>
              </motion.div>
            ))}
          </section>

          {/* About */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">About the Experience</h2>
            <p className="text-lg text-gray-400 leading-relaxed font-light">
              {tour.description || tour.summary}
            </p>
            {tour.description && tour.summary && tour.description !== tour.summary && (
              <p className="text-gray-500 leading-relaxed italic">{tour.summary}</p>
            )}
          </section>

          {/* Locations / Itinerary */}
          {tour.locations && tour.locations.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Journey Itinerary</h2>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/30 to-transparent" />
                <div className="space-y-6">
                  {tour.locations.map((loc: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 pl-14 relative"
                    >
                      <div className="absolute left-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold font-mono">
                        {loc.day || i + 1}
                      </div>
                      <div className="glass-card p-5 flex-1">
                        <p className="text-xs text-primary font-mono uppercase tracking-widest mb-1">Day {loc.day || i + 1}</p>
                        <p className="font-bold text-white">{loc.description}</p>
                        {loc.address && <p className="text-sm text-gray-400 mt-1">{loc.address}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Included Perks */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Professional Gear & Equipment',
                'Gourmet Meals All Day',
                'Premium Accommodations',
                '24/7 Safety & Support',
                'Expert Local Guides',
                'Transport Between Locations',
              ].map((perk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 glass-card px-5 py-4"
                >
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span className="text-gray-200 text-sm">{perk}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Guides */}
          {tour.guides && tour.guides.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Your Guides</h2>
              <div className="space-y-4">
                {tour.guides.map((guide: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 glass-card p-5"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 shrink-0">
                      <Navigation size={28} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-primary font-mono uppercase tracking-widest font-bold mb-1">
                        {guide.role === 'lead-guide' ? '⭐ Lead Guide' : 'Guide'}
                      </p>
                      <p className="text-xl font-bold text-white">{guide.name}</p>
                      <p className="text-sm text-gray-500">{guide.email}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Map Waypoints Radar */}
          <TourMap startLocation={tour.startLocation} locations={tour.locations} tourName={tour.name} />

          {/* Reviews */}
          <section className="space-y-8" id="reviews">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Traveler Reviews</h2>
              <div className="flex items-center gap-2 text-amber-400">
                <TrendingUp size={18} />
                <span className="font-bold text-white">{tour.ratingsAverage?.toFixed(1) || '—'}</span>
                <span className="text-gray-400 text-sm">avg · {tour.ratingsQuantity || 0} total</span>
              </div>
            </div>

            {/* Review form */}
            {user && (
              <form onSubmit={handleReviewSubmit} className="glass-card p-6 space-y-4 border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.name}</p>
                    <p className="text-gray-500 text-xs font-mono">Posting as verified traveler</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">Rating</span>
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this tour..."
                  rows={4}
                  className="floating-label-input resize-none"
                />

                {reviewError && <p className="text-rose-400 text-sm">{reviewError}</p>}

                <button
                  type="submit"
                  disabled={submitting || !reviewText.trim()}
                  className="btn-luxury-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Post Review</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="glass-card p-6 h-28 animate-pulse bg-white/5" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <MessageSquare size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-display">No reviews yet. Be the first explorer!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any, i: number) => {
                  const reviewId = review._id || review.id;
                  const canDelete = user && (user.id === (review.user?._id || review.user?.id || review.user) || user.role === 'admin');
                  return (
                    <motion.div
                      key={reviewId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-6 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm border border-accent/30">
                            {(review.user?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-gray-500 text-xs font-mono">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarRating value={review.rating} />
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteReview(reviewId)}
                              className="text-gray-600 hover:text-rose-400 transition-colors"
                              title="Delete review"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{review.review}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Sidebar Booking Card ── */}
        <div className="space-y-6">
          <div className="glass-card p-8 border-primary/30 sticky top-32">
            <div className="space-y-6">
              {/* Price */}
              <div className="pb-6 border-b border-white/10">
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-widest font-mono">Investment</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">${tour.price}</span>
                  <span className="text-gray-500">/ person</span>
                </div>
                {tour.priceDiscount && (
                  <p className="text-emerald-400 text-sm mt-1 font-mono">
                    Save ${tour.priceDiscount} with early booking!
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Difficulty</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${difficulty.color}`}>{difficulty.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white font-bold">{tour.duration} Days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Group Size</span>
                  <span className="text-white font-bold">Max {tour.maxGroupSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Next Departure</span>
                  <span className="text-primary font-bold">{nextStartDate}</span>
                </div>
              </div>

              {/* Perks */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {['Professional Gear Included', 'Gourmet Meals Provided', '5-Star Accommodations', '24/7 Security & Support'].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setBookingError('');
                  setBookingModalOpen(true);
                }}
                className="w-full btn-luxury-primary h-14 text-lg font-bold tracking-wide"
              >
                Book Your Journey
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-[0.2em]">
                <Shield size={12} className="text-accent" />
                <span>Protected by Tra-Well Secure</span>
              </div>

              <button
                onClick={() => { const el = document.getElementById('reviews'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors font-mono"
              >
                <Award size={14} />
                <span>Read {reviews.length} Reviews</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Interactive Booking Modal ─── */}
      <AnimatePresence>
        {bookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setBookingModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card border-primary/30 p-8 space-y-6 overflow-hidden z-10"
            >
              {bookingSuccess ? (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto text-primary">
                    <CheckCircle2 size={44} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white font-display">Journey Reserved!</h3>
                    <p className="text-gray-400 text-sm">
                      Your space for <span className="text-white font-semibold">{tour.name}</span> has been confirmed.
                    </p>
                  </div>
                  <div className="p-4 glass-card border-primary/20 text-xs font-mono space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests:</span>
                      <span className="text-white font-bold">{bookingGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Investment:</span>
                      <span className="text-primary font-bold">
                        ${((tour.price - (tour.priceDiscount || 0)) * bookingGuests).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingModalOpen(false)}
                      className="flex-1 btn-luxury-outline text-sm"
                    >
                      Close Window
                    </button>
                    <button
                      onClick={() => {
                        setBookingModalOpen(false);
                        navigate('/profile');
                      }}
                      className="flex-1 btn-luxury-primary text-sm font-bold"
                    >
                      View My Bookings
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs font-mono text-primary uppercase tracking-widest">Reserve Experience</p>
                      <h3 className="text-2xl font-bold text-white font-display">{tour.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingModalOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Start Date Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">Departure Date</label>
                    {tour.startDates && tour.startDates.length > 0 ? (
                      <select
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="floating-label-input bg-surface"
                      >
                        {tour.startDates.map((d: string, idx: number) => (
                          <option key={idx} value={d}>
                            {new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="floating-label-input"
                      />
                    )}
                  </div>

                  {/* Guest Counter */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">Number of Guests</label>
                    <div className="flex items-center justify-between glass-card p-3 border-white/10">
                      <span className="text-sm text-white font-medium">{bookingGuests} Guest(s)</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBookingGuests((g) => Math.max(1, g - 1))}
                          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 font-bold"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingGuests((g) => Math.min(tour.maxGroupSize || 10, g + 1))}
                          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="glass-card p-4 space-y-2 border-primary/20 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Rate per guest</span>
                      <span>${(tour.price - (tour.priceDiscount || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Guests</span>
                      <span>× {bookingGuests}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/10">
                      <span>Total Investment</span>
                      <span className="text-primary font-mono text-lg">
                        ${((tour.price - (tour.priceDiscount || 0)) * bookingGuests).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {bookingError && (
                    <p className="text-rose-400 text-xs font-mono bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      {bookingError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full btn-luxury-primary h-12 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {bookingSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Confirming Reservation...</span>
                      </>
                    ) : (
                      <span>Complete Booking</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TourDetail;

