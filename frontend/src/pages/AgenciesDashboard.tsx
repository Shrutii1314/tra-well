import React, { useState } from 'react';
import { ShieldCheck, Star, MapPin, Search, Phone, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Agency {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewsCount: number;
  hostedToursCount: number;
  location: string;
  verified: boolean;
  bio: string;
  phone: string;
  email: string;
  website: string;
  specialization: string;
}

export const TOP_AGENCIES: Agency[] = [
  {
    id: 'ag-1',
    name: 'Himalayan High Expeditions',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 340,
    hostedToursCount: 42,
    location: 'Manali, Himachal Pradesh',
    verified: true,
    bio: 'Specialists in Himalayan summit treks, winter expeditions, and high-altitude wilderness survival since 2012.',
    phone: '+91 98160 12345',
    email: 'contact@himalayanhigh.com',
    website: 'www.himalayanhigh.com',
    specialization: 'Summit Treks & Expeditions'
  },
  {
    id: 'ag-2',
    name: 'Garhwal Trekkers Club',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: 280,
    hostedToursCount: 35,
    location: 'Dehradun, Uttarakhand',
    verified: true,
    bio: 'Pioneers in Kedarkantha, Har Ki Dun, and Brahmatal winter trails with IMF certified mountaineering leaders.',
    phone: '+91 97190 54321',
    email: 'info@garhwaltrekkers.com',
    website: 'www.garhwaltrekkers.com',
    specialization: 'Uttarakhand Alpine Trails'
  },
  {
    id: 'ag-3',
    name: 'Ladakh High Pass Riders',
    logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    rating: 5.0,
    reviewsCount: 195,
    hostedToursCount: 28,
    location: 'Leh, Ladakh',
    verified: true,
    bio: 'High-altitude motorcycle expeditions, Zanskar river rafting, and trans-Himalayan cross-country circuits.',
    phone: '+91 94191 88990',
    email: 'tours@ladakhpassriders.com',
    website: 'www.ladakhpassriders.com',
    specialization: 'Motorcycle & Pass Expeditions'
  },
  {
    id: 'ag-4',
    name: 'Parvati Valley Backpackers',
    logo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop',
    rating: 4.7,
    reviewsCount: 410,
    hostedToursCount: 50,
    location: 'Kasol, Himachal Pradesh',
    verified: true,
    bio: 'Budget-friendly weekend trips, hot spring camping, and youth wilderness retreats in Parvati Valley.',
    phone: '+91 98822 77665',
    email: 'hello@parvatibackpackers.com',
    website: 'www.parvatibackpackers.com',
    specialization: 'Weekend Getaways & Camping'
  }
];

const AgenciesDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgencies = TOP_AGENCIES.filter((agency) => {
    const q = searchQuery.toLowerCase();
    return (
      agency.name.toLowerCase().includes(q) ||
      agency.location.toLowerCase().includes(q) ||
      agency.specialization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-8 sm:p-14 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5">
            <ShieldCheck size={14} /> Verified Partner Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Top Verified Travel Agencies & Outfitters
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Browse certified local tour operators, certified mountaineering clubs, and adventure agencies with verified safety credentials.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md pt-2">
            <input
              type="text"
              placeholder="Search by agency name, location, or trek type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 text-slate-900 placeholder-slate-400 rounded-xl pl-4 pr-10 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary shadow-lg"
            />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 mt-1" />
          </div>
        </div>
      </div>

      {/* Agencies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAgencies.map((agency) => (
          <div key={agency.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
            <div>
              {/* Cover Image & Logo */}
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img src={agency.coverImage} alt={agency.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>

                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <img
                    src={agency.logo}
                    alt={agency.name}
                    className="w-14 h-14 rounded-2xl border-2 border-white object-cover shadow-md bg-white"
                  />
                  <div className="text-white">
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/90 text-white font-extrabold px-2 py-0.5 rounded shadow-xs">
                      Verified Operator
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-1.5">
                      <Link to={`/agencies/${agency.id}`} className="hover:text-primary transition-colors">
                        {agency.name}
                      </Link>
                      <ShieldCheck size={16} className="text-emerald-600 fill-emerald-100 shrink-0" />
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                      <MapPin size={13} className="text-primary shrink-0" />
                      <span>{agency.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star size={13} className="fill-amber-400 text-amber-500" />
                    <span>{agency.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({agency.reviewsCount})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{agency.bio}</p>

                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600 pt-1">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md font-bold">
                    🎪 {agency.hostedToursCount} Active Tours
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                    🏷️ {agency.specialization}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <span className="flex items-center gap-1"><Phone size={12} /> Call</span>
                <span className="flex items-center gap-1"><Mail size={12} /> Email</span>
              </div>

              <Link
                to={`/agencies/${agency.id}`}
                className="btn-luxury-primary text-xs py-2 px-4 font-bold flex items-center gap-1 shadow-xs"
              >
                <span>View Profile</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgenciesDashboard;
