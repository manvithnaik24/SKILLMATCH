import { useState } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, FileX, Eye, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchScoreCircle from '../MatchScoreCircle';

export default function ApplicationTracker({ applications, isLoading }) {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hired':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'Shortlisted':
        return <CheckCircle className="w-4 h-4 text-[#2E8B57]" />;
      case 'Under Review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Applied':
      default:
        return <Clock className="w-4 h-4 text-[#F4C430]" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Hired':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Shortlisted':
        return 'bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20';
      case 'Under Review':
        return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Rejected':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Applied':
      default:
        return 'bg-[#F4C430]/10 text-[#D4A017] border-[#F4C430]/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-[#2E8B57] font-bold';
    if (score >= 40) return 'text-[#D4A017] font-bold';
    return 'text-red-500 font-bold';
  };

  const filteredApps = activeTab === 'All' 
    ? applications 
    : applications.filter(app => app.status === activeTab);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-5 bg-slate-50/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Application Tracker</h2>
          <span className="text-sm font-semibold text-slate-500">{filteredApps.length} Jobs</span>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-100 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors relative z-10 ${
                activeTab === tab 
                  ? 'border-[#2E8B57] text-[#2E8B57]' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse"></div>
                    <div className="h-3 w-48 bg-slate-50 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center p-8 text-center"
          >
             <div className="bg-[#F8F9FB] p-5 rounded-full mb-4">
               <FileX className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-base font-bold text-slate-800">No applications</p>
             <p className="text-sm text-slate-500 mt-1.5 max-w-[200px]">You haven't applied to any jobs in this category yet.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="divide-y divide-slate-100"
            >
              {filteredApps.map((app) => (
                <motion.div 
                  variants={itemVariants} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  key={app.id} 
                  className="p-5 hover:bg-[#F8F9FB] transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border ${getStatusStyle(app.status)} shadow-sm`}>
                      {getStatusIcon(app.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#2E8B57] transition-colors tracking-tight">{app.role}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[13px] font-medium text-slate-500">{app.company}</p>
                        <span className="text-slate-300 text-xs">•</span>
                        <div className="flex items-center gap-1.5">
                          <MatchScoreCircle score={app.matchScore} size={24} />
                          <span className={`text-[13px] ${getScoreColor(app.matchScore)}`}>
                            Match
                          </span>
                        </div>
                        {app.appliedAt && (
                          <>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="text-[13px] text-slate-400">
                              Applied {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(app.status)} shadow-sm`}>
                      {app.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2E8B57] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
