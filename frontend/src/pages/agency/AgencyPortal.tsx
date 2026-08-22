import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Package, Users, Plus, Download, 
  Search, ShieldCheck, DollarSign, X, CheckCircle2,
  TrendingUp, RefreshCw, Pencil, Trash2, Copy, Eye, Activity
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { saveAgencyProfile, saveAgencyTour, getStoredTours } from '../../services/agencyStore';

// ─── INITIAL DATA TYPES & DEMO STATE ───
interface AgencyTour {
  id: string;
  title: string;
  category: string;
  duration: number;
  capacity: number;
  bookedSeats: number;
  price: number;
  status: 'Active' | 'Draft' | 'Completed' | 'Cancelled';
  startDate: string;
  pickupLocation: string;
  agencyEmail?: string;
  itinerary: { day: number; title: string; desc: string }[];
  inclusions: string[];
  exclusions: string[];
}

const INITIAL_AGENCY_TOURS: AgencyTour[] = [
  {
    id: 'AT-101',
    title: 'Kedarkantha Summit Winter Trek',
    category: 'Winter Summit',
    duration: 5,
    capacity: 20,
    bookedSeats: 18,
    price: 399,
    status: 'Active',
    startDate: '2026-11-02',
    pickupLocation: 'Sankri, Uttarakhand',
    itinerary: [
      { day: 1, title: 'Arrival at Sankri Base Camp', desc: 'Briefing and equipment checks.' },
      { day: 2, title: 'Trek to Juda Ka Talab', desc: '4 km ascent through pine forest.' }
    ],
    inclusions: ['Certified Guide', 'Meals & Tents', 'Forest Permits'],
    exclusions: ['Personal Porter', 'Insurance']
  },
  {
    id: 'AT-102',
    title: 'Hampta Pass & Chandratal Circuit',
    category: 'Cross-over Trek',
    duration: 6,
    capacity: 16,
    bookedSeats: 14,
    price: 499,
    status: 'Active',
    startDate: '2026-05-10',
    pickupLocation: 'Manali, Himachal Pradesh',
    itinerary: [
      { day: 1, title: 'Drive to Jobra & Trek to Chika', desc: 'Easy 2 hr walk along river.' }
    ],
    inclusions: ['Certified Guide', 'Meals & Tents'],
    exclusions: ['Offloading Fee']
  },
  {
    id: 'AT-103',
    title: 'Brahmatal Ridge Snow Expedition',
    category: 'Winter Summit',
    duration: 6,
    capacity: 15,
    bookedSeats: 15,
    price: 450,
    status: 'Completed',
    startDate: '2026-02-14',
    pickupLocation: 'Lohajung, Uttarakhand',
    itinerary: [],
    inclusions: ['Certified Guide', 'Meals'],
    exclusions: []
  }
];

interface CandidateBooking {
  id: string;
  bookingRef: string;
  tourTitle: string;
  tourId: string;
  travelerName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  seats: number;
  dietaryMedical: string;
  totalPaid: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
}

const INITIAL_ROSTER: CandidateBooking[] = [
  {
    id: 'ROST-01',
    bookingRef: 'TW-BK-9041',
    tourTitle: 'Kedarkantha Summit Winter Trek',
    tourId: 'AT-101',
    travelerName: 'Rohan Sharma',
    age: 28,
    gender: 'Male',
    email: 'rohan.sharma@example.com',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 00000',
    seats: 2,
    dietaryMedical: 'Strictly Vegetarian, carries asthma inhaler',
    totalPaid: 798,
    paymentStatus: 'Paid'
  },
  {
    id: 'ROST-02',
    bookingRef: 'TW-BK-9042',
    tourTitle: 'Kedarkantha Summit Winter Trek',
    tourId: 'AT-101',
    travelerName: 'Ananya Verma',
    age: 25,
    gender: 'Female',
    email: 'ananya.v@example.com',
    phone: '+91 98123 45678',
    emergencyPhone: '+91 98123 00000',
    seats: 1,
    dietaryMedical: 'No allergies, requested extra sleeping bag',
    totalPaid: 399,
    paymentStatus: 'Paid'
  },
  {
    id: 'ROST-03',
    bookingRef: 'TW-BK-9043',
    tourTitle: 'Hampta Pass & Chandratal Circuit',
    tourId: 'AT-102',
    travelerName: 'Vikramaditya Singh',
    age: 34,
    gender: 'Male',
    email: 'vikram.singh@example.com',
    phone: '+91 97788 11223',
    emergencyPhone: '+91 97788 00000',
    seats: 1,
    dietaryMedical: 'None',
    totalPaid: 499,
    paymentStatus: 'Paid'
  }
];

