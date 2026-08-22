import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, Compass, Building2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'user' // Default to traveler ('user') or 'agency'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        // Check stored user role to redirect agency users directly to agency portal
        const storedUser = localStorage.getItem('user');
        const userObj = storedUser ? JSON.parse(storedUser) : null;
        if (userObj && userObj.role === 'agency') {
          navigate('/agency/dashboard');
        } else if (userObj && userObj.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const newUser = await signup(formData);
        // If registering as an agency, notify user about pending admin approval
        if (formData.role === 'agency' || (newUser && newUser.role === 'agency')) {
          setError('');
          alert('🎉 Registration successful! Your agency account is pending Admin approval. You can log in once an Admin accepts your application.');
          setIsLogin(true);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Authentication failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 text-white flex overflow-hidden">
      {/* Left Pane - Cinematic Image/Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden border-r border-slate-800">
        {/* Animated Topology/Gradient Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.2),transparent_50%)] animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-20 p-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-display font-extrabold text-white mb-6 tracking-tighter">
              EXPLORE THE <br />
              <span className="text-primary italic">UNSEEN WORLD</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
              Join Tra-Well's luxury travel network. Book certified expeditions or host wild adventures as a verified agency.
            </p>
          </motion.div>
        </div>

        {/* Bottom Stats Overlay */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end z-20">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">COORDINATES</p>
            <p className="text-sm font-mono text-white/50">31.1048° N, 77.1734° E</p>
          </div>
          <div className="h-px bg-white/10 flex-grow mx-8 mb-2"></div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">ECOSYSTEM</p>
            <p className="text-sm font-mono text-white/50">TRAVELER & AGENCY PORTAL</p>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 relative z-10 my-auto"
        >
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-3xl font-display font-bold text-white">
              {isLogin ? 'Welcome Back to Tra-Well' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {isLogin ? 'Enter credentials to access your dashboard' : 'Choose your role to get started as a Traveler or Tour Agency'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* ROLE SELECTOR (Visible on Register) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Select Account Role:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'user' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.role === 'user'
                        ? 'bg-primary/20 border-primary text-white font-extrabold shadow-lg shadow-red-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Compass className={`w-5 h-5 mb-1.5 ${formData.role === 'user' ? 'text-primary' : 'text-slate-500'}`} />
                    <p className="text-xs font-bold">Traveler / Explorer</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Book trek expeditions & tours</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'agency' })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.role === 'agency'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-extrabold shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 mb-1.5 ${formData.role === 'agency' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <p className="text-xs font-bold">Tour Operator Agency</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Publish packages & rosters</p>
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="relative">
                <input 
                  type="text" 
                  id="name"
                  className="peer floating-label-input pr-12" 
                  placeholder=" " 
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
                <label 
                  htmlFor="name"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Full Name / Business Name
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-primary transition-colors">
                  <UserPlus size={18} />
                </div>
              </div>
            )}

            <div className="relative">
              <input 
                type="email" 
                id="email"
                className="peer floating-label-input pr-12" 
                placeholder=" " 
                required
                value={formData.email}
                onChange={handleChange}
              />
              <label 
                htmlFor="email"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Email Address
              </label>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-primary transition-colors">
                <Mail size={18} />
              </div>
            </div>

            <div className="relative">
              <input 
                type="password" 
                id="password"
                className="peer floating-label-input pr-12" 
                placeholder=" " 
                required
                value={formData.password}
                onChange={handleChange}
              />
              <label 
                htmlFor="password"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Password
              </label>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-primary transition-colors">
                <Lock size={18} />
              </div>
            </div>

            {!isLogin && (
              <div className="relative">
                <input 
                  type="password" 
                  id="passwordConfirm"
                  className="peer floating-label-input pr-12" 
                  placeholder=" " 
                  required
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                />
                <label 
                  htmlFor="passwordConfirm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Confirm Password
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-primary transition-colors">
                  <Lock size={18} />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="w-full btn-luxury-primary flex items-center justify-center gap-2 h-12 text-sm font-bold shadow-lg">
              <span>{isLogin ? 'Sign In to Account' : `Register as ${formData.role === 'agency' ? 'Tour Agency' : 'Traveler'}`}</span>
              <ArrowRight size={18} />
            </button>

            {isLogin && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, email: 'admin@trawell.com', password: 'admin123456' })}
                  className="w-full py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Shield size={14} />
                  <span>Fill Demo Admin Credentials (admin@trawell.com)</span>
                </button>
              </div>
            )}
          </form>

          <p className="text-center text-slate-400 text-xs">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? 'Sign Up Now' : 'Log In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
