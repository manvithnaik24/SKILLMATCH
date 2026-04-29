import { Briefcase, Trash2, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JobList({ jobs, selectedJobId, onSelectJob, onDeleteJob, onToggleStatus, isLoading, hideHeader }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
        {!hideHeader && (
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Active Job Postings</h2>
            <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
        )}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-slate-100 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-5 w-20 bg-slate-100 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
        {!hideHeader && (
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Active Job Postings</h2>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-3">
            <Briefcase className="w-6 h-6 text-slate-400" />
          </div>
          <p className="font-medium text-slate-900">No active postings</p>
          <p className="text-sm text-slate-500 mt-1">Create a new job posting to get started.</p>
        </div>
      </div>
    );
  }

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
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full ${hideHeader ? 'border-none shadow-none bg-transparent' : ''}`}>
      {!hideHeader && (
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Active Job Postings</h2>
          <span className="text-sm bg-[#2E8B57]/10 text-[#2E8B57] px-3 py-1 rounded-full font-bold">
            {jobs.length} Total
          </span>
        </div>
      )}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`flex-1 overflow-auto space-y-4 ${hideHeader ? '' : 'p-4'}`}
      >
        {jobs.map((job) => {
          const isSelected = job.id === selectedJobId;
          return (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              key={job.id} 
              onClick={() => onSelectJob && onSelectJob(job.id)}
              className={`border rounded-2xl p-5 transition-all cursor-pointer group relative ${
                isSelected 
                  ? 'border-[#2E8B57] bg-[#2E8B57]/5 ring-1 ring-[#2E8B57] shadow-sm' 
                  : 'border-slate-100 bg-white hover:border-[#2E8B57]/30 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="pr-20">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold transition-colors tracking-tight text-lg leading-tight ${isSelected ? 'text-[#1F7A6B]' : 'text-slate-900 group-hover:text-[#2E8B57]'}`}>
                      {job.title}
                    </h3>
                    {job.status === 'Closed' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-500 uppercase tracking-wider">Closed</span>
                    )}
                    {(!job.status || job.status === 'Open') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2E8B57]/10 text-[#2E8B57] uppercase tracking-wider">Active</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.jobType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-1">
                  {onToggleStatus && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(job.id, job.status);
                      }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      {(job.status || 'Open') === 'Open' ? 'Pause Hiring' : 'Reopen'}
                    </button>
                  )}
                  {onDeleteJob && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob(job.id);
                      }}
                      className="p-1.5 border border-transparent text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-[12px] font-semibold text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Just now'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Due: {job.deadline}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {job.skillsRequired.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full shadow-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
