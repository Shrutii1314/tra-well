import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export const TourCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="h-56 bg-slate-200 relative">
        <div className="absolute top-3 left-3 w-20 h-5 bg-slate-300 rounded-md"></div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <div className="w-16 h-5 bg-slate-300 rounded-md"></div>
          <div className="w-16 h-5 bg-slate-300 rounded-md"></div>
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-3/4 h-5 bg-slate-200 rounded-md"></div>
            <div className="w-10 h-5 bg-slate-200 rounded-md"></div>
          </div>
          <div className="w-1/2 h-4 bg-slate-200 rounded-md"></div>
          <div className="space-y-2 pt-1">
            <div className="w-full h-3 bg-slate-200 rounded"></div>
            <div className="w-4/5 h-3 bg-slate-200 rounded"></div>
          </div>
        </div>

        {/* Departure dates bar skeleton */}
        <div className="h-7 bg-slate-100 rounded-lg w-full"></div>

        {/* Footer Skeleton */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-12 h-3 bg-slate-200 rounded"></div>
            <div className="w-20 h-6 bg-slate-300 rounded"></div>
          </div>
          <div className="w-24 h-9 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const TourGridSkeleton: React.FC<SkeletonLoaderProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <TourCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default TourGridSkeleton;
