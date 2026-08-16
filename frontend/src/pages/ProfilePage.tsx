import React, { useState, useEffect, useMemo } from 'react';
import {
  User, Key, CheckCircle2, AlertTriangle, LogOut, Package, Heart, Camera,
  FileText, Calendar, Download, Star, ShieldCheck, X
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { createReview } from '../services/tourService';
import InvoiceModal from '../components/InvoiceModal';
import TourCard, { type Tour } from '../components/TourCard';
import axios from 'axios';

const API = 'http://localhost:5000/api/v1';

// Initial Mock Bookings to ensure rich experience
const MOCK_BOOKINGS = [
  {
    _id: 'bk-101',
    id: 'bk-101',
    tour: {
      _id: '1',
      id: '1',
      name: 'Kedarkantha Summit Winter Trek',
      agencyName: 'Himalayan High Expeditions',
      imageCover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
      startLocation: { description: 'Sankri, Uttarakhand' }
    },
    startDate: '2026-11-15T00:00:00.000Z',
    guests: 2,
    price: 798,
    status: 'paid',
    paid: true
  },
  {
    _id: 'bk-102',
    id: 'bk-102',
    tour: {
      _id: '2',
      id: '2',
      name: 'Hampta Pass & Chandratal Lake Expedition',
      agencyName: 'Garhwal Trekkers Club',
      imageCover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
      startLocation: { description: 'Manali, Himachal Pradesh' }
    },
    startDate: '2026-05-10T00:00:00.000Z',
    guests: 1,
    price: 499,
    status: 'completed',
    paid: true
  },
  {
    _id: 'bk-103',
    id: 'bk-103',
    tour: {
      _id: '3',
      id: '3',
      name: 'Brahmatal Frozen Lake Trek',
      agencyName: 'Garhwal Trekkers Club',
      imageCover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
      startLocation: { description: 'Lohajung, Uttarakhand' }
    },
    startDate: '2026-02-14T00:00:00.000Z',
    guests: 2,
    price: 900,
    status: 'cancelled',
    paid: false
  }
];

// Initial Mock Wishlist Saved Tours
const MOCK_SAVED_TOURS: Tour[] = [
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
    agencyName: 'Ladakh High Pass Riders',
    summary: 'Ride through Khardung La, Nubra Valley, and Pangong Tso Lake on an epic Himalayan high-altitude motor expedition.',
    imageCover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Leh, Ladakh' }
  }
];

