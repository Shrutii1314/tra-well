import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Star, MapPin, Phone, Mail, ArrowLeft, Package, 
  CheckCircle2, Award, MessageSquare 
} from 'lucide-react';
import { TOP_AGENCIES } from './AgenciesDashboard';
import TourCard, { type Tour } from '../components/TourCard';

const MOCK_AGENCY_TOURS: Tour[] = [
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
    agencyName: 'Himalayan High Expeditions',
    summary: 'A dramatic cross-over trek from lush green Kullu valley to the stark desert landscape of Lahaul & Spiti.',
    imageCover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    startLocation: { description: 'Manali, Himachal Pradesh' }
  }
];

const AgencyProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'packages' | 'about' | 'reviews'>('packages');

  const agency = TOP_AGENCIES.find((a) => a.id === id) || TOP_AGENCIES[0];

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Top Back Nav Button */}
      <button
        onClick={() => navigate('/agencies')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Agencies Directory</span>
      </button>

      {/* Agency Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
        {/* Cover Photo */}
        <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-900">
          <img src={agency.coverImage} alt={agency.name} className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
        </div>

        {/* Header Profile Row */}
        <div className="px-6 sm:px-10 pb-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center md:items-end gap-5 text-center sm:text-left">
            <img
              src={agency.logo}
              alt={agency.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white object-cover shadow-xl bg-white shrink-0"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                  {agency.name}
                </h1>
                <ShieldCheck size={22} className="text-emerald-600 fill-emerald-100 shrink-0" />
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> {agency.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Star size={13} className="fill-amber-400" /> {agency.rating.toFixed(1)} ({agency.reviewsCount} reviews)
                </span>
                <span>•</span>
                <span className="font-mono text-slate-700 font-bold">{agency.hostedToursCount} Hosted Trips</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${agency.phone}`}
              className="btn-luxury-outline text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Phone size={14} />
              <span>Call Agency</span>
            </a>
            <a
              href={`mailto:${agency.email}`}
              className="btn-luxury-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md"
            >
              <Mail size={14} />
              <span>Send Message</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {[
          { id: 'packages', label: `Active Tour Packages (${MOCK_AGENCY_TOURS.length})`, icon: Package },
          { id: 'about', label: 'About & Verification', icon: ShieldCheck },
          { id: 'reviews', label: `Traveler Reviews (${agency.reviewsCount})`, icon: MessageSquare },
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

      {/* TAB 1: ACTIVE TOUR PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Agency Offerings</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Published Expeditions</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_AGENCY_TOURS.map((tour) => (
              <TourCard key={tour._id || tour.id} tour={tour} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ABOUT & VERIFICATION */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Business Credentials</span>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">About & Licensing</h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {agency.bio}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
              <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Verified Registration
              </h3>
              <p className="text-xs text-slate-700 font-mono">License ID: IMP-GOV-2018-8942</p>
              <p className="text-[11px] text-slate-500">Registered with Ministry of Tourism & IMF</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
              <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={16} /> Safety & Oxygen Standards
              </h3>
              <p className="text-xs text-slate-700 font-mono">Wilderness First Responder Guides</p>
              <p className="text-[11px] text-slate-500">Satellite Coms & Emergency Evacuation Insured</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900">Direct Contact Channels:</h3>
            <div className="flex flex-col sm:flex-row gap-4 font-mono text-slate-600">
              <span>📞 {agency.phone}</span>
              <span>✉️ {agency.email}</span>
              <span>🌐 {agency.website}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRAVELER REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Verified Feedback</span>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">Agency Traveler Reviews</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-700">
              <Star size={16} className="fill-amber-400" />
              <span>{agency.rating.toFixed(1)} / 5.0 Rating</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Rohan Sharma', date: 'Oct 2026', text: 'Top notch organization! The trek leaders from Himalayan High were super cautious about altitude sickness and the food was amazing at 12,000 ft.', rating: 5 },
              { name: 'Ananya Verma', date: 'Sep 2026', text: 'Kedarkantha winter trek was seamlessly handled. Excellent equipment and warm tents.', rating: 5 },
            ].map((rev, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900">{rev.name}</span>
                  <span className="font-mono text-slate-400">{rev.date}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyProfile;
