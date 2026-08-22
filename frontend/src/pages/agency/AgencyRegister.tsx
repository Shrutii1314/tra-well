import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Upload, FileText, CheckCircle2, ArrowRight, Lock, Mail, Phone, MapPin, Globe, Compass, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AgencyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    agencyName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    govIdFileName: '',
    licenseFileName: '',
    password: '',
    passwordConfirm: ''
  });

  const handleGovIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, govIdFileName: file.name }));
    }
  };

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, licenseFileName: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await signup({
        name: formData.agencyName,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: 'agency',
        licenseNumber: formData.licenseNumber,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        govIdDoc: formData.govIdFileName,
        licenseDoc: formData.licenseFileName
      });
      setSubmitting(false);
      setStep(4); // Advance to Pending Approval screen
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.response?.data?.message || 'Registration failed. Please check your inputs and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 animate-fade-in relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Row */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Compass size={22} />
          </div>
          <div>
            <span className="font-display text-xl font-extrabold tracking-tight block leading-none">
              Tra<span className="text-primary">-Well</span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase block mt-0.5">Partner Portal</span>
          </div>
        </Link>

        <Link to="/auth" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
          Already registered? <span className="text-primary underline">Sign In</span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-2xl mx-auto w-full my-8 z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          
          {step < 4 && (
            <>
              {/* Header Title */}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Partner Onboarding
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                  Register Tour Operator Agency
                </h1>
                <p className="text-xs text-slate-400">
                  Join Tra-Well's verified network of certified Himalayan outfitters and trek leaders.
                </p>
              </div>

              {/* Step Progress Bar */}
              <div className="flex items-center gap-2 pt-2">
                {[
                  { num: 1, label: 'Business Info' },
                  { num: 2, label: 'Verification Docs' },
                  { num: 3, label: 'Account Access' },
                ].map((s) => (
                  <div key={s.num} className="flex-1 space-y-1">
                    <div className={`h-1.5 rounded-full transition-colors ${step >= s.num ? 'bg-primary' : 'bg-slate-800'}`} />
                    <span className={`text-[10px] font-mono block ${step === s.num ? 'text-primary font-bold' : 'text-slate-500'}`}>
                      {s.num}. {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 1: BUSINESS INFO ── */}
          {step === 1 && (
            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 flex items-center gap-1">
                    <Building2 size={13} className="text-primary" /> Agency / Operator Name
                  </label>
                  <input
                    type="text"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    placeholder="Himalayan High Expeditions"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 flex items-center gap-1">
                    <FileText size={13} className="text-primary" /> Business License / Registration #
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="IMP-GOV-2022-8841"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 flex items-center gap-1">
                    <Mail size={13} className="text-primary" /> Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="partners@himalayanhigh.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 flex items-center gap-1">
                    <Phone size={13} className="text-primary" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98160 12345"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  <MapPin size={13} className="text-primary" /> Office Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Mall Road, Manali, Himachal Pradesh 175131"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  <Globe size={13} className="text-primary" /> Official Website / Social Link
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.himalayanhigh.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!formData.agencyName || !formData.email) {
                    alert('Please provide agency name and contact email.');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full btn-luxury-primary py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Continue to Verification Documents</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* ── STEP 2: VERIFICATION DOCUMENTS UPLOAD ── */}
          {step === 2 && (
            <div className="space-y-4 text-xs pt-2">
              <p className="text-slate-400">
                Upload official credentials for verification by the Tra-Well compliance board.
              </p>

              {/* Upload Box 1: Government ID */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-dashed border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <FileText size={15} className="text-amber-400" /> Lead Operator Government ID (Aadhaar / Passport)
                    </p>
                    <p className="text-[11px] text-slate-400">PDF, PNG, or JPG (Max 10MB)</p>
                  </div>
                  <label className="btn-luxury-outline py-1.5 px-3 text-xs cursor-pointer flex items-center gap-1">
                    <Upload size={13} />
                    <span>Upload</span>
                    <input type="file" onChange={handleGovIdUpload} className="hidden" />
                  </label>
                </div>
                {formData.govIdFileName && (
                  <p className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 size={13} /> Attached: {formData.govIdFileName}
                  </p>
                )}
              </div>

              {/* Upload Box 2: Business Registration */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-dashed border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Building2 size={15} className="text-amber-400" /> Tourism Ministry / IMF Registration Certificate
                    </p>
                    <p className="text-[11px] text-slate-400">Official accreditation certificate</p>
                  </div>
                  <label className="btn-luxury-outline py-1.5 px-3 text-xs cursor-pointer flex items-center gap-1">
                    <Upload size={13} />
                    <span>Upload</span>
                    <input type="file" onChange={handleLicenseUpload} className="hidden" />
                  </label>
                </div>
                {formData.licenseFileName && (
                  <p className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 size={13} /> Attached: {formData.licenseFileName}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-luxury-outline py-3 px-4 font-bold flex-1">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-luxury-primary py-3 px-4 font-bold flex-[2] flex items-center justify-center gap-2"
                >
                  <span>Proceed to Account Access</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: ACCOUNT ACCESS & CREDENTIALS ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  <Lock size={13} className="text-primary" /> Create Portal Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 flex items-center gap-1">
                  <Lock size={13} className="text-primary" /> Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-primary"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                By submitting this application, you agree to Tra-Well's <strong>Wilderness Safety Code of Conduct</strong> and <strong>Operator Standards Policy</strong>.
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-luxury-outline py-3 px-4 font-bold flex-1">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-luxury-primary py-3 px-4 font-bold flex-[2] shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Partner Application'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: PENDING APPROVAL SCREEN ── */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <ShieldCheck size={36} />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Verification Pending
                </span>
                <h2 className="text-2xl font-extrabold font-display text-white">Application Submitted to Admin</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Thank you for registering <strong>{formData.agencyName || 'your agency'}</strong> with Tra-Well! Your profile is currently under review by our Admin team. You will be able to log in to your dashboard once an Admin approves your application.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2 max-w-md mx-auto text-left">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span>Contact Email:</span>
                  <strong className="font-mono text-white">{formData.email}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Account Status:</span>
                  <strong className="text-amber-400 font-mono">Pending Admin Approval</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="btn-luxury-primary text-xs py-3 px-6 font-bold shadow-md"
                >
                  Go to Sign In Page
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="btn-luxury-outline text-xs py-3 px-6 font-bold"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 font-mono z-10">
        © 2026 Tra-Well Partner Network. All Rights Reserved.
      </div>
    </div>
  );
};

export default AgencyRegister;
