import { motion } from 'framer-motion';

export default function Placeholder({ title, icon: Icon, description }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
          <Icon className="w-12 h-12 text-[#2E8B57]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">{title}</h1>
        <p className="text-slate-500 max-w-md text-lg leading-relaxed">
          {description || "This feature is currently under active development. Check back soon for exciting updates!"}
        </p>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-full text-sm hover:bg-slate-200 transition-colors"
          onClick={() => window.history.back()}
        >
          Go Back
        </motion.button>
      </motion.div>
    </div>
  );
}
