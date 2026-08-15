import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
        <span className="font-display text-primary tracking-widest uppercase text-sm">Tra-well</span>
      </motion.div>
    </div>
  );
};

export default Loader;
