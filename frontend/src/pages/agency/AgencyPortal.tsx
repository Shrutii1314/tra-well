import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Compass, Package, Users, Settings, Plus, Download, 
  Search, ShieldCheck, DollarSign, Calendar, X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ─── INITIAL MOCK DATA FOR AGENCY PORTAL ───
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
    inclusions: ['Guide', 'Meals', 'Tents', 'Forest Permits'],
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
    inclusions: ['Guide', 'Meals', 'Tents'],
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
    inclusions: ['Guide', 'Meals'],
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

const AgencyPortal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State (dashboard | tours | bookings | settings)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tours' | 'bookings' | 'settings'>('dashboard');

  // Tours & Roster State
  const [tours, setTours] = useState<AgencyTour[]>(INITIAL_AGENCY_TOURS);
  const [roster] = useState<CandidateBooking[]>(INITIAL_ROSTER);
  const [tourStatusFilter, setTourStatusFilter] = useState<string>('All');
  const [rosterSearch, setRosterSearch] = useState<string>('');

  // Modals State
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<AgencyTour | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateBooking | null>(null);

  // Tour Builder Form State
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

  // Business Settings State
  const [agencyProfile, setAgencyProfile] = useState({
    name: 'Himalayan High Expeditions',
    license: 'IMP-GOV-2022-8841',
    phone: '+91 98160 12345',
    email: 'contact@himalayanhigh.com',
    website: 'www.himalayanhigh.com',
    bio: 'Specialists in Himalayan summit treks, winter expeditions, and high-altitude wilderness survival since 2012.',
    verified: true
  });

  // Handle Tab Switch from pathname query
  React.useEffect(() => {
    if (location.pathname.includes('/tours')) setActiveTab('tours');
    else if (location.pathname.includes('/bookings')) setActiveTab('bookings');
    else if (location.pathname.includes('/settings')) setActiveTab('settings');
    else setActiveTab('dashboard');
  }, [location]);

  // Compute Metrics
  const totalRevenue = useMemo(() => tours.reduce((acc, t) => acc + t.bookedSeats * t.price, 0), [tours]);
  const activeToursCount = useMemo(() => tours.filter((t) => t.status === 'Active').length, [tours]);
  const totalTravelers = useMemo(() => roster.length, [roster]);

  // Handle Tour Builder Save
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
    } else {
      const newTour: AgencyTour = {
        id: `AT-10${tours.length + 1}`,
        title: tourForm.title,
        category: tourForm.category,
        duration: tourForm.duration,
        capacity: tourForm.capacity,
        bookedSeats: 0,
        price: tourForm.price,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        pickupLocation: tourForm.pickupLocation || 'Base Station',
        itinerary: tourForm.itineraryDays,
        inclusions: tourForm.inclusions,
        exclusions: tourForm.exclusions
      };
      setTours((prev) => [newTour, ...prev]);
    }

    setBuilderModalOpen(false);
    setEditingTour(null);
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
    a.download = `TraWell_Roster_Export_${new Date().toISOString().split('T')[0]}.csv`;
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 animate-fade-in">
      {/* ─── SIDEBAR NAVIGATION ─── */}
      <aside className="w-full md:w-64 bg-slate-950 text-white p-6 shrink-0 flex flex-col justify-between space-y-8 border-r border-slate-800">
        <div className="space-y-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-red-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white block leading-none">
                Tra<span className="text-primary">-Well</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase block mt-0.5">Partner Portal</span>
            </div>
          </Link>

          {/* Agency Status Card */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">{agencyProfile.name}</span>
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            </div>
            <p className="text-[10px] font-mono text-slate-400">License: {agencyProfile.license}</p>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 text-xs font-bold">
            {[
              { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/agency/dashboard' },
              { id: 'tours', label: `My Tour Packages (${tours.length})`, icon: Package, path: '/agency/tours' },
              { id: 'bookings', label: `Traveler Rosters (${roster.length})`, icon: Users, path: '/agency/bookings' },
              { id: 'settings', label: 'Business Settings', icon: Settings, path: '/agency/settings' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-primary text-white shadow-lg shadow-red-500/25 font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-slate-500">
          Operator Console v2.4
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Operator Console</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Dashboard Overview</h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingTour(null);
                    setBuilderModalOpen(true);
                  }}
                  className="btn-luxury-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={15} />
                  <span>Create New Tour Package</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="btn-luxury-outline text-xs py-2.5 px-4 font-bold flex items-center gap-1.5"
                >
                  <Download size={15} />
                  <span>Export Roster</span>
                </button>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Total Revenue Generated', val: `$${totalRevenue.toLocaleString()}`, change: '+14% vs last month', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { title: 'Active Tour Packages', val: `${activeToursCount}`, change: `${tours.length} total published`, icon: Package, color: 'text-primary bg-red-50 border-red-200' },
                { title: 'Total Enrolled Travelers', val: `${totalTravelers}`, change: 'Across all active batches', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                { title: 'Upcoming Departures', val: '3 Trips', change: 'Starting in next 7 days', icon: Calendar, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              ].map((m, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{m.title}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${m.color}`}>
                      <m.icon size={18} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{m.val}</div>
                  <span className="text-[11px] text-slate-400 font-medium">{m.change}</span>
                </div>
              ))}
            </div>

            {/* Upcoming Departures Live Occupancy Widget */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Live Departures</span>
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">Upcoming Expedition Batches (Next 7 Days)</h2>
                </div>
              </div>

              <div className="space-y-4">
                {tours.map((t) => {
                  const pct = Math.round((t.bookedSeats / t.capacity) * 100);
                  return (
                    <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">{t.title}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
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

                      {/* Seat Occupancy Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOUR PACKAGE CRUD MANAGEMENT */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:center gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Inventory Control</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Tour Package Management</h1>
              </div>

              <button
                onClick={() => {
                  setEditingTour(null);
                  setBuilderModalOpen(true);
                }}
                className="btn-luxury-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus size={15} />
                <span>Create Tour Package</span>
              </button>
            </div>

            {/* Tour Status Filters */}
            <div className="flex gap-2">
              {['All', 'Active', 'Draft', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTourStatusFilter(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    tourStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Tour Listing Table */}
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
                  {tours
                    .filter((t) => tourStatusFilter === 'All' || t.status === tourStatusFilter)
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <p className="font-extrabold text-slate-900 text-sm">{t.title}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ID: {t.id} • {t.category}
                          </p>
                        </td>
                        <td className="py-4 px-3 font-mono font-bold text-slate-900">${t.price}</td>
                        <td className="py-4 px-3 font-mono">{t.duration} Days</td>
                        <td className="py-4 px-3 font-mono">
                          {t.bookedSeats} / {t.capacity}
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
                            className="text-xs font-bold text-slate-700 hover:text-primary underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicateTour(t)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900"
                          >
                            Duplicate
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKING & CANDIDATE ROSTER MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Traveler Execution</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">Master Traveler Rosters</h1>
              </div>

              <button
                onClick={handleExportCSV}
                className="btn-luxury-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-md"
              >
                <Download size={15} />
                <span>Export Roster to CSV</span>
              </button>
            </div>

            {/* Roster Search Bar */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search candidate by name or booking ref..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-9 py-2.5 text-xs text-slate-900 outline-none focus:border-primary shadow-xs"
              />
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Master Roster Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="py-3.5 px-5">Traveler Name</th>
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
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedCandidate(r)}
                          className="btn-luxury-outline text-[11px] py-1.5 px-3 font-bold"
                        >
                          View Candidate Info
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE & BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Business Branding</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Agency Business Settings</h2>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <ShieldCheck size={20} className="text-emerald-600" />
              <div>
                <p className="text-xs font-extrabold text-emerald-900 uppercase">Verified Tour Operator Status</p>
                <p className="text-[11px] text-emerald-700">License ID: {agencyProfile.license} • Ministry Verified</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert('Agency business settings updated successfully!'); }} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Agency Name</label>
                  <input
                    type="text"
                    value={agencyProfile.name}
                    onChange={(e) => setAgencyProfile({ ...agencyProfile, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Contact Email</label>
                  <input
                    type="email"
                    value={agencyProfile.email}
                    onChange={(e) => setAgencyProfile({ ...agencyProfile, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Phone</label>
                  <input
                    type="text"
                    value={agencyProfile.phone}
                    onChange={(e) => setAgencyProfile({ ...agencyProfile, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Website</label>
                  <input
                    type="text"
                    value={agencyProfile.website}
                    onChange={(e) => setAgencyProfile({ ...agencyProfile, website: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Agency Bio</label>
                <textarea
                  rows={3}
                  value={agencyProfile.bio}
                  onChange={(e) => setAgencyProfile({ ...agencyProfile, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary resize-none"
                />
              </div>

              <button type="submit" className="btn-luxury-primary py-2.5 px-6 text-xs font-bold shadow-md">
                Save Business Settings
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ─── INTERACTIVE TOUR BUILDER MODAL ─── */}
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration (Days)</label>
                  <input
                    type="number"
                    value={tourForm.duration}
                    onChange={(e) => setTourForm({ ...tourForm, duration: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Capacity</label>
                  <input
                    type="number"
                    value={tourForm.capacity}
                    onChange={(e) => setTourForm({ ...tourForm, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price / Seat ($)</label>
                  <input
                    type="number"
                    value={tourForm.price}
                    onChange={(e) => setTourForm({ ...tourForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-primary"
                />
              </div>

              <button type="submit" className="btn-luxury-primary w-full py-3 text-xs font-bold shadow-md">
                Save & Publish Tour Package
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── CANDIDATE DETAIL VIEW MODAL ─── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Traveler Candidate Roster</span>
                <h3 className="text-base font-extrabold text-slate-900 font-display">{selectedCandidate.travelerName}</h3>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-900">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Tour: {selectedCandidate.tourTitle}</p>
                <p className="text-slate-600 font-mono">Booking Ref: {selectedCandidate.bookingRef}</p>
                <p className="text-emerald-700 font-bold font-mono">Total Paid: ${selectedCandidate.totalPaid} ({selectedCandidate.paymentStatus})</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-700">Demographics & Phone:</p>
                <p className="text-slate-600 font-mono">{selectedCandidate.age} yrs • {selectedCandidate.gender} • {selectedCandidate.phone}</p>
                <p className="text-slate-600 font-mono">Emergency Phone: {selectedCandidate.emergencyPhone}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-700">Special Dietary & Medical Requests:</p>
                <p className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 font-medium">
                  {selectedCandidate.dietaryMedical || 'None specified'}
                </p>
              </div>
            </div>

            <button onClick={() => setSelectedCandidate(null)} className="btn-luxury-outline w-full py-2 text-xs font-bold">
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgencyPortal;
