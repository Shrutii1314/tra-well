import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Save, Shield, AlertTriangle,
  Package, Star, Clock, Users, DollarSign, MapPin, ChevronDown,
  UserCheck, Bookmark, CheckCircle2, RefreshCw
} from 'lucide-react';
import { getTours, createTour, updateTour, deleteTour } from '../services/tourService';
import { getAllUsers, updateUserRole, deleteUser } from '../services/userService';
import { getAllBookings, cancelBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  name: '',
  duration: '',
  maxGroupSize: '',
  difficulty: 'easy',
  price: '',
  priceDiscount: '',
  summary: '',
  description: '',
  imageCover: '',
  startLocation_description: '',
  startLocation_address: '',
  startLocation_lat: '',
  startLocation_lng: '',
};

type AdminTab = 'tours' | 'users' | 'bookings';

const AdminPage = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('tours');

  // Tours State
  const [tours, setTours] = useState<any[]>([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTour, setEditTour] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);

  // Bookings State
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && token) {
      fetchUsers();
    } else if (activeTab === 'bookings' && token) {
      fetchBookings();
    }
  }, [activeTab, token]);

  const fetchTours = async () => {
    setToursLoading(true);
    try {
      const data = await getTours();
      setTours(data || []);
    } finally {
      setToursLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const data = await getAllUsers(token);
      setUsersList(data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    try {
      const data = await getAllBookings(token);
      setBookingsList(data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Role Handler
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) return;
    setUpdatingUserRole(userId);
    try {
      const updated = await updateUserRole(userId, newRole, token);
      setUsersList((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: updated.role } : u))
      );
      setSuccessMsg('User role updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not update role.');
    } finally {
      setUpdatingUserRole(null);
    }
  };

  // User Delete
  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    try {
      await deleteUser(userId, token);
      setUsersList((prev) => prev.filter((u) => (u._id || u.id) !== userId));
      setDeleteUserConfirm(null);
      setSuccessMsg('User deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not delete user.');
    }
  };

  // Booking Cancel (Admin)
  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!token) return;
    setCancellingBookingId(bookingId);
    try {
      await cancelBooking(bookingId, token);
      setBookingsList((prev) => prev.filter((b) => (b._id || b.id) !== bookingId));
      setSuccessMsg('Booking cancelled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const openCreate = () => {
    setEditTour(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (tour: any) => {
    setEditTour(tour);
    setForm({
      name: tour.name || '',
      duration: String(tour.duration || ''),
      maxGroupSize: String(tour.maxGroupSize || ''),
      difficulty: tour.difficulty || 'easy',
      price: String(tour.price || ''),
      priceDiscount: String(tour.priceDiscount || ''),
      summary: tour.summary || '',
      description: tour.description || '',
      imageCover: tour.imageCover || '',
      startLocation_description: tour.startLocation?.description || '',
      startLocation_address: tour.startLocation?.address || '',
      startLocation_lat: tour.startLocation?.coordinates?.[1]?.toString() || '',
      startLocation_lng: tour.startLocation?.coordinates?.[0]?.toString() || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        name: form.name,
        duration: Number(form.duration),
        maxGroupSize: Number(form.maxGroupSize),
        difficulty: form.difficulty,
        price: Number(form.price),
        summary: form.summary,
        description: form.description,
        imageCover: form.imageCover || undefined,
      };
      if (form.priceDiscount) payload.priceDiscount = Number(form.priceDiscount);
      if (form.startLocation_lat && form.startLocation_lng) {
        payload.startLocation = {
          type: 'Point',
          coordinates: [Number(form.startLocation_lng), Number(form.startLocation_lat)],
          description: form.startLocation_description,
          address: form.startLocation_address,
        };
      }

      if (editTour) {
        const updated = await updateTour(editTour._id || editTour.id, payload);
        setTours((prev) =>
          prev.map((t) => (t._id === updated._id || t.id === updated.id ? updated : t))
        );
        setSuccessMsg('Tour updated successfully!');
      } else {
        const created = await createTour(payload);
        setTours((prev) => [created, ...prev]);
        setSuccessMsg('Tour created successfully!');
      }
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Operation failed. Check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tourId: string) => {
    try {
      await deleteTour(tourId);
      setTours((prev) => prev.filter((t) => t._id !== tourId && t.id !== tourId));
      setDeleteConfirm(null);
      setSuccessMsg('Tour deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not delete tour.');
    }
  };

  // If non-admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <Shield size={40} className="text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
        <p className="text-gray-500 text-center max-w-sm">
          You need administrator privileges to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-primary font-mono text-sm tracking-[0.3em] font-bold uppercase">Control Center</p>
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white tracking-tighter">
            ADMIN <span className="text-gradient-cyan">PORTAL</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Manage system tours, user permissions, and customer reservations
          </p>
        </div>
        {activeTab === 'tours' && (
          <button
            onClick={openCreate}
            className="btn-luxury-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Create New Tour</span>
          </button>
        )}
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 border-primary/30 flex items-center gap-3 text-primary"
          >
            <CheckCircle2 size={18} />
            <span className="text-sm font-mono">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
        {[
          { id: 'tours', label: `Tours (${tours.length})`, icon: Package },
          { id: 'users', label: 'User Directory', icon: UserCheck },
          { id: 'bookings', label: 'All Bookings', icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: TOURS MANAGEMENT ─── */}
      {activeTab === 'tours' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'Total Tours', value: tours.length },
              {
                icon: Star,
                label: 'Avg Rating',
                value: tours.length
                  ? (tours.reduce((a, t) => a + (t.ratingsAverage || 0), 0) / tours.length).toFixed(1)
                  : '—',
              },
              {
                icon: DollarSign,
                label: 'Avg Price',
                value: tours.length
                  ? `$${Math.round(tours.reduce((a, t) => a + (t.price || 0), 0) / tours.length)}`
                  : '—',
              },
              {
                icon: Users,
                label: 'Avg Group Size',
                value: tours.length
                  ? Math.round(tours.reduce((a, t) => a + (t.maxGroupSize || 0), 0) / tours.length)
                  : '—',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 space-y-2"
              >
                <stat.icon size={20} className="text-accent" />
                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Tours Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Tour</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Difficulty</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Duration</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Price</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Rating</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {toursLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="p-4">
                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : tours.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-500">
                        No tours found.
                      </td>
                    </tr>
                  ) : (
                    tours.map((tour, i) => {
                      const tourId = tour._id || tour.id;
                      return (
                        <tr
                          key={tourId}
                          className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {tour.imageCover ? (
                                <img
                                  src={tour.imageCover}
                                  alt={tour.name}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <MapPin size={18} className="text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-white">{tour.name}</p>
                                <p className="text-gray-500 text-xs line-clamp-1">{tour.startLocation?.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              tour.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              tour.difficulty === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                              'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            }`}>
                              {tour.difficulty}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <Clock size={13} className="text-accent" />
                              <span>{tour.duration}d</span>
                            </div>
                          </td>
                          <td className="p-4 text-white font-bold">${tour.price?.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star size={13} fill="currentColor" />
                              <span className="text-white font-bold">{tour.ratingsAverage?.toFixed(1) || '—'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(tour)}
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(tourId)}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 2: USERS DIRECTORY ─── */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Registered Accounts ({usersList.length})</h3>
            <button onClick={fetchUsers} className="text-xs font-mono text-gray-400 hover:text-primary flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">User</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Email</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Role</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td colSpan={4} className="p-4">
                          <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-500">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((usr) => {
                      const uId = usr._id || usr.id;
                      return (
                        <tr key={uId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
                              {usr.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{usr.name}</span>
                          </td>
                          <td className="p-4 text-gray-400 font-mono text-xs">{usr.email}</td>
                          <td className="p-4">
                            <select
                              value={usr.role}
                              disabled={updatingUserRole === uId}
                              onChange={(e) => handleRoleChange(uId, e.target.value)}
                              className="bg-surface border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono cursor-pointer"
                            >
                              <option value="user">User</option>
                              <option value="guide">Guide</option>
                              <option value="lead-guide">Lead Guide</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setDeleteUserConfirm(uId)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                              title="Delete User Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 3: ALL BOOKINGS ─── */}
      {activeTab === 'bookings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Platform Reservations ({bookingsList.length})</h3>
            <button onClick={fetchBookings} className="text-xs font-mono text-gray-400 hover:text-primary flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Tour</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Customer</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Date</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Guests</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Price</th>
                    <th className="text-left p-4 text-gray-500 font-mono text-xs uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td colSpan={6} className="p-4">
                          <div className="h-4 bg-white/5 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : bookingsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-500">
                        No customer bookings found in the system.
                      </td>
                    </tr>
                  ) : (
                    bookingsList.map((b) => {
                      const bId = b._id || b.id;
                      return (
                        <tr key={bId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="p-4 font-bold text-white">{b.tour?.name || 'Tour'}</td>
                          <td className="p-4 text-gray-300">
                            <p className="font-semibold">{b.user?.name || 'Customer'}</p>
                            <p className="text-xs text-gray-500 font-mono">{b.user?.email}</p>
                          </td>
                          <td className="p-4 text-gray-400 font-mono text-xs">
                            {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-4 text-white font-mono">{b.guests}</td>
                          <td className="p-4 text-primary font-bold font-mono">${b.price?.toLocaleString()}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleAdminCancelBooking(bId)}
                              disabled={cancellingBookingId === bId}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                              title="Cancel Reservation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Create/Edit Tour Modal ─── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/20"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {editTour ? 'Edit Tour' : 'Create New Tour'}
                    </h2>
                    <p className="text-gray-500 text-sm font-mono mt-1">
                      {editTour ? `Editing: ${editTour.name}` : 'Fill in the tour details below'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-10 h-10 glass-morphism rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tour Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="floating-label-input" placeholder="e.g. The Forest Hiker" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration (days) *</label>
                      <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} required className="floating-label-input" placeholder="7" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max Group *</label>
                      <input name="maxGroupSize" type="number" min="1" value={form.maxGroupSize} onChange={handleChange} required className="floating-label-input" placeholder="15" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Difficulty *</label>
                      <div className="relative">
                        <select name="difficulty" value={form.difficulty} onChange={handleChange} className="floating-label-input appearance-none pr-8">
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="difficult">Difficult</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price ($) *</label>
                      <input name="price" type="number" min="1" value={form.price} onChange={handleChange} required className="floating-label-input" placeholder="1499" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Discount ($)</label>
                      <input name="priceDiscount" type="number" min="0" value={form.priceDiscount} onChange={handleChange} className="floating-label-input" placeholder="200" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Summary *</label>
                    <input name="summary" value={form.summary} onChange={handleChange} required className="floating-label-input" placeholder="A one-sentence headline for the tour" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="floating-label-input resize-none" placeholder="Rich detailed description..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cover Image URL</label>
                    <input name="imageCover" value={form.imageCover} onChange={handleChange} className="floating-label-input" placeholder="https://..." />
                  </div>

                  <div className="space-y-3 p-4 rounded-xl border border-white/10 bg-white/3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} /> Start Location
                    </p>
                    <input name="startLocation_description" value={form.startLocation_description} onChange={handleChange} className="floating-label-input" placeholder="City, Country" />
                    <input name="startLocation_address" value={form.startLocation_address} onChange={handleChange} className="floating-label-input" placeholder="Full address" />
                    <div className="grid grid-cols-2 gap-3">
                      <input name="startLocation_lat" type="number" step="any" value={form.startLocation_lat} onChange={handleChange} className="floating-label-input font-mono" placeholder="Latitude" />
                      <input name="startLocation_lng" type="number" step="any" value={form.startLocation_lng} onChange={handleChange} className="floating-label-input font-mono" placeholder="Longitude" />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-400 text-sm p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-luxury-outline">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 btn-luxury-primary flex items-center justify-center gap-2 disabled:opacity-50">
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {editTour ? 'Save Changes' : 'Create Tour'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Tour Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative glass-card p-8 max-w-sm w-full text-center space-y-6 border-rose-500/20">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Delete Tour?</h3>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-luxury-outline">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Confirm */}
      <AnimatePresence>
        {deleteUserConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteUserConfirm(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative glass-card p-8 max-w-sm w-full text-center space-y-6 border-rose-500/20">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Delete User Account?</h3>
              <div className="flex gap-3">
                <button onClick={() => setDeleteUserConfirm(null)} className="flex-1 btn-luxury-outline">Cancel</button>
                <button onClick={() => handleDeleteUser(deleteUserConfirm)} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold">Delete Account</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
