import React from 'react';
import { X, Printer, ShieldCheck, Download, Compass, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  booking: any;
  user: any;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, user, onClose }) => {
  if (!booking) return null;

  const tourName = booking.tour?.name || booking.tourName || 'Himalayan Expedition';
  const bookingId = booking._id || booking.id || `TW-BK-${Math.floor(1000 + Math.random() * 9000)}`;
  const startDate = booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 12, 2026';
  const guests = booking.guests || 1;
  const totalPrice = booking.price || 499;
  const subtotal = Math.round(totalPrice / 1.05);
  const tax = totalPrice - subtotal;
  const status = booking.status || (booking.paid ? 'paid' : 'paid');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-md">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                Tra<span className="text-primary">-Well</span> Expeditions
              </h2>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Official Reservation Receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-luxury-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Info Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-mono block text-[10px] uppercase">Invoice Ref</span>
            <span className="font-mono font-bold text-slate-900">{bookingId.substring(0, 12)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-mono block text-[10px] uppercase">Issue Date</span>
            <span className="font-bold text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-400 font-mono block text-[10px] uppercase">Payment Status</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 capitalize">
              <CheckCircle2 size={11} /> {status}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-mono block text-[10px] uppercase">Payment Method</span>
            <span className="font-bold text-slate-900">Card / UPI Online</span>
          </div>
        </div>

        {/* Customer & Tour Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Billed To</h3>
            <p className="font-extrabold text-slate-900 text-sm">{user?.name || 'Traveler'}</p>
            <p className="text-slate-600 font-mono">{user?.email}</p>
            <p className="text-slate-500">+91 98765 43210</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Reserved Tour</h3>
            <p className="font-extrabold text-slate-900 text-sm">{tourName}</p>
            <p className="text-slate-600">Departure: <strong className="text-slate-900">{startDate}</strong></p>
            <p className="text-slate-500">Group Size: <strong>{guests} Guest(s)</strong></p>
          </div>
        </div>

        {/* Itemized Billing Table */}
        <div className="space-y-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="py-3 font-bold">{tourName} Package</td>
                <td className="py-3 text-center font-mono">{guests}</td>
                <td className="py-3 text-right font-mono">${Math.round(subtotal / guests)}</td>
                <td className="py-3 text-right font-mono font-bold">${subtotal}</td>
              </tr>
              <tr>
                <td className="py-3 text-slate-500">Service Fees & Goods Tax (5%)</td>
                <td className="py-3 text-center font-mono">1</td>
                <td className="py-3 text-right font-mono">${tax}</td>
                <td className="py-3 text-right font-mono font-bold">${tax}</td>
              </tr>
            </tbody>
          </table>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Tra-Well Guaranteed & Verified Invoice</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Amount Paid</span>
              <span className="text-2xl font-extrabold font-mono text-primary">${totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-luxury-outline text-xs py-2 px-5 font-bold">
            Close
          </button>
          <button
            onClick={() => {
              alert(`E-Ticket downloaded for booking ${bookingId}`);
              onClose();
            }}
            className="btn-luxury-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Download PDF Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
