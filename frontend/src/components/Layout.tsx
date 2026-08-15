import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Compass, 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Map, 
  Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Compass, label: 'Tours', path: '/tours' },
    { icon: Shield, label: 'Admin', path: '/admin' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation Bar (Floating/Glassmorphic) */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[90%] max-w-7xl ${scrolled ? 'top-4' : 'top-6'}`}>
        <div className="glass-morphism rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center neo-glow-emerald">
              <Map className="text-white w-6 h-6" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tighter text-white">TRA-WELL</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105 active:scale-95
                  ${isActive ? 'text-primary' : 'text-gray-400 hover:text-white'}
                `}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-300 text-sm hidden sm:inline font-mono">
                  {user.name.toUpperCase()}
                </span>
                <button 
                  onClick={logout} 
                  className="btn-luxury-outline py-2 px-5 text-sm flex items-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <NavLink to="/auth" className="btn-luxury-outline py-2 px-5 text-sm">
                Sign In
              </NavLink>
            )}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 pb-20 px-6 sm:px-10 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Side HUD Overlay (Optional feature for dashboards) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-40">
        <button className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all hover:scale-110">
          <Settings size={20} />
        </button>
        {user && (
          <button 
            onClick={logout}
            className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400/50 transition-all hover:scale-110"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      <footer className="relative z-10 border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white">TRA-WELL</span>
            <span>&copy; 2024. ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-white transition-colors">SUPPORT</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
