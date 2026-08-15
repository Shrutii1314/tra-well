import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tour {
  id?: string;
  _id?: string;
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  summary: string;
  imageCover?: string;
  startLocation: {
    description: string;
  };
}

interface TourCardProps {
  tour: Tour;
  viewMode?: 'grid' | 'list';
}

const difficultyColor: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  difficult: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const TourCard: React.FC<TourCardProps> = ({ tour, viewMode = 'grid' }) => {
  const diff = tour.difficulty?.toLowerCase() || 'easy';
  const colorClass = difficultyColor[diff] || difficultyColor['easy'];
  const tourId = tour._id || tour.id;
  const fallbackImg = `https://picsum.photos/seed/${tourId}/800/600`;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        className="group glass-card overflow-hidden flex flex-row h-48"
      >
        {/* Image */}
        <div className="relative w-64 shrink-0 overflow-hidden">
          <img
            src={tour.imageCover || fallbackImg}
            alt={tour.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/60" />
          <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border ${colorClass}`}>
            {tour.difficulty}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-white">{tour.name}</h3>
              <div className="flex items-center gap-1 text-amber-400 shrink-0">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold text-white">{tour.ratingsAverage}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1 mb-2">
              <MapPin size={13} />
              <span>{tour.startLocation?.description}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{tour.summary}</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1"><Clock size={12} className="text-accent" />{tour.duration}d</span>
              <span className="flex items-center gap-1"><Users size={12} className="text-accent" />{tour.maxGroupSize}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-white">${tour.price}</span>
              <Link
                to={`/tours/${tourId}`}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all text-sm font-semibold"
              >
                View
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative glass-card overflow-hidden h-full flex flex-col"
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={tour.imageCover || fallbackImg}
          alt={tour.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>

        {/* Difficulty Pill */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${colorClass}`}>
            {tour.difficulty}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">${tour.price}</span>
            <span className="text-gray-400 text-sm">/ person</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold line-clamp-1">{tour.name}</h3>
          <div className="flex items-center gap-1 text-amber-400 shrink-0">
            <Star size={16} fill="currentColor" />
            <span className="text-sm font-bold text-white">{tour.ratingsAverage}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <MapPin size={14} />
          <span>{tour.startLocation?.description}</span>
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-grow">
          {tour.summary}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Clock size={14} className="text-accent" />
            <span>{tour.duration} DAYS</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Users size={14} className="text-accent" />
            <span>UP TO {tour.maxGroupSize}</span>
          </div>
        </div>

        <Link
          to={`/tours/${tourId}`}
          className="mt-6 w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <span className="font-semibold">View Details</span>
          <ArrowUpRight size={18} className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TourCard;
