import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Calendar, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Tour {
  id?: string;
  _id?: string;
  name: string;
  duration: number;
  maxGroupSize?: number;
  difficulty: 'easy' | 'medium' | 'moderate' | 'difficult' | string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  imageCover?: string;
  agencyName?: string;
  isVerifiedAgency?: boolean;
  startLocation?: {
    description?: string;
  };
  startDates?: string[];
}

interface TourCardProps {
  tour: Tour;
  viewMode?: 'grid' | 'list';
}

const getDifficultyBadge = (difficulty: string) => {
  const diff = difficulty?.toLowerCase() || 'easy';
  if (diff === 'easy') {
    return {
      label: 'Easy',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }
  if (diff === 'medium' || diff === 'moderate') {
    return {
      label: 'Moderate',
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }
  return {
    label: 'Difficult',
    className: 'bg-rose-50 text-rose-700 border-rose-200'
  };
};

const TourCard: React.FC<TourCardProps> = ({ tour, viewMode = 'grid' }) => {
  const tourId = tour._id || tour.id || '1';
  const difficultyBadge = getDifficultyBadge(tour.difficulty);
  
  const fallbackImg = `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop`;
  const ratingAvg = tour.ratingsAverage ? tour.ratingsAverage.toFixed(1) : '4.9';
  const reviewCount = tour.ratingsQuantity || 128;
  const originalPrice = tour.priceDiscount ? tour.price + tour.priceDiscount : Math.round(tour.price * 1.25);
  const locationName = tour.startLocation?.description || 'Himalayas, India';
  const agency = tour.agencyName || 'Himalayan Trekking Co.';

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all">
        <div className="relative w-full md:w-72 h-52 md:h-auto shrink-0 overflow-hidden">
          <img
            src={tour.imageCover || fallbackImg}
            alt={tour.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="badge-bestseller">Featured</span>
          </div>

          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="badge-pill font-mono flex items-center gap-1">
              <Clock size={11} /> {tour.duration} Days
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${difficultyBadge.className}`}>
              {difficultyBadge.label}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1">
              <span className="text-slate-700 font-bold">{agency}</span>
              <ShieldCheck size={13} className="text-emerald-600 fill-emerald-100" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900 font-display hover:text-primary transition-colors">
                <Link to={`/tours/${tourId}`}>{tour.name}</Link>
              </h3>
              <div className="flex items-center gap-1 text-amber-600 shrink-0 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shadow-xs">
                <Star size={13} className="fill-amber-400 text-amber-500" />
                <span>{ratingAvg}</span>
                <span className="text-slate-400 font-normal">({reviewCount})</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1.5 font-medium">
              <MapPin size={14} className="text-primary shrink-0" />
              <span className="truncate">{locationName}</span>
            </div>

            <p className="text-slate-600 text-xs line-clamp-2 mt-2.5 leading-relaxed">{tour.summary}</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 line-through font-mono mr-2">${originalPrice}</span>
              <span className="text-xl font-extrabold text-slate-900 font-mono">${tour.price}</span>
              <span className="text-[11px] text-slate-500 ml-1 font-medium">/ person</span>
            </div>

            <Link to={`/tours/${tourId}`} className="btn-luxury-primary text-xs py-2 px-5 font-bold shadow-md">
              <span>View Package</span>
              <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all group"
    >
      {/* Cover Image & Overlay Badges */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={tour.imageCover || fallbackImg}
          alt={tour.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>

        {/* Featured / Best Seller Ribbon */}
        <div className="absolute top-3 left-3">
          <span className="badge-bestseller">★ Verified Expedition</span>
        </div>

        {/* Duration & Difficulty Badges Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <span className="badge-pill font-mono flex items-center gap-1">
            <Clock size={11} /> {tour.duration} Days
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${difficultyBadge.className}`}>
            {difficultyBadge.label}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          {/* Agency Badge */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <span className="text-slate-800 font-bold hover:underline cursor-pointer">
              <Link to="/agencies/ag-1">{agency}</Link>
            </span>
            <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
          </div>

          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 font-display group-hover:text-primary transition-colors">
              <Link to={`/tours/${tourId}`}>{tour.name}</Link>
            </h3>
            <div className="flex items-center gap-1 text-amber-600 shrink-0 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              <Star size={12} className="fill-amber-400 text-amber-500" />
              <span>{ratingAvg}</span>
              <span className="text-[10px] text-slate-400 font-normal">({reviewCount})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <MapPin size={13} className="text-primary shrink-0" />
            <span className="truncate">{locationName}</span>
          </div>

          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{tour.summary}</p>
        </div>

        {/* Departure Dates Pill Line */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono">
          <Calendar size={12} className="text-primary shrink-0" />
          <span className="truncate">Batches: Nov 02, 09, 16 • Dec 07</span>
        </div>

        {/* Footer & Price */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 line-through font-mono block leading-none">${originalPrice}</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-extrabold text-slate-900 font-mono">${tour.price}</span>
              <span className="text-[10px] text-slate-500 font-medium">/ person</span>
            </div>
          </div>

          <Link
            to={`/tours/${tourId}`}
            className="btn-luxury-primary py-2 px-4 text-xs font-bold flex items-center gap-1 shadow-md"
          >
            <span>View Package</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
