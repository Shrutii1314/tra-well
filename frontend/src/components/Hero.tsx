import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Shield } from 'lucide-react';

const Hero: React.FC = () =>{
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-6">
      { /* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style= {{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-primary/30"></span>
            <span className="text-primary font-mono text-sm tracking-[0.4em] font-bold uppercase">Ultimate Luxury Travel</span>
            <span className="h-px w-12 bg-primary/30"></span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-extrabold text-white tracking-tighter leading-tight">
            CRAFTING <br />
            <span className="text-gradient-emerald italic">ETHEREAL</span> JOURNEYS
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Exclusive access to the world's most breathtaking retreats. 
            Meticulously designed for the discerning traveler.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button className="btn-luxury-primary px-10 py-5 text-lg flex items-center justify-center gap-3">
              <Compass size={22} />
              <span>EXPLORE DASHBOARD</span>
            </button>
            <button className="btn-luxury-outline px-10 py-5 text-lg flex items-center justify-center gap-3">
              <Shield size={22} className="text-accent" />
              <span>PRIVATE ACCESS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-20 max-w-4xl mx-auto">
            <div className="glass-morphism p-6 rounded-2xl border-white/5 space-y-2">
              <div className="text-3xl font-display font-bold text-white">500+</div>
              <div className="text-xs text-gray-500 font-mono tracking-widest uppercase">Global Retreats</div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl border-white/5 space-y-2">
              <div className="text-3xl font-display font-bold text-white">12k+</div>
              <div className="text-xs text-gray-500 font-mono tracking-widest uppercase">Verified Explorers</div>
            </div>
            <div className="glass-morphism p-6 rounded-2xl border-white/5 space-y-2">
              <div className="text-3xl font-display font-bold text-white">99.9%</div>
              <div className="text-xs text-gray-500 font-mono tracking-widest uppercase">Bespoke Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Map Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,500 Q250,250 500,500 T1000,500" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0,300 Q250,550 500,300 T1000,300" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0,700 Q250,450 500,700 T1000,700" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;

