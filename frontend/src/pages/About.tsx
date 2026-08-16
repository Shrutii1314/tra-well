import React from 'react';
import { ShieldCheck, HeartHandshake, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-slate-950 text-white rounded-3xl overflow-hidden p-8 sm:p-16 border border-slate-800 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            About Tra-Well Expeditions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Crafting Unforgettable Mountain & Adventure Journeys
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Tra-Well is India's premier adventure travel platform. Founded by certified mountaineers and travel purists, we connect passionate explorers with world-class trekking expeditions, weekend getaways, and sustainable local guides.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: ShieldCheck,
            title: 'Uncompromised Safety',
            desc: 'Every expedition is equipped with Wilderness First Aid trained leaders, pulse oximeters, and emergency oxygen canisters.'
          },
          {
            icon: HeartHandshake,
            title: 'Sustainable Tourism',
            desc: 'We follow Leave No Trace principles, supporting mountain communities and employing certified local sherpas and guides.'
          },
          {
            icon: Award,
            title: 'Direct Local Pricing',
            desc: 'Transparent booking costs directly connected to local operators with no hidden middleman markups.'
          }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center border border-red-100">
              <item.icon size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats Counter */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { label: 'Successful Treks', value: '150+' },
          { label: 'Happy Explorers', value: '12,500+' },
          { label: 'Certified Leaders', value: '450+' },
          { label: 'Satisfaction Rate', value: '99.4%' }
        ].map((stat, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
