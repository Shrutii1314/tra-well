import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Save, Shield, AlertTriangle,
  Package, Star, DollarSign, MapPin, ChevronDown,
  UserCheck, Bookmark, CheckCircle2, RefreshCw, Download, Search,
  Filter, TrendingUp, Sparkles,
  Eye, UserX, Activity, ArrowUpRight, ShieldCheck, Building2,
  FileText
} from 'lucide-react';
import { getTours, createTour, updateTour, deleteTour } from '../services/tourService';
import { getAllUsers, updateUserRole, deleteUser, makeMeAdmin } from '../services/userService';
import { getAllBookings, cancelBooking } from '../services/bookingService';
import { getAllReviews } from '../services/reviewService';
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

type AdminTab = 'overview' | 'approvals' | 'agencies' | 'tours' | 'bookings' | 'users' | 'revenue';

// Mock Agency Verification Queue Items
const INITIAL_AGENCY_APPROVALS = [
  {
    id: 'AG-REQ-01',
    agencyName: 'Highland Treks & Trails',
    licenseNumber: 'IMP-GOV-2026-9901',
    contactEmail: 'contact@highlandtreks.com',
    phone: '+91 98111 22334',
    address: 'Shimla, Himachal Pradesh',
    submissionDate: '2026-11-01',
    status: 'Pending',
    govIdDoc: 'Aadhaar_Owner_Card.pdf',
    licenseDoc: 'Ministry_Tourism_License.pdf'
  },
  {
    id: 'AG-REQ-02',
    agencyName: 'Zanskar Expeditions Co.',
    licenseNumber: 'IMP-GOV-2026-9902',
    contactEmail: 'tours@zanskarexpeditions.com',
    phone: '+91 94191 77665',
    address: 'Kargil, Ladakh',
    submissionDate: '2026-11-02',
    status: 'Pending',
    govIdDoc: 'Passport_Director.pdf',
    licenseDoc: 'IMF_Accreditation_Certificate.pdf'
  }
];

const INITIAL_APPROVED_AGENCIES = [
  {
    id: 'AG-01',
    agencyName: 'Himalayan High Expeditions',
    licenseNumber: 'IMP-GOV-2022-8841',
    contactEmail: 'contact@himalayanhigh.com',
    phone: '+91 98160 12345',
    status: 'Approved',
    verified: true,
    toursCount: 42,
    revenueGenerated: 48250
  },
  {
    id: 'AG-02',
    agencyName: 'Garhwal Trekkers Club',
    licenseNumber: 'IMP-GOV-2021-7712',
    contactEmail: 'info@garhwaltrekkers.com',
    phone: '+91 97190 54321',
    status: 'Approved',
    verified: true,
    toursCount: 35,
    revenueGenerated: 39100
  }
];

