import { useState, useEffect } from 'react';
import { FileText, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Fallback animated counter component
function AnimatedNumber({ end, duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // Calculate current count based on elapsed time (linear easing)
      const current = Math.min(Math.round((progress / (duration * 1000)) * end), end);
      setCount(current);

      if (progress < duration * 1000) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count}</span>;
}

export default function AnalyticsPanel({ applications, totalJobs = 0 }) {
  const total = applications.length;
  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;
  const avgMatch = total > 0 
    ? Math.round(applications.reduce((acc, a) => acc + (a.matchScore || 0), 0) / total)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="bg-gradient-to-br from-[#2E8B57] to-[#1F7A6B] text-white p-6 rounded-2xl shadow-sm cursor-pointer relative overflow-hidden group"
      >
        <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90">Total Jobs Available</h3>
          <div className="p-2 bg-white/20 rounded-xl">
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight"><AnimatedNumber end={totalJobs} duration={2} /></p>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500">Applied Jobs</h3>
          <div className="p-2 bg-blue-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-slate-900"><AnimatedNumber end={total} duration={2} /></p>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="bg-gradient-to-br from-[#F4C430] to-[#D4A017] text-white p-6 rounded-2xl shadow-sm cursor-pointer relative overflow-hidden group"
      >
        <div className="absolute -left-6 -bottom-6 bg-white/20 w-24 h-24 rounded-full blur-xl group-hover:bg-white/30 transition-all duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90">Avg Match Score</h3>
          <div className="p-2 bg-white/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight"><AnimatedNumber end={avgMatch} duration={2} />%</p>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500">Shortlisted</h3>
          <div className="p-2 bg-slate-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-[#2E8B57]" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight text-slate-900"><AnimatedNumber end={shortlisted} duration={2} /></p>
      </motion.div>
    </motion.div>
  );
}