type AgencyTab = 'overview' | 'tours' | 'bookings' | 'settings';

const AgencyPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tab State (matching Admin control center)
  const [activeTab, setActiveTab] = useState<AgencyTab>('overview');

  // Tours & Roster State
  const [tours, setTours] = useState<AgencyTour[]>(INITIAL_AGENCY_TOURS);
  const [roster] = useState<CandidateBooking[]>(INITIAL_ROSTER);
  const [tourStatusFilter, setTourStatusFilter] = useState<string>('All');
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Modals & Verification State
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<AgencyTour | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateBooking | null>(null);
  const [verificationStatus] = useState<'pending' | 'approved'>('approved');

  // Tour Form State
  const [tourForm, setTourForm] = useState({
    title: '',
    category: 'Winter Summit',
    duration: 5,
    capacity: 15,
    price: 399,
    pickupLocation: '',
    description: '',
    itineraryDays: [{ day: 1, title: 'Day 1 Arrival', desc: 'Orientation and dinner' }],
    inclusions: ['Certified Guide', 'Meals & Tents', 'Forest Permits'],
    exclusions: ['Personal Travel Insurance', 'Porter Charges']
  });

  // Business Profile State
  const [agencyProfile, setAgencyProfile] = useState({
    name: user?.name ? `${user.name} Expeditions` : 'Himalayan High Expeditions',
    license: 'IMP-GOV-2026-8841',
    phone: '+91 98160 12345',
    email: user?.email || 'agency@trawell.com',
    website: 'www.trawell-agencies.com',
    bio: 'Specialists in Himalayan summit treks, winter expeditions, and high-altitude wilderness survival since 2012.'
  });

  // Auto-sync agency profile to agencyStore on mount or user change
  useEffect(() => {
    saveAgencyProfile({
      name: agencyProfile.name,
      email: agencyProfile.email,
      phone: agencyProfile.phone,
      website: agencyProfile.website,
      bio: agencyProfile.bio,
      location: 'Manali, Himachal Pradesh'
    });
  }, [user, agencyProfile.name]);

  // Load custom agency tours from store on mount
  useEffect(() => {
    const stored = getStoredTours();
    if (stored && stored.length > 0) {
      setTours((prev) => {
        const map = new Map<string, AgencyTour>();
        prev.forEach((t) => map.set(t.id, t));
        stored.forEach((s) => map.set(s.id || s._id, s));
        return Array.from(map.values());
      });
    }
  }, []);

  // Handle Tab Switch from URL path
  useEffect(() => {
    if (location.pathname.includes('/tours')) setActiveTab('tours');
    else if (location.pathname.includes('/bookings')) setActiveTab('bookings');
    else if (location.pathname.includes('/settings')) setActiveTab('settings');
    else setActiveTab('overview');
  }, [location]);

  // Filter tours so ONLY packages created or owned by this specific agency are visible
  const agencyTours = useMemo(() => {
    const currentEmail = user?.email || 'agency@trawell.com';
    return tours.filter((t) => !t.agencyEmail || t.agencyEmail === currentEmail);
  }, [tours, user]);

  // Compute Metrics based strictly on this agency's tours
  const totalRevenue = useMemo(() => agencyTours.reduce((acc, t) => acc + t.bookedSeats * t.price, 0), [agencyTours]);
  const activeToursCount = useMemo(() => agencyTours.filter((t) => t.status === 'Active').length, [agencyTours]);
  const totalTravelers = useMemo(() => roster.length, [roster]);
  const overallCapacity = useMemo(() => agencyTours.reduce((acc, t) => acc + t.capacity, 0), [agencyTours]);
  const overallBooked = useMemo(() => agencyTours.reduce((acc, t) => acc + t.bookedSeats, 0), [agencyTours]);
  const occupancyPercentage = overallCapacity > 0 ? Math.round((overallBooked / overallCapacity) * 100) : 0;


  // Handle Save Tour
  const handleSaveTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourForm.title) return;

    if (editingTour) {
      setTours((prev) =>
        prev.map((t) =>
          t.id === editingTour.id
            ? {
                ...t,
                title: tourForm.title,
                category: tourForm.category,
                duration: tourForm.duration,
                capacity: tourForm.capacity,
                price: tourForm.price,
                pickupLocation: tourForm.pickupLocation
              }
            : t
        )
      );
      setSuccessMsg(`Updated tour "${tourForm.title}" successfully.`);
    } else {
      const newTour: AgencyTour = {
        id: `AT-${Date.now().toString().slice(-4)}`,
        title: tourForm.title,
        category: tourForm.category,
        duration: tourForm.duration,
        capacity: tourForm.capacity,
        bookedSeats: 0,
        price: tourForm.price,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        pickupLocation: tourForm.pickupLocation || 'Base Station',
        agencyEmail: user?.email || 'agency@trawell.com',
        itinerary: tourForm.itineraryDays,
        inclusions: tourForm.inclusions,
        exclusions: tourForm.exclusions
      };

      // Persist tour globally across application
      saveAgencyTour({
        ...newTour,
        agencyName: agencyProfile.name,
        agencyEmail: user?.email || 'agency@trawell.com'
      });

      setTours((prev) => [newTour, ...prev]);
      setSuccessMsg(`Published new tour "${newTour.title}" successfully!`);
    }

    setBuilderModalOpen(false);
    setEditingTour(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Duplicate Tour Template
  const handleDuplicateTour = (tour: AgencyTour) => {
    const dup: AgencyTour = {
      ...tour,
      id: `AT-10${tours.length + 1}`,
      title: `${tour.title} (Copy)`,
      bookedSeats: 0,
      status: 'Draft'
    };
    setTours((prev) => [dup, ...prev]);
    setSuccessMsg(`Duplicated "${tour.title}" as draft.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Delete Tour
  const handleDeleteTour = (tourId: string) => {
    if (confirm('Are you sure you want to delete this tour package?')) {
      setTours((prev) => prev.filter((t) => t.id !== tourId));
      setSuccessMsg('Tour package deleted.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Export Candidate Roster to CSV
  const handleExportCSV = () => {
    const csvHeader = 'Candidate ID,Booking Ref,Tour Title,Traveler Name,Age,Gender,Phone,Emergency Phone,Dietary/Medical,Paid Amount,Payment Status\n';
    const csvRows = roster
      .map(
        (r) =>
          `"${r.id}","${r.bookingRef}","${r.tourTitle}","${r.travelerName}",${r.age},"${r.gender}","${r.phone}","${r.emergencyPhone}","${r.dietaryMedical}",$${r.totalPaid},"${r.paymentStatus}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TraWell_Agency_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    const q = rosterSearch.toLowerCase();
    return roster.filter(
      (r) =>
        r.travelerName.toLowerCase().includes(q) ||
        r.bookingRef.toLowerCase().includes(q) ||
        r.tourTitle.toLowerCase().includes(q)
    );
  }, [roster, rosterSearch]);

  return (
    <div className="space-y-8 pb-16">
      {/* ─── 1. HEADER (Identical to Admin Control Center style) ─── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-mono text-xs tracking-wider font-bold uppercase mb-1">
            <Activity size={14} className="animate-pulse" />
            <span>Agency Operator Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display tracking-tight">
            AGENCY <span className="text-amber-500">CONTROL CENTER</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Publish tour packages, manage traveler rosters, track departure occupancies & business settings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSuccessMsg('Refreshed agency portal metrics.')}
            className="btn-luxury-outline py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw size={14} /> Refresh Console
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-luxury-outline py-2 px-4 text-xs text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100 font-bold flex items-center gap-2"
          >
            <Download size={14} /> Export Roster CSV
          </button>

          <button
            onClick={() => {
              setEditingTour(null);
              setBuilderModalOpen(true);
            }}
            className="btn-luxury-primary py-2 px-4 text-xs font-bold flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20"
          >
            <Plus size={16} />
            <span>Create Tour Package</span>
          </button>
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

      {/* ─── 3. NAVIGATION PILL TABS (Identical to Admin Control Center) ─── */}
      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
          { id: 'tours', label: `My Tour Packages (${agencyTours.length})`, icon: Package },
          { id: 'bookings', label: `Traveler Candidate Rosters (${roster.length})`, icon: Users },
          { id: 'settings', label: 'Agency Profile & Business', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AgencyTab);
                navigate(`/agency/${tab.id === 'overview' ? 'dashboard' : tab.id}`);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: OVERVIEW & ANALYTICS DASHBOARD ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Revenue Generated', value: `$${totalRevenue.toLocaleString()}`, change: '+14% vs last month', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Active Tour Packages', value: `${activeToursCount}`, change: `${agencyTours.length} total packages`, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Enrolled Travelers', value: `${totalTravelers}`, change: 'Active candidate bookings', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Capacity Utilization', value: `${occupancyPercentage}%`, change: `${overallBooked}/${overallCapacity} total seats`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{m.label}</span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${m.bg} ${m.color} border border-slate-200/60 shadow-xs`}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{m.value}</div>
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <span>{m.change}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upcoming Departures Occupancy Widget */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">Live Departures</span>
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Upcoming Expedition Batches</h2>
              </div>
              <button
                onClick={() => setActiveTab('tours')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
              >
                Manage All Packages →
              </button>
            </div>

            <div className="space-y-4">
              {agencyTours.map((t) => {
                const pct = Math.round((t.bookedSeats / t.capacity) * 100);
                return (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">{t.title}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            {t.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Departure Date: <strong>{t.startDate}</strong> • Pickup: {t.pickupLocation}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {t.bookedSeats} / {t.capacity} Seats Booked ({pct}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TOUR PACKAGE MANAGEMENT ─── */}
      {activeTab === 'tours' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">Inventory Control</span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">Tour Package Management</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-slate-200">
                {['All', 'Active', 'Draft', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTourStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      tourStatusFilter === st
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingTour(null);
                  setBuilderModalOpen(true);
                }}
                className="btn-luxury-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-md"
              >
                <Plus size={15} />
                <span>New Package</span>
              </button>
            </div>
          </div>

          {/* Tour Packages Table (Admin style) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-3.5 px-5">Tour Title & Category</th>
                  <th className="py-3.5 px-3">Price / Seat</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Occupancy</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {agencyTours
                  .filter((t) => tourStatusFilter === 'All' || t.status === tourStatusFilter)
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-extrabold text-slate-900 text-sm">{t.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          ID: {t.id} • Category: {t.category}
                        </p>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-slate-900">${t.price}</td>
                      <td className="py-4 px-3 font-mono">{t.duration} Days</td>
                      <td className="py-4 px-3 font-mono">
                        {t.bookedSeats} / {t.capacity} Seats
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          t.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingTour(t);
                            setTourForm({
                              title: t.title,
                              category: t.category,
                              duration: t.duration,
                              capacity: t.capacity,
                              price: t.price,
                              pickupLocation: t.pickupLocation,
                              description: '',
                              itineraryDays: t.itinerary,
                              inclusions: t.inclusions,
                              exclusions: t.exclusions
                            });
                            setBuilderModalOpen(true);
                          }}
                          className="btn-luxury-outline py-1 px-2.5 text-[11px] font-bold text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                        >
                          <Pencil size={13} className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateTour(t)}
                          className="btn-luxury-outline py-1 px-2.5 text-[11px] font-bold text-slate-600 hover:text-slate-900"
                        >
                          <Copy size={13} className="inline mr-1" /> Copy
                        </button>
                        <button
                          onClick={() => handleDeleteTour(t.id)}
                          className="btn-luxury-outline py-1 px-2.5 text-[11px] font-bold text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                        >
                          <Trash2 size={13} className="inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: TRAVELER ROSTER LEDGER ─── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">Traveler Roster</span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">Candidate Rosters & Ledgers</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative max-w-xs">
                <input
                  type="text"
                  placeholder="Search candidate name or ref..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-9 py-2 text-xs text-slate-900 outline-none focus:border-amber-500 shadow-xs"
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                onClick={handleExportCSV}
                className="btn-luxury-outline text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Master Roster Table (Admin style) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="py-3.5 px-5">Traveler Candidate</th>
                  <th className="py-3.5 px-3">Tour Package</th>
                  <th className="py-3.5 px-3">Age / Gender</th>
                  <th className="py-3.5 px-3">Phone</th>
                  <th className="py-3.5 px-3">Payment Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredRoster.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-extrabold text-slate-900 text-sm">{r.travelerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Ref: {r.bookingRef}</p>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-800">{r.tourTitle}</td>
                    <td className="py-4 px-3 font-mono">{r.age} yrs • {r.gender}</td>
                    <td className="py-4 px-3 font-mono">{r.phone}</td>
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.paymentStatus} (${r.totalPaid})
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedCandidate(r)}
                        className="btn-luxury-outline text-[11px] py-1 px-3 font-bold"
                      >
                        <Eye size={13} className="inline mr-1" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: AGENCY PROFILE & BUSINESS SETTINGS ─── */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">Business Branding</span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display">Agency Business Profile</h2>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-emerald-900 uppercase">Verified Tour Operator Accreditation</p>
              <p className="text-[11px] text-emerald-700">License ID: {agencyProfile.license} • Approval Status: {verificationStatus.toUpperCase()}</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSuccessMsg('Agency business settings saved successfully!');
              setTimeout(() => setSuccessMsg(''), 4000);
            }}
            className="space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Agency / Business Name</label>
                <input
                  type="text"
                  value={agencyProfile.name}
                  onChange={(e) => setAgencyProfile({ ...agencyProfile, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Official Contact Email</label>
                <input
                  type="email"
                  value={agencyProfile.email}
                  onChange={(e) => setAgencyProfile({ ...agencyProfile, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Business Contact Phone</label>
                <input
                  type="text"
                  value={agencyProfile.phone}
                  onChange={(e) => setAgencyProfile({ ...agencyProfile, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Official Website</label>
                <input
                  type="text"
                  value={agencyProfile.website}
                  onChange={(e) => setAgencyProfile({ ...agencyProfile, website: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase">Agency Bio & Specialization</label>
              <textarea
                rows={3}
                value={agencyProfile.bio}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500 resize-none font-medium"
              />
            </div>

            <button type="submit" className="btn-luxury-primary py-2.5 px-6 text-xs font-bold bg-amber-500 text-slate-950 border-amber-600 shadow-md">
              Save Business Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* ─── TOUR BUILDER MODAL ─── */}
      {builderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 font-display">
                {editingTour ? 'Edit Tour Package' : 'Create New Tour Package'}
              </h3>
              <button onClick={() => setBuilderModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTour} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tour Title</label>
                <input
                  type="text"
                  value={tourForm.title}
                  onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                  required
                  placeholder="e.g. Kedarkantha Summit Winter Trek"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration (Days)</label>
                  <input
                    type="number"
                    value={tourForm.duration}
                    onChange={(e) => setTourForm({ ...tourForm, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Capacity</label>
                  <input
                    type="number"
                    value={tourForm.capacity}
                    onChange={(e) => setTourForm({ ...tourForm, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price / Seat ($)</label>
                  <input
                    type="number"
                    value={tourForm.price}
                    onChange={(e) => setTourForm({ ...tourForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Pickup Base Station Location</label>
                <input
                  type="text"
                  value={tourForm.pickupLocation}
                  onChange={(e) => setTourForm({ ...tourForm, pickupLocation: e.target.value })}
                  placeholder="e.g. Sankri, Uttarakhand"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <button type="submit" className="btn-luxury-primary w-full py-3 text-xs font-bold bg-amber-500 text-slate-950 border-amber-600 shadow-md">
                Save & Publish Tour Package
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── CANDIDATE DETAIL MODAL ─── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Traveler Candidate Roster</span>
                <h3 className="text-base font-extrabold text-slate-900 font-display">{selectedCandidate.travelerName}</h3>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Booking Ref</span>
                  <span className="font-bold font-mono text-slate-900">{selectedCandidate.bookingRef}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Paid</span>
                  <span className="font-bold font-mono text-emerald-600">${selectedCandidate.totalPaid}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase block text-[10px]">Tour Package</span>
                <p className="font-extrabold text-slate-900">{selectedCandidate.tourTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-slate-700 uppercase block text-[10px]">Phone</span>
                  <p className="font-mono text-slate-800">{selectedCandidate.phone}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 uppercase block text-[10px]">Emergency Phone</span>
                  <p className="font-mono text-slate-800">{selectedCandidate.emergencyPhone}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase block text-[10px]">Dietary / Medical Notes</span>
                <p className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-medium">
                  {selectedCandidate.dietaryMedical}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCandidate(null)}
              className="w-full btn-luxury-outline py-2.5 text-xs font-bold"
            >
              Close Candidate Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyPortal;
