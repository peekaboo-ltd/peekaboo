import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export const FlowIndicator = () => {
  return (
    <div className="relative py-8 bg-gradient-to-b from-blue-800 to-blue-50 overflow-hidden">
      {/* Connecting Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 transform -translate-x-1/2" />
      
      {/* Animated Dots */}
      <motion.div
        className="absolute left-1/2 w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2"
        animate={{
          y: [0, 50, 100],
          opacity: [1, 0.5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Flow Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center h-full text-center px-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-4"
        >
          <ChevronDown className="w-6 h-6 text-blue-600" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50"
        >
          <p className="text-blue-700 font-semibold text-sm">
            👇 Start booking your delivery below
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};