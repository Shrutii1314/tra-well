import React from 'react';
import Navbar from './Navbar';
import { Flame, PhoneCall, Heart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background relative flex flex-col font-sans">
      {/* Top Announcement Notice Bar */}
      <div className="top-notice-bar flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Flame size={14} className="text-yellow-300 animate-bounce" />
          <span>AUTUMN & WINTER EXPEDITIONS 2026 — EARLY BIRD DISCOUNT ACTIVE!</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1"><PhoneCall size={12} /> +91 99997 79136</span>
          <span>•</span>
          <span>24/7 Guide Support</span>
        </div>
      </div>

      {/* Main Brand Header Navigation */}
      <Navbar />

      {/* Main Page Viewport Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-800">
            <div className="space-y-2">
              <span className="font-display text-xl font-extrabold text-white tracking-tight">
                TRA<span className="text-primary">-WELL</span>
              </span>
              <p className="text-slate-400 text-xs max-w-md">
                India's premier adventure travel and trekking platform. Certified mountaineers, sustainable trails, and high-altitude safety guaranteed.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 font-bold text-slate-300">
              <NavLink to="/" className="hover:text-primary transition-colors">Home</NavLink>
              <NavLink to="/tours" className="hover:text-primary transition-colors">All Tours</NavLink>
              <NavLink to="/about" className="hover:text-primary transition-colors">About Us</NavLink>
              <NavLink to="/contact" className="hover:text-primary transition-colors">Contact</NavLink>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <p>&copy; 2026 Tra-Well Expeditions Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with <Heart size={12} className="text-red-500 fill-red-500" /> for mountain purists & explorers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
