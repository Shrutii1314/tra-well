import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Shield, Key, CheckCircle2, AlertTriangle, LogOut,
  Compass, Clock, DollarSign, Calendar, Trash2, MapPin, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/v1';

const ProfilePage = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => {
    if (token) {
      fetchUserBookings();
    }
  }, [token]);

  const fetchUserBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    try {
      const data = await getMyBookings(token);
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load user bookings', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!token) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, token);
      setBookings((prev) => prev.filter((b) => (b._id || b.id) !== bookingId));
      showMsg('success', 'Booking cancelled successfully.');
    } catch (err: any) {
      showMsg('error', err?.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const showMsg = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccess(msg); setError(''); }
    else { setError(msg); setSuccess(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(`${API}/users/me`, { name, email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMsg('success', 'Profile updated successfully!');
    } catch (err: any) {
      showMsg('error', err?.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { showMsg('error', 'Passwords do not match.'); return; }
    setSaving(true);
    try {
      await axios.patch(`${API}/users/updateMyPassword`, {
        passwordCurrent: currentPw,
        password: newPw,
        passwordConfirm: confirmPw,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMsg('success', 'Password changed! Please log in again.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(logout, 2000);
    } catch (err: any) {
      showMsg('error', err?.response?.data?.message || 'Password change failed.');
    } finally {
      setSaving(false);
    }
  };

  const roleColor: Record<string, string> = {
    admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'lead-guide': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    guide: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    user: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  const roleLabel = user?.role?.toUpperCase().replace('-', ' ') || 'USER';

  // Stats calculation
  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const totalDays = bookings.reduce((sum, b) => sum + (b.tour?.duration || 0), 0);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-mono text-sm tracking-[0.3em] font-bold uppercase">My Account</p>
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white tracking-tighter">
            PROFILE <span className="text-gradient-cyan">HUB</span>
          </h1>
        </div>
        <button onClick={logout} className="btn-luxury-outline flex items-center gap-2 text-rose-400 hover:text-white border-rose-500/20 hover:border-rose-500">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ─── Profile Header Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 border-primary/20"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-5xl font-display font-bold neo-glow-emerald">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
            <User size={14} className="text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center md:text-left space-y-2 flex-1">
          <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
            <Mail size={14} />
            {user?.email}
          </p>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${roleColor[user?.role || 'user']}`}>
            <Shield size={10} />
            {roleLabel}
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { icon: Compass, label: 'Bookings', value: totalBookings },
            { icon: DollarSign, label: 'Spent', value: `$${totalSpent.toLocaleString()}` },
            { icon: Clock, label: 'Days', value: `${totalDays}d` },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <stat.icon size={20} className="text-accent mx-auto" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        {(['profile', 'bookings', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab === 'bookings' ? `My Bookings (${bookings.length})` : tab}
          </button>
        ))}
      </div>

      {/* ─── Toast ─── */}
      {(success || error) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
            success ? 'border-primary/30 bg-primary/10 text-primary' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          }`}
        >
          {success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{success || error}</span>
        </motion.div>
      )}

      {/* ─── Profile Tab ─── */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="floating-label-input"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="floating-label-input"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account Role</label>
              <div className="floating-label-input opacity-60 cursor-not-allowed text-gray-400">
                {user?.role?.toUpperCase().replace('-', ' ')}
              </div>
              <p className="text-xs text-gray-600 font-mono">Role cannot be changed from this panel.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-luxury-primary flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
              ) : (
                <><CheckCircle2 size={16} /><span>Save Changes</span></>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* ─── Bookings Tab ─── */}
      {activeTab === 'bookings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Your Reserved Experiences</h3>
            <button
              onClick={() => navigate('/tours')}
              className="text-xs text-primary font-mono uppercase tracking-widest hover:underline"
            >
              + Explore More Tours
            </button>
          </div>

          {bookingsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card p-6 h-32 animate-pulse bg-white/5" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4 border-white/10">
              <Package size={48} className="text-gray-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-xl font-bold text-white font-display">No Reservations Found</p>
                <p className="text-gray-500 text-sm">You haven't booked any experiences yet.</p>
              </div>
              <button
                onClick={() => navigate('/tours')}
                className="btn-luxury-primary font-bold text-sm px-6 py-3"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const bId = booking._id || booking.id;
                const tourData = booking.tour || {};
                return (
                  <motion.div
                    key={bId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      {tourData.imageCover ? (
                        <img
                          src={tourData.imageCover}
                          alt={tourData.name}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                          <Compass size={28} className="text-primary" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Confirmed & Paid
                        </span>
                        <h4 className="text-xl font-bold text-white font-display">
                          {tourData.name || 'Tour Experience'}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-primary" />
                            {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>• {booking.guests} Guest(s)</span>
                          {tourData.duration && <span>• {tourData.duration} Days</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Total Price</p>
                        <p className="text-2xl font-extrabold text-primary font-mono">
                          ${booking.price?.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancelBooking(bId)}
                        disabled={cancellingId === bId}
                        className="p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                        title="Cancel Reservation"
                      >
                        {cancellingId === bId ? (
                          <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Security Tab ─── */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
          <p className="text-gray-500 text-sm mb-6">You will be logged out after a successful password change.</p>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  required
                  className="floating-label-input pl-10"
                  placeholder="••••••••"
                />
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  minLength={8}
                  className="floating-label-input pl-10"
                  placeholder="Min. 8 characters"
                />
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  className="floating-label-input pl-10"
                  placeholder="Repeat new password"
                />
                <CheckCircle2 size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${confirmPw && confirmPw === newPw ? 'text-primary' : 'text-gray-500'}`} />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-luxury-primary flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Updating...</span></>
              ) : (
                <><Key size={16} /><span>Change Password</span></>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
