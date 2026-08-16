import React from 'react';
import { RotateCcw, SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Tours Found",
  message = "We couldn't find any tours or expeditions matching your filter criteria. Try expanding your search options or clearing filters.",
  onReset
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-14 text-center max-w-xl mx-auto space-y-5 animate-fade-in my-8">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-primary flex items-center justify-center mx-auto border border-red-100 shadow-sm">
        <SearchX size={32} />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
          {title}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      {onReset && (
        <div className="pt-2">
          <button
            onClick={onReset}
            className="btn-luxury-primary py-2.5 px-6 text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-md"
          >
            <RotateCcw size={15} />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