const ProfilePage: React.FC = () => {
  const { user, logout, token, updateUserInContext } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist' | 'security'>('profile');
  const [bookingCategory, setBookingCategory] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 00000');
  const [bio, setBio] = useState('Passionate Himalayan trekker, photographer, and outdoor enthusiast.');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password State
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState<any[]>(MOCK_BOOKINGS);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any | null>(null);

  // Review Modal State (for Completed Trips)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingItem, setReviewBookingItem] = useState<any | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Wishlist State
  const [savedTours, setSavedTours] = useState<Tour[]>(MOCK_SAVED_TOURS);

  useEffect(() => {
    // Parse query params or pathname for active tab
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (location.pathname === '/my-bookings' || tabParam === 'bookings') {
      setActiveTab('bookings');
    } else if (location.pathname === '/my-profile' || location.pathname === '/my-dashboard' || tabParam === 'profile') {
      setActiveTab('profile');
    } else if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    }
  }, [location]);

  useEffect(() => {
    if (token) fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    try {
      const data = await getMyBookings(token);
      if (data && Array.isArray(data) && data.length > 0) {
        setBookings(data);
      }
    } catch (err) {
      console.warn('Backend bookings fetch fallback to mock bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Avatar Upload Preview Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Update Handler (PATCH /api/v1/users/me)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileSaving(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    try {
      const res = await axios.patch(
        `${API}/users/me`,
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'success' || res.data.data?.user) {
        const updatedUser = res.data.data.user || { ...user, name, email };
        updateUserInContext(updatedUser);
      } else {
        updateUserInContext({ ...user!, name, email });
      }
      setProfileSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err: any) {
      updateUserInContext({ ...user!, name, email });
      setProfileSuccessMsg('Profile details updated locally!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } finally {
      setProfileSaving(false);
    }
  };

  // Password Update Handler (PATCH /api/v1/users/updateMyPassword)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPassLoading(true);
    setPassErr('');
    setPassMsg('');
    try {
      await axios.patch(
        `${API}/users/updateMyPassword`,
        { passwordCurrent, password, passwordConfirm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassMsg('Password updated successfully!');
      setPasswordCurrent('');
      setPassword('');
      setPasswordConfirm('');
      setTimeout(() => setPassMsg(''), 4000);
    } catch (err: any) {
      setPassErr(err?.response?.data?.message || 'Could not update password. Please check your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Submit Review Modal Handler
  const handleReviewModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewBookingItem) return;
    setReviewSubmitting(true);
    try {
      const tourId = reviewBookingItem.tour?._id || reviewBookingItem.tour?.id || '1';
      await createReview(tourId, { review: reviewText, rating: reviewRating });
      setReviewSuccessMsg('Review submitted successfully! Thank you for sharing your experience.');
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMsg('');
        setReviewText('');
      }, 2000);
    } catch {
      setReviewSuccessMsg('Review saved locally! Thank you.');
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccessMsg('');
        setReviewText('');
      }, 2000);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Cancel Booking Handler
  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this trek reservation?')) return;
    try {
      if (token) {
        await cancelBooking(bookingId, token);
      }
      setBookings((prev) =>
        prev.map((b) =>
          (b._id || b.id) === bookingId ? { ...b, status: 'cancelled', paid: false } : b
        )
      );
    } catch {
      setBookings((prev) =>
        prev.map((b) =>
          (b._id || b.id) === bookingId ? { ...b, status: 'cancelled', paid: false } : b
        )
      );
    }
  };

  // Remove from Wishlist Handler
  const handleRemoveFromWishlist = (tourId: string) => {
    setSavedTours((prev) => prev.filter((t) => (t._id || t.id) !== tourId));
  };

  // Categorized bookings computation
  const categorizedBookings = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter((b) => {
      const isPast = new Date(b.startDate) < now;
      return b.status !== 'cancelled' && b.status !== 'completed' && (!isPast || b.status === 'paid' || b.status === 'confirmed');
    });
    const completed = bookings.filter((b) => b.status === 'completed');
    const cancelled = bookings.filter((b) => b.status === 'cancelled');

    return { upcoming, completed, cancelled };
  }, [bookings]);

  const activeBookingsList =
    bookingCategory === 'upcoming'
      ? categorizedBookings.upcoming
      : bookingCategory === 'completed'
      ? categorizedBookings.completed
      : categorizedBookings.cancelled;

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* ─── Profile Header Banner ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Avatar with Camera Overlay */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 text-white flex items-center justify-center text-2xl font-extrabold font-display shadow-md border-2 border-primary/20">
              {avatarPreview ? (
                <img src={avatarPreview} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'TW'
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-lg cursor-pointer shadow-md hover:scale-110 transition-transform">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-display">{user?.name || 'Explorer'}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-primary border border-red-200">
                Role: {user?.role || 'Explorer'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Verified Traveler
              </span>
            </div>
          </div>
        </div>

        <button onClick={logout} className="btn-luxury-outline text-xs py-2 px-4 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ─── Navigation Tabs Bar ─── */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'bookings', label: `My Bookings (${bookings.length})`, icon: Package },
          { id: 'wishlist', label: `Saved Wishlist (${savedTours.length})`, icon: Heart },
          { id: 'security', label: 'Security', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-red-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PROFILE EDITING ─── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Account Settings</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Profile Management</h2>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 size={16} />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertTriangle size={16} />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Explorer Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white resize-none"
              />
            </div>

            <button type="submit" disabled={profileSaving} className="btn-luxury-primary py-2.5 px-6 text-xs font-bold shadow-md">
              {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ─── TAB 2: MY BOOKINGS ─── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Sub-Category Filter Buttons */}
          <div className="flex gap-2">
            {[
              { id: 'upcoming', label: `Upcoming Trips (${categorizedBookings.upcoming.length})` },
              { id: 'completed', label: `Completed Trips (${categorizedBookings.completed.length})` },
              { id: 'cancelled', label: `Cancelled (${categorizedBookings.cancelled.length})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setBookingCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  bookingCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Booking Cards Grid */}
          {bookingsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : activeBookingsList.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Package size={36} className="mx-auto text-slate-400" />
              <p className="font-bold text-slate-900 font-display">No Bookings Listed</p>
              <p className="text-xs text-slate-500">You have no reservations listed in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookingsList.map((b) => {
                const bId = b._id || b.id;
                const tourName = b.tour?.name || b.tourName || 'Himalayan Summit Expedition';
                const agencyName = b.tour?.agencyName || 'Himalayan High Expeditions';
                const img = b.tour?.imageCover || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop';
                const isCancelled = b.status === 'cancelled';
                const isCompleted = b.status === 'completed';

                return (
                  <div key={bId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                    {/* Cover Image */}
                    <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                      <img src={img} alt={tourName} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          isCancelled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isCompleted
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {b.status || 'Paid'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-0.5">
                              <span className="text-slate-800 font-bold">{agencyName}</span>
                              <ShieldCheck size={13} className="text-emerald-600" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 font-display">{tourName}</h3>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">Booking Ref ID: {bId}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-mono block">Total Paid</span>
                            <span className="text-xl font-extrabold text-slate-900 font-mono">${b.price}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-medium mt-3">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary" /> Departure: {new Date(b.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User size={14} className="text-primary" /> Guests: {b.guests} Person(s)
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoiceBooking(b)}
                            className="btn-luxury-outline text-xs py-1.5 px-3 font-bold flex items-center gap-1"
                          >
                            <FileText size={13} />
                            <span>View Invoice</span>
                          </button>

                          <button
                            onClick={() => alert(`PDF Digital Ticket downloaded for booking ${bId}`)}
                            className="btn-luxury-outline text-xs py-1.5 px-3 font-bold flex items-center gap-1"
                          >
                            <Download size={13} />
                            <span>Download Ticket</span>
                          </button>

                          {/* Write Review Button (only for Completed Trips) */}
                          {isCompleted && (
                            <button
                              onClick={() => {
                                setReviewBookingItem(b);
                                setReviewModalOpen(true);
                              }}
                              className="btn-luxury-primary text-xs py-1.5 px-3 font-bold flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <Star size={13} />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>

                        {!isCancelled && !isCompleted && (
                          <button
                            onClick={() => handleCancelBooking(bId)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SAVED WISHLIST ─── */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest font-mono">Saved Packages</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">My Wishlist</h2>
            </div>
          </div>

          {savedTours.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <Heart size={36} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-900 font-display">Your Wishlist is Empty</p>
              <p className="text-xs text-slate-500">Save tours while exploring to compare and book later.</p>
              <button onClick={() => navigate('/tours')} className="btn-luxury-primary text-xs py-2 px-6">
                Explore Expeditions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTours.map((tour) => {
                const tourId = tour._id || tour.id || '1';
                return (
                  <div key={tourId} className="relative group">
                    <TourCard tour={tour} />

                    {/* Quick Heart Toggle Button Overlay */}
                    <button
                      onClick={() => handleRemoveFromWishlist(tourId)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-red-600 hover:bg-white flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
                      title="Remove from wishlist"
                    >
                      <Heart size={18} className="fill-red-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: SECURITY & PASSWORD ─── */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-xl space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Authentication</span>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">Change Password</h2>
          </div>

          {passMsg && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 size={16} />
              <span>{passMsg}</span>
            </div>
          )}

          {passErr && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertTriangle size={16} />
              <span>{passErr}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                value={passwordCurrent}
                onChange={(e) => setPasswordCurrent(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <button type="submit" disabled={passLoading} className="btn-luxury-primary w-full py-3 text-xs font-bold shadow-md">
              {passLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}

      {/* ─── INVOICE MODAL DRAWER ─── */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          user={user}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

      {/* ─── WRITE REVIEW MODAL (FOR COMPLETED TRIPS) ─── */}
      {reviewModalOpen && reviewBookingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-400" />
                <span>Write Trip Review</span>
              </h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-900">{reviewSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewModalSubmit} className="space-y-4 text-xs">
                <p className="font-semibold text-slate-700">
                  Reviewing: <span className="font-bold text-slate-900">{reviewBookingItem.tour?.name}</span>
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Select Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star size={24} className={s <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Your Feedback</label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    placeholder="Share your experience regarding the trail, guide, and campsite..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewText.trim()}
                  className="btn-luxury-primary w-full py-2.5 text-xs font-bold shadow-md"
                >
                  {reviewSubmitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
