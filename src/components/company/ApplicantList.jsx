import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, FileX, Users, Search, Filter, Eye, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import MatchScoreCircle from '../MatchScoreCircle';

export default function ApplicantList({ applicants = [], onUpdateStatus, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('match'); // 'match', 'status', 'job'

  const filteredAndSortedApplicants = useMemo(() => {
    let result = [...applicants];

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(app => {
        const nameMatch = (app.studentName || '').toLowerCase().includes(lowerSearch);
        const roleMatch = (app.role || '').toLowerCase().includes(lowerSearch);
        return nameMatch || roleMatch;
      });
    }

    result.sort((a, b) => {
      if (filterType === 'match') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      } else if (filterType === 'status') {
        const rank = { 'Hired': 1, 'Shortlisted': 2, 'Under Review': 3, 'Applied': 4, 'Rejected': 5 };
        const rankA = rank[a.status] || 6;
        const rankB = rank[b.status] || 6;
        return rankA - rankB;
      } else if (filterType === 'job') {
        return (a.role || '').localeCompare(b.role || '');
      }
      return 0;
    });

    return result;
  }, [applicants, searchTerm, filterType]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Recent Applicants</h2>
          <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!applicants || applicants.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Recent Applicants</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-50 p-5 rounded-full mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No applicants yet</h3>
          <p className="text-slate-500 max-w-sm">When students apply to the selected job, they will appear here for your review.</p>
        </div>
      </div>
    );
  }

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Recent Applicants</h2>
          <span className="text-sm font-semibold text-slate-500">{filteredAndSortedApplicants.length} to review</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search names, roles..."
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
              <option value="match">Highest Match</option>
              <option value="status">Status</option>
              <option value="job">Job Title</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/50 text-slate-400 uppercase font-bold text-[10px] tracking-widest border-b border-slate-100 sticky top-0 backdrop-blur-sm z-10">
            <tr>
              <th className="px-6 py-4">Candidate</th>
              <th className="px-6 py-4">Applied For</th>
              <th className="px-6 py-4 text-center">Match</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          {filteredAndSortedApplicants.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="4">
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <FileX className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No Results</h3>
                    <p className="text-slate-500 max-w-sm">No applicants match your search criteria.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-slate-100"
            >
              {filteredAndSortedApplicants.map((app) => (
                <motion.tr variants={itemVariants} key={app.id} className="hover:bg-[#F8F9FB] transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900 group-hover:text-[#2E8B57] transition-colors">{app.studentName}</p>
                  </td>
                  <td className="px-6 py-5 font-medium">{app.role}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <MatchScoreCircle score={app.matchScore} size={40} />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {app.status === 'Applied' && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onUpdateStatus(app.id, 'Under Review')}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors shadow-sm"
                        >
                          Review
                        </motion.button>
                      )}
                      {(app.status === 'Applied' || app.status === 'Under Review') && (
                        <>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onUpdateStatus(app.id, 'Shortlisted')}
                            className="px-3 py-1.5 text-xs font-bold bg-[#2E8B57]/10 text-[#2E8B57] rounded-lg hover:bg-[#2E8B57]/20 border border-[#2E8B57]/20 transition-colors shadow-sm"
                          >
                            Shortlist
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onUpdateStatus(app.id, 'Rejected')}
                            className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-colors shadow-sm"
                          >
                            Reject
                          </motion.button>
                        </>
                      )}
                      {app.status === 'Shortlisted' && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onUpdateStatus(app.id, 'Hired')}
                          className="px-3 py-1.5 text-xs font-bold bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-100 transition-colors shadow-sm"
                        >
                          Hire
                        </motion.button>
                      )}
                      {app.status === 'Hired' && (
                        <div className="flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg border shadow-sm bg-purple-50 border-purple-100 text-purple-600">
                          <Award className="w-4 h-4" />
                          <span className="text-xs">Hired!</span>
                        </div>
                      )}
                      {app.status === 'Rejected' && (
                        <div className="flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg border shadow-sm bg-red-50 border-red-100 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs">Rejected</span>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>
    </div>
  );
}
