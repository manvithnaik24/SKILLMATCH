import { useState, useMemo } from 'react';
import JobCard from './JobCard';
import { SearchX, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JobList({ jobs = [], userSkills = [], onApply, appliedJobIds = [], isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('match'); // 'match', 'newest', 'deadline'

  const getMatchScore = (job, skills) => {
    const jobSkills = job.skillsRequired || job.jobSkills || [];
    if (jobSkills.length === 0) return 0;
    const matched = jobSkills.filter(s => skills.includes(s));
    return Math.round((matched.length / jobSkills.length) * 100);
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(job => {
        const titleMatch = (job.title || '').toLowerCase().includes(lowerSearch);
        const companyMatch = (job.company || job.companyName || '').toLowerCase().includes(lowerSearch);
        const skillMatch = (job.skillsRequired || []).some(s => s.toLowerCase().includes(lowerSearch));
        return titleMatch || companyMatch || skillMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (filterType === 'match') {
        return getMatchScore(b, userSkills) - getMatchScore(a, userSkills);
      } else if (filterType === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (filterType === 'deadline') {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      }
      return 0;
    });

    return result;
  }, [jobs, userSkills, searchTerm, filterType]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight whitespace-nowrap">Available Internships</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all cursor-pointer"
            >
              <option value="match">Highest Match %</option>
              <option value="newest">Newest First</option>
              <option value="deadline">Deadline Soon</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-slate-100 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="h-9 w-full bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedJobs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {jobs.length === 0 ? "No opportunities available yet" : "No jobs match your search"}
            </h3>
            <p className="text-slate-500 max-w-sm">
              {jobs.length === 0 
                ? "Check back later as companies post new opportunities!"
                : "Try adjusting your search or filters to see more results."}
            </p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredAndSortedJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
              return (
                <motion.div variants={itemVariants} key={job.id} className="h-full">
                  <JobCard 
                    job={job} 
                    userSkills={userSkills} 
                    onApply={onApply} 
                    isApplied={isApplied} 
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
