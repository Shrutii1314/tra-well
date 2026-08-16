import React, { useState, useRef, useEffect } from 'react';
import { Compass, Menu, X, Search, LogOut, Calendar, ShieldCheck, ChevronDown, Heart, LayoutDashboard } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Wishlist count state (reads from localStorage or default)
  const wishlistCount = 2;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tours?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Tours', path: '/tours' },
    { label: 'Agencies', path: '/agencies' },
    { label: 'About Us', path: '/about' },
  ];

  // User Initials helper
  const getUserInitials = (name?: string) => {
    if (!name) return 'TW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-red-500/30 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 block leading-none">
              Tra<span className="text-primary">-Well</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase block mt-0.5">Expeditions & Tours</span>
          </div>
        </Link>

        {/* Header Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search destination, agency, or trek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
              <Search size={15} />
            </button>
          </div>
        </form>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                text-xs font-bold uppercase tracking-wider transition-colors px-2 py-1 rounded-md
                ${isActive ? 'text-primary font-extrabold' : 'text-slate-600 hover:text-slate-900'}
              `}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Dynamic Auth Section & Wishlist */}
        <div className="flex items-center gap-3">
          {/* Wishlist Icon with Badge Counter */}
          <Link
            to={user ? '/my-dashboard?tab=wishlist' : '/auth'}
            className="relative p-2 text-slate-600 hover:text-primary transition-colors"
            title="Saved Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {user ? (
            /* Authenticated User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getUserInitials(user.name)}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                        Admin Portal
                      </span>
                    )}
                  </div>

                  <Link
                    to="/my-dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-primary font-medium transition-colors"
                  >
                    <LayoutDashboard size={15} className="text-primary" />
                    <span>My Dashboard</span>
                  </Link>

                  <Link
                    to="/my-bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-primary font-medium transition-colors"
                  >
                    <Calendar size={15} className="text-primary" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    to="/my-dashboard?tab=wishlist"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-primary font-medium transition-colors"
                  >
                    <Heart size={15} className="text-red-500" />
                    <span>Saved Tours</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-primary font-medium transition-colors"
                    >
                      <ShieldCheck size={15} className="text-amber-600" />
                      <span>Admin Control</span>
                    </Link>
                  )}

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 font-bold transition-colors"
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Auth Buttons */
            <div className="flex items-center gap-2">
              <Link
                to="/auth?mode=login"
                className="btn-luxury-outline py-2 px-4 text-xs font-bold"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=register"
                className="btn-luxury-primary py-2 px-4 text-xs font-bold shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 p-4 space-y-4 shadow-xl animate-fade-in">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search destination, agency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-9 py-2 text-xs text-slate-900"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                <Search size={15} />
              </button>
            </div>
          </form>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => `
                  px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100'}
                `}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
