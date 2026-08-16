import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 animate-fade-in">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          We'd Love to Hear From You
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
          Have questions about a trek itinerary, group bookings, or custom expeditions? Our travel experts are available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center mx-auto md:mx-0 border border-red-100">
            <Phone size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Phone Support</h3>
          <p className="text-xs text-slate-600 font-mono">+91 99997 79136</p>
          <p className="text-[11px] text-slate-400">Mon - Sun, 24 Hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center mx-auto md:mx-0 border border-red-100">
            <Mail size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Email Inquiry</h3>
          <p className="text-xs text-slate-600 font-mono">support@trawell.com</p>
          <p className="text-[11px] text-slate-400">Response within 2 hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center mx-auto md:mx-0 border border-red-100">
            <MapPin size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Headquarters</h3>
          <p className="text-xs text-slate-600">Dehradun & Manali Hubs</p>
          <p className="text-[11px] text-slate-400">India Base Station</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Thank You for Reaching Out!</h3>
            <p className="text-xs text-slate-600">Our expedition coordinator will contact you shortly.</p>
            <button onClick={() => setSubmitted(false)} className="btn-luxury-outline text-xs py-2 px-4">
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-primary focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Custom Tour Inquiry / Booking Help"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Message</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your travel plans..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-primary focus:bg-white resize-none"
              />
            </div>

            <button type="submit" className="btn-luxury-primary py-3 px-8 text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto">
              <Send size={15} />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