const AdminPage = () => {
  const { user, token, updateUserInContext } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Overall State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [promotingAdmin, setPromotingAdmin] = useState(false);

  // Agency Approvals & Moderation Queue State
  const [approvalsQueue, setApprovalsQueue] = useState(INITIAL_AGENCY_APPROVALS);
  const [agenciesList, setAgenciesList] = useState(INITIAL_APPROVED_AGENCIES);
  const [selectedApprovalReq, setSelectedApprovalReq] = useState<any | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Tours State
  const [tours, setTours] = useState<any[]>([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTour, setEditTour] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tourSearch, setTourSearch] = useState('');

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Bookings State
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Reviews State
  const [, setReviewsList] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTours(),
      token ? fetchUsers() : Promise.resolve(),
      token ? fetchBookings() : Promise.resolve(),
      fetchReviews()
    ]);
  };

  const fetchTours = async () => {
    setToursLoading(true);
    try {
      const data = await getTours();
      setTours(data || []);
    } catch (err) {
      console.error('Failed to load tours', err);
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

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();
      setReviewsList(data || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  };

  // Elevate to Admin Action
  const handleMakeMeAdmin = async () => {
    if (!token) return;
    setPromotingAdmin(true);
    try {
      const updatedUser = await makeMeAdmin(token);
      updateUserInContext(updatedUser);
      setSuccessMsg('🎉 Congratulations! You are now an Administrator.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not upgrade account to Admin.');
    } finally {
      setPromotingAdmin(false);
    }
  };

  // Agency Approval Handlers
  const handleApproveAgency = (reqId: string) => {
    const target = approvalsQueue.find((a) => a.id === reqId);
    if (target) {
      setApprovalsQueue((prev) => prev.filter((a) => a.id !== reqId));
      setAgenciesList((prev) => [
        ...prev,
        {
          id: `AG-${prev.length + 1}`,
          agencyName: target.agencyName,
          licenseNumber: target.licenseNumber,
          contactEmail: target.contactEmail,
          phone: target.phone,
          status: 'Approved',
          verified: true,
          toursCount: 0,
          revenueGenerated: 0
        }
      ]);
      setSelectedApprovalReq(null);
      setSuccessMsg(`Agency "${target.agencyName}" approved successfully! Verified badge granted.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleRejectAgencySubmit = () => {
    if (!selectedApprovalReq) return;
    const targetName = selectedApprovalReq.agencyName;
    setApprovalsQueue((prev) => prev.filter((a) => a.id !== selectedApprovalReq.id));
    setRejectionModalOpen(false);
    setSelectedApprovalReq(null);
    setRejectionReason('');
    setSuccessMsg(`Application for "${targetName}" rejected. Notification sent to agency.`);
    setTimeout(() => setSuccessMsg(''), 4000);
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

  // User Status Toggle (Active / Suspended)
  const handleToggleUserStatus = (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    setUsersList((prev) =>
      prev.map((u) => ((u._id || u.id) === userId ? { ...u, userStatus: nextStatus } : u))
    );
    setSuccessMsg(`User status updated to ${nextStatus}.`);
    setTimeout(() => setSuccessMsg(''), 3000);
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
      setSuccessMsg('Booking cancelled successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    if (!bookingsList || bookingsList.length === 0) return;
    const headers = ['Booking ID', 'Tour Name', 'Customer Name', 'Customer Email', 'Start Date', 'Guests', 'Price ($)', 'Platform Fee (10%)', 'Status'];
    const rows = bookingsList.map((b) => [
      b._id || b.id,
      `"${b.tour?.name || 'Tour'}"`,
      `"${b.user?.name || 'Customer'}"`,
      b.user?.email || '',
      new Date(b.startDate).toLocaleDateString(),
      b.guests,
      b.price,
      Math.round((b.price || 0) * 0.1),
      b.paid ? 'Paid' : 'Pending'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trawell_admin_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      setError(err?.response?.data?.message || 'Operation failed. Check all required fields.');
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

  // Filtered lists
  const filteredTours = tours.filter((t) =>
    t.name?.toLowerCase().includes(tourSearch.toLowerCase()) ||
    t.summary?.toLowerCase().includes(tourSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredBookings = bookingsList.filter((b) => {
    const matchesSearch =
      b.tour?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingFilter === 'all' || (bookingFilter === 'paid' ? b.paid : !b.paid);
    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalPlatformRevenue = useMemo(() => {
    const base = bookingsList.reduce((acc, b) => acc + (b.price || 0), 0);
    return base > 0 ? base : 184500;
  }, [bookingsList]);

  const platformCommission = Math.round(totalPlatformRevenue * 0.1); // 10% cut

  // Role Access Guard
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 p-4 text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl max-w-lg w-full p-8 border border-slate-200 shadow-xl space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto border border-red-100 shadow-md">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display">Administrator Privileges Required</h2>
            <p className="text-slate-600 text-xs mt-2 leading-relaxed">
              You are currently signed in as <strong className="text-slate-900">{user.name}</strong> (<span className="text-primary font-mono">{user.role}</span>). Click below to elevate your account role to Administrator.
            </p>
          </div>

          <button
            onClick={handleMakeMeAdmin}
            disabled={promotingAdmin}
            className="w-full btn-luxury-primary py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
          >
            {promotingAdmin ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Upgrading Privileges...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Elevate Account to Admin</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs tracking-wider font-bold uppercase mb-1">
            <Activity size={14} className="animate-pulse" />
            <span>Platform Governance Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display tracking-tight">
            ADMIN <span className="text-primary">CONTROL CENTER</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Agency approvals, tour oversight, master booking ledgers, platform analytics & user moderation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAllData}
            className="btn-luxury-outline py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>

          {activeTab === 'bookings' && (
            <button
              onClick={handleExportCSV}
              className="btn-luxury-outline py-2 px-4 text-xs text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100 font-bold flex items-center gap-2"
            >
              <Download size={14} /> Export CSV Ledger
            </button>
          )}

          {activeTab === 'tours' && (
            <button onClick={openCreate} className="btn-luxury-primary py-2 px-4 text-xs font-bold flex items-center gap-2">
              <Plus size={16} />
              <span>Create Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-bold shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-slate-700">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Sidebar / Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: 'overview', label: 'Platform Analytics', icon: TrendingUp },
          { id: 'approvals', label: `Agency Approvals (${approvalsQueue.length})`, icon: ShieldCheck },
          { id: 'agencies', label: `Manage Agencies (${agenciesList.length})`, icon: Building2 },
          { id: 'tours', label: `Tours Oversight (${tours.length})`, icon: Package },
          { id: 'bookings', label: `Bookings Ledger (${bookingsList.length})`, icon: Bookmark },
          { id: 'users', label: `User Moderation (${usersList.length})`, icon: UserCheck },
          { id: 'revenue', label: 'Platform Revenue', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-red-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PLATFORM ANALYTICS DASHBOARD ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Platform Revenue', value: `$${totalPlatformRevenue.toLocaleString()}`, change: '10% Platform Cut', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Registered Agencies', value: `${agenciesList.length} Approved`, change: `${approvalsQueue.length} Pending Review`, icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Active Tour Packages', value: tours.length, change: 'Across all outfitters', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Total Traveler Bookings', value: bookingsList.length > 0 ? bookingsList.length : 342, change: '+18.2% YoY', icon: Bookmark, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                  <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon size={18} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-3xl font-extrabold text-slate-900 font-display">{kpi.value}</h3>
                  <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={14} /> {kpi.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Monthly Booking Trends & Platform Revenue</h3>
                  <p className="text-xs text-slate-500 font-mono">Gross Volume vs Platform Commission</p>
                </div>
                <span className="text-xs font-mono bg-red-50 text-primary px-3 py-1 rounded-full border border-red-200 font-bold">2026 Season</span>
              </div>

              <div className="h-56 w-full relative pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                  <defs>
                    <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeDasharray="4" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#F1F5F9" strokeDasharray="4" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeDasharray="4" />
                  <path d="M 0 160 Q 75 120, 150 130 T 300 70 T 450 40 L 450 180 L 0 180 Z" fill="url(#chartGradientLight)" />
                  <path d="M 0 160 Q 75 120, 150 130 T 300 70 T 450 40" fill="none" stroke="#DC2626" strokeWidth="3" />
                  {[[0,160],[75,125],[150,130],[225,95],[300,70],[375,55],[450,40]].map(([x,y], idx) => (
                    <circle key={idx} cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#DC2626" strokeWidth="3" />
                  ))}
                </svg>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                </div>
              </div>
            </div>

            {/* Quick Action Alerts Feed */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Pending Action Feed
                </h3>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>

              <div className="space-y-3">
                {approvalsQueue.map((req) => (
                  <div key={req.id} className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-900">{req.agencyName}</span>
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">New Partner</span>
                    </div>
                    <p className="text-slate-600">Submitted license: <span className="font-mono font-bold">{req.licenseNumber}</span></p>
                    <button
                      onClick={() => setSelectedApprovalReq(req)}
                      className="btn-luxury-primary text-[10px] py-1 px-3 font-bold w-full"
                    >
                      Review Credentials & Documents
                    </button>
                  </div>
                ))}

                {approvalsQueue.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-8">No pending verification alerts.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: AGENCY APPROVALS QUEUE ─── */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Compliance Queue</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Agency Verification Requests</h2>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
              {approvalsQueue.length} Pending Admin Review
            </span>
          </div>

          {approvalsQueue.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
              <p className="font-bold text-slate-900 font-display">All Verification Requests Processed</p>
              <p className="text-xs text-slate-500">There are currently no new tour operator applications waiting for review.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-3.5 px-5">Agency Name & License</th>
                    <th className="py-3.5 px-3">Contact Email</th>
                    <th className="py-3.5 px-3">Phone</th>
                    <th className="py-3.5 px-3">Submitted Date</th>
                    <th className="py-3.5 px-5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {approvalsQueue.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-extrabold text-slate-900 text-sm">{req.agencyName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">License: {req.licenseNumber}</p>
                      </td>
                      <td className="py-4 px-3 font-mono">{req.contactEmail}</td>
                      <td className="py-4 px-3 font-mono">{req.phone}</td>
                      <td className="py-4 px-3 font-mono">{req.submissionDate}</td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedApprovalReq(req)}
                          className="btn-luxury-primary text-xs py-1.5 px-3 font-bold"
                        >
                          Inspect & Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: MANAGE APPROVED AGENCIES ─── */}
      {activeTab === 'agencies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Partner Directory</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Manage Active Agencies</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-3.5 px-5">Agency Name</th>
                  <th className="py-3.5 px-3">License #</th>
                  <th className="py-3.5 px-3">Contact Email</th>
                  <th className="py-3.5 px-3">Active Tours</th>
                  <th className="py-3.5 px-3">Status Badge</th>
                  <th className="py-3.5 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {agenciesList.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        {ag.agencyName}
                        <ShieldCheck size={16} className="text-emerald-600" />
                      </p>
                    </td>
                    <td className="py-4 px-3 font-mono">{ag.licenseNumber}</td>
                    <td className="py-4 px-3 font-mono">{ag.contactEmail}</td>
                    <td className="py-4 px-3 font-mono font-bold text-slate-900">{ag.toursCount} Tours</td>
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ag.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => alert(`Access suspended for ${ag.agencyName}`)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Suspend Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: TOURS OVERSIGHT ─── */}
      {activeTab === 'tours' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tours..."
                value={tourSearch}
                onChange={(e) => setTourSearch(e.target.value)}
                className="floating-label-input pl-9 pr-4 py-2 text-xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-xs uppercase">
                    <th className="text-left p-4">Tour Name & Agency</th>
                    <th className="text-left p-4">Difficulty</th>
                    <th className="text-left p-4">Duration</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Rating</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {toursLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="p-4"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>
                    ))
                  ) : filteredTours.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-slate-500">No tours match your search.</td></tr>
                  ) : (
                    filteredTours.map((tour) => {
                      const tourId = tour._id || tour.id;
                      return (
                        <tr key={tourId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {tour.imageCover ? (
                                <img src={tour.imageCover} alt={tour.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-red-50 text-primary flex items-center justify-center shrink-0 border border-red-100">
                                  <MapPin size={18} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{tour.name}</p>
                                <p className="text-slate-500 text-xs font-mono">Host: {tour.agencyName || 'Himalayan High Expeditions'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-300 bg-slate-100 text-slate-700">
                              {tour.difficulty}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-600 text-xs">{tour.duration} days</td>
                          <td className="p-4 text-slate-900 font-extrabold font-mono">${tour.price}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                              <Star size={13} fill="currentColor" />
                              <span>{tour.ratingsAverage?.toFixed(1) || '4.8'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEdit(tour)} className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => setDeleteConfirm(tourId)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
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
        </div>
      )}

      {/* ─── TAB 5: BOOKINGS LEDGER ─── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer or tour..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="floating-label-input pl-9 pr-4 py-2 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-slate-400" />
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="floating-label-input px-3 py-1.5 text-xs font-mono cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-xs uppercase">
                  <th className="text-left p-4">Tour</th>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Start Date</th>
                  <th className="text-left p-4">Total Paid</th>
                  <th className="text-left p-4">Platform Fee (10%)</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="p-4"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : filteredBookings.map((b) => {
                  const bId = b._id || b.id;
                  const fee = Math.round((b.price || 0) * 0.1);
                  return (
                    <tr key={bId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{b.tour?.name || 'Tour Package'}</td>
                      <td className="p-4">
                        <p className="text-slate-900 font-semibold">{b.user?.name || 'Traveler'}</p>
                        <p className="text-xs text-slate-500 font-mono">{b.user?.email}</p>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-600">{new Date(b.startDate).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-extrabold text-slate-900">${b.price}</td>
                      <td className="p-4 font-mono font-extrabold text-emerald-700">+${fee}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {b.paid ? 'Paid' : 'Paid'}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <button onClick={() => setSelectedBooking(b)} className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleAdminCancelBooking(bId)}
                          disabled={cancellingBookingId === bId}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 6: USER MODERATION & RBAC ─── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="floating-label-input pl-9 pr-4 py-2 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="floating-label-input px-3 py-1.5 text-xs font-mono cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="guide">Guide</option>
                <option value="lead-guide">Lead Guide</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-xs uppercase">
                  <th className="text-left p-4">Traveler Name</th>
                  <th className="text-left p-4">Email Address</th>
                  <th className="text-left p-4">Role (RBAC)</th>
                  <th className="text-left p-4">Account Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="p-4"><div className="h-6 bg-slate-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : filteredUsers.map((usr) => {
                  const uId = usr._id || usr.id;
                  const isSuspended = usr.userStatus === 'Suspended';
                  return (
                    <tr key={uId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-primary flex items-center justify-center font-bold text-xs">
                          {usr.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{usr.name}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-xs">{usr.email}</td>
                      <td className="p-4">
                        <select
                          value={usr.role}
                          disabled={updatingUserRole === uId}
                          onChange={(e) => handleRoleChange(uId, e.target.value)}
                          className="floating-label-input px-2.5 py-1 text-xs font-mono cursor-pointer"
                        >
                          <option value="user">User</option>
                          <option value="guide">Guide</option>
                          <option value="lead-guide">Lead Guide</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          isSuspended ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {usr.userStatus || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(uId, usr.userStatus)}
                          className="text-xs font-bold text-amber-700 hover:underline"
                        >
                          {isSuspended ? 'Reinstate' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => setDeleteUserConfirm(uId)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 7: PLATFORM REVENUE BREAKDOWN ─── */}
      {activeTab === 'revenue' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Financial Yield</span>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">Platform Revenue & Surcharge Cut</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase">Gross Booking Volume</span>
              <p className="text-3xl font-extrabold text-emerald-950 font-mono">${totalPlatformRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-1">
              <span className="text-xs font-bold text-primary uppercase">10% Platform Commission</span>
              <p className="text-3xl font-extrabold text-primary font-mono">${platformCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── APPROVAL DETAIL MODAL ─── */}
      {selectedApprovalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
                <ShieldCheck size={20} className="text-amber-500" />
                <span>Review Agency Credentials</span>
              </h3>
              <button onClick={() => setSelectedApprovalReq(null)} className="text-slate-400 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">{selectedApprovalReq.agencyName}</p>
                <p className="text-slate-600 font-mono">License Number: {selectedApprovalReq.licenseNumber}</p>
                <p className="text-slate-600">Email: <strong>{selectedApprovalReq.contactEmail}</strong> • Phone: {selectedApprovalReq.phone}</p>
                <p className="text-slate-500">Address: {selectedApprovalReq.address}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-800">Submitted Documents:</p>
                <div className="flex flex-col gap-2 font-mono text-slate-700">
                  <span className="p-2 bg-slate-100 rounded-lg flex items-center gap-2">
                    <FileText size={14} className="text-primary" /> {selectedApprovalReq.govIdDoc} (Government ID)
                  </span>
                  <span className="p-2 bg-slate-100 rounded-lg flex items-center gap-2">
                    <FileText size={14} className="text-primary" /> {selectedApprovalReq.licenseDoc} (Accreditation Certificate)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectionModalOpen(true)}
                className="btn-luxury-outline py-2.5 px-4 font-bold flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs"
              >
                Decline / Reject
              </button>
              <button
                onClick={() => handleApproveAgency(selectedApprovalReq.id)}
                className="btn-luxury-primary py-2.5 px-4 font-bold flex-[2] text-xs shadow-md"
              >
                Approve & Grant Verified Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECTION REASON MODAL ─── */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
            <h3 className="text-base font-bold text-slate-900">Specify Rejection Reason</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid license credentials or unreadable document scans..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button onClick={() => setRejectionModalOpen(false)} className="btn-luxury-outline py-2 text-xs flex-1">
                Cancel
              </button>
              <button onClick={handleRejectAgencySubmit} className="btn-luxury-primary py-2 text-xs flex-1">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Booking Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setSelectedBooking(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Booking Ledger Detail</h3>
                  <p className="text-xs font-mono text-slate-400">ID: {selectedBooking._id || selectedBooking.id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Tour Package</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedBooking.tour?.name || 'Tour Package'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Customer</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedBooking.user?.name || 'Traveler'}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedBooking.user?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Start Date</span>
                    <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                      {new Date(selectedBooking.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Guests</span>
                    <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">{selectedBooking.guests} Person(s)</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900">
                  <span className="font-bold">Total Paid (10% platform fee included)</span>
                  <span className="text-lg font-extrabold font-mono">${selectedBooking.price}</span>
                </div>
              </div>

              <button onClick={() => setSelectedBooking(null)} className="w-full btn-luxury-outline py-2 text-xs">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl my-8 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">
                      {editTour ? 'Edit Tour Package' : 'Create New Tour'}
                    </h2>
                    <p className="text-slate-500 text-xs font-mono mt-1">
                      {editTour ? `Modifying ID: ${editTour._id || editTour.id}` : 'Fill in trek package details'}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tour Title *</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="floating-label-input" placeholder="e.g. Kedarkantha Winter Trek" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Duration (days) *</label>
                      <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} required className="floating-label-input" placeholder="5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Max Group *</label>
                      <input name="maxGroupSize" type="number" min="1" value={form.maxGroupSize} onChange={handleChange} required className="floating-label-input" placeholder="15" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Difficulty *</label>
                      <div className="relative">
                        <select name="difficulty" value={form.difficulty} onChange={handleChange} className="floating-label-input appearance-none pr-8">
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="difficult">Difficult</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Price ($) *</label>
                      <input name="price" type="number" min="1" value={form.price} onChange={handleChange} required className="floating-label-input" placeholder="499" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Discount ($)</label>
                      <input name="priceDiscount" type="number" min="0" value={form.priceDiscount} onChange={handleChange} className="floating-label-input" placeholder="100" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Summary *</label>
                    <input name="summary" value={form.summary} onChange={handleChange} required className="floating-label-input" placeholder="Short description headline" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Itinerary</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="floating-label-input resize-none" placeholder="Day by day itinerary..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cover Image URL</label>
                    <input name="imageCover" value={form.imageCover} onChange={handleChange} className="floating-label-input" placeholder="https://..." />
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={14} className="text-primary" /> Start Location
                    </p>
                    <input name="startLocation_description" value={form.startLocation_description} onChange={handleChange} className="floating-label-input" placeholder="City, State" />
                    <input name="startLocation_address" value={form.startLocation_address} onChange={handleChange} className="floating-label-input" placeholder="Full address" />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-700 text-xs p-3 bg-red-50 rounded-xl border border-red-200 font-bold">
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-luxury-outline py-2.5 text-xs">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 btn-luxury-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={15} />
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

      {/* Delete Tour Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Tour Package?</h3>
                <p className="text-xs text-slate-500 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-luxury-outline py-2.5 text-xs font-bold">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation */}
      <AnimatePresence>
        {deleteUserConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setDeleteUserConfirm(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <UserX size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete User Account?</h3>
                <p className="text-xs text-slate-500 mt-1">Remove user credentials permanently.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteUserConfirm(null)} className="flex-1 btn-luxury-outline py-2.5 text-xs font-bold">Cancel</button>
                <button onClick={() => handleDeleteUser(deleteUserConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md">Delete Account</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
