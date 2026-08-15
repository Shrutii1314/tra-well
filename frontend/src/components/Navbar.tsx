import React from 'react';
import { Compass, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="glass fixed top-0 w-full z-50 transition-all duration-300">
      <div className="container flex justify-between items-center h-20">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="text-primary w-8 h-8" />
          <span className="font-display text-2xl font-bold tracking-tight">TRA-WELL</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/tours" className="text-on-surface hover:text-primary transition-colors font-medium">Tours</Link>
          <Link to="/destinations" className="text-on-surface hover:text-primary transition-colors font-medium">Destinations</Link>
          <Link to="/about" className="text-on-surface hover:text-primary transition-colors font-medium">Our Story</Link>
          <Link to="/login" className="btn-primary">
            <User size={18} />
            Sign In
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-on-surface" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass absolute top-20 left-0 w-full flex flex-col items-center gap-6 py-10 animate-fade-in">
          <Link to="/tours" className="text-xl font-medium" onClick={() => setIsOpen(false)}>Tours</Link>
          <Link to="/destinations" className="text-xl font-medium" onClick={() => setIsOpen(false)}>Destinations</Link>
          <Link to="/about" className="text-xl font-medium" onClick={() => setIsOpen(false)}>Our Story</Link>
          <Link to="/login" className="btn-primary" onClick={() => setIsOpen(false)}>Sign In</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
