import React from 'react';
import Hero from '../components/Hero';
import TourCard from '../components/TourCard';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

const MOCK_TOURS = [
  {
    id: '1',
    name: "The Forest Hiker",
    price: 497,
    duration: 5,
    maxGroupSize: 25,
    difficulty: 'Easy' as const,
    ratingsAverage: 4.7,
    ratingsQuantity: 37,
    imageCover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop",
    summary: "Breathtaking hike through the Canadian Banff National Park",
    startLocation: { description: 'Banff, Canada' }
  },
  {
    id: '2',
    name: "The Sea Explorer",
    price: 897,
    duration: 7,
    maxGroupSize: 15,
    difficulty: 'Medium' as const,
    ratingsAverage: 4.8,
    ratingsQuantity: 21,
    imageCover: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2670&auto=format&fit=crop",
    summary: "Exploring the hidden gems of the Mediterranean Sea",
    startLocation: { description: 'Amalfi Coast, Italy' }
  },
  {
    id: '3',
    name: "The Snow Adventurer",
    price: 997,
    duration: 4,
    maxGroupSize: 10,
    difficulty: 'Difficult' as const,
    ratingsAverage: 4.9,
    ratingsQuantity: 15,
    imageCover: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=2670&auto=format&fit=crop",
    summary: "Exciting adventure in the heart of the Swiss Alps",
    startLocation: { description: 'Zermatt, Switzerland' }
  }
];

const Home: React.FC = () => {
  return (
    <div className="space-y-32">
      <Hero />
      
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-primary font-mono text-xs tracking-[0.3em] font-bold uppercase transition-all">Our Collection</span>
            </div>
            <h2 className="text-5xl font-display font-extrabold text-white tracking-tighter">
              MOST <span className="text-gradient-emerald">POPULAR</span> TOURS
            </h2>
          </div>
          <p className="text-gray-400 max-w-md leading-relaxed border-l border-white/10 pl-6">
            Handpicked experiences designed for those who seek the extraordinary. From deep forests to sapphire seas, discover luxury that knows no bounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_TOURS.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <div className="flex justify-center mt-20">
          <button className="btn-luxury-outline flex items-center gap-3 px-12 py-4">
            <Compass size={20} className="text-primary" />
            <span className="font-bold tracking-widest">VIEW ALL EXPERIENCES</span>
          </button>
        </div>
      </section>

      {/* Luxury Quote Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter leading-tight italic">
              "Travel is the only thing you buy that makes you richer."
            </h2>
            <div className="flex items-center justify-center gap-4 mt-12">
              <span className="h-px w-8 bg-white/20"></span>
              <span className="text-gray-500 font-mono tracking-[0.4em] uppercase text-sm">— THE DISCERNING TRAVELER</span>
              <span className="h-px w-8 bg-white/20"></span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
