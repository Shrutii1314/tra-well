import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, Globe } from 'lucide-react';
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
    passwordConfirm: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await signup(formData);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex overflow-hidden">
      {/* Left Pane - Cinematic Image/Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 items-center justify-center overflow-hidden">
        {/* Animated Topology/Gradient Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_50%)] animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* CSS Topography Mask Effect */}
        <div 
          className="absolute inset-0 z-10 mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/topography.png')`,
            backgroundSize: '400px'
          }}
        ></div>

        <div className="relative z-20 p-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-display font-extrabold text-white mb-6 tracking-tighter">
              EXPLORE THE <br />
              <span className="text-gradient-emerald italic">UNSEEN WORLD</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
              Join our exclusive collective of global explorers. Premium tours, curated experiences, and unforgettable memories await.
            </p>
          </motion.div>
        </div>

        {/* Bottom Stats Overlay */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end z-20">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">COORDINATES</p>
            <p className="text-sm font-mono text-white/50">40.7128° N, 74.0060° W</p>
          </div>
          <div className="h-px bg-white/10 flex-grow mx-8 mb-2"></div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">ESTABLISHED</p>
            <p className="text-sm font-mono text-white/50">MMXXIV // GLOBAL</p>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        {/* Mobile background decor */}
        <div className="lg:hidden absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-display font-bold text-white mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Sign up to start your luxury travel journey today'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Full Name
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-accent transition-colors">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Email Address
              </label>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-accent transition-colors">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Password
              </label>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-accent transition-colors">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Confirm Password
                </label>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 peer-focus:text-accent transition-colors">
                  <Lock size={18} />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-accent hover:text-cyan-300 transition-colors">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="w-full btn-luxury-primary flex items-center justify-center gap-2 h-14 text-lg">
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-gray-600 font-mono tracking-widest leading-none py-1 border border-white/5 rounded-full">OR CONTINUE WITH</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="btn-luxury-outline flex items-center justify-center gap-3 py-3">
              <Globe size={18} />
              <span className="text-sm font-semibold">Google</span>
            </button>
            <button className="btn-luxury-outline flex items-center justify-center gap-3 py-3">
              <Mail size={18} />
              <span className="text-sm font-semibold">Email</span>
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

