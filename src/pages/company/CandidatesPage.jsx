import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Search, Filter, Users, FileX, CheckCircle, XCircle, Clock, Eye, Award, Sparkles } from 'lucide-react';
import MatchScoreCircle from '../../components/MatchScoreCircle';
import CandidateProfileModal from '../../components/company/CandidateProfileModal';
import { getCandidateBadges, getAISummary } from '../../utils/aiEngine';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'];

export default function CandidatesPage() {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    if (!user) return;
    const qApps = query(collection(db, 'applications'), where('companyId', '==', user.uid));
    const unsubApps = onSnapshot(qApps, async (snapshot) => {
      const apps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Enrich with student profile data
      const enriched = await Promise.all(apps.map(async (app) => {
        try {
          const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', app.studentId)));
          if (!userSnap.empty) {
            const profile = userSnap.docs[0].data();
            return { ...app, skills: profile.skills || [], college: profile.college, github: profile.github, linkedin: profile.linkedin, resumeUrl: profile.resumeUrl, experience: profile.experience, projects: profile.projects, hackathons: profile.hackathons, certifications: profile.certifications };
          }
        } catch (e) {}
        return app;
      }));

      setApplicants(enriched);
      setIsLoading(false);
    });

    const qJobs = query(collection(db, 'jobs'), where('companyId', '==', user.uid));
    const unsubJobs = onSnapshot(qJobs, (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubApps(); unsubJobs(); };
  }, [user]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = useMemo(() => {
    let result = [...applicants];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a =>
        (a.studentName || '').toLowerCase().includes(q) ||
        (a.role || '').toLowerCase().includes(q) ||
        (a.jobTitle || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(a => a.status === statusFilter);
    if (jobFilter !== 'All') result = result.filter(a => a.role === jobFilter || a.jobTitle === jobFilter);

    result.sort((a, b) => {
      if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === 'newest') return new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0);
      if (sortBy === 'status') {
        const rank = { 'Hired': 1, 'Shortlisted': 2, 'Under Review': 3, 'Applied': 4, 'Rejected': 5 };
        return (rank[a.status] || 9) - (rank[b.status] || 9);
      }
      return 0;
    });

    return result;
  }, [applicants, searchTerm, statusFilter, jobFilter, sortBy]);

  const getStatusBadge = (status) => {
    const styles = {
      'Hired': 'bg-purple-50 text-purple-600 border-purple-100',
      'Shortlisted': 'bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20',
      'Under Review': 'bg-blue-50 text-blue-600 border-blue-100',
      'Rejected': 'bg-red-50 text-red-600 border-red-100',
      'Applied': 'bg-[#F4C430]/10 text-[#D4A017] border-[#F4C430]/20',
    };
    return styles[status] || styles['Applied'];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hired': return <Award className="w-3.5 h-3.5" />;
      case 'Shortlisted': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Under Review': return <Eye className="w-3.5 h-3.5" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const jobTitles = [...new Set(applicants.map(a => a.role || a.jobTitle).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidates</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {applicants.length} total applicants across all positions
          </p>
        </div>
        <div className="flex gap-2 text-sm text-slate-500 font-medium">
          <span className="px-3 py-1.5 bg-[#2E8B57]/10 text-[#2E8B57] rounded-full font-bold text-xs">
            {applicants.filter(a => a.status === 'Shortlisted').length} Shortlisted
          </span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full font-bold text-xs">
            {applicants.filter(a => a.status === 'Hired').length} Hired
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates or roles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all font-medium placeholder-slate-400 text-slate-800"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="w-40 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all cursor-pointer">
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}
          className="w-44 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all cursor-pointer">
          <option value="All">All Roles</option>
          {jobTitles.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="w-44 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all cursor-pointer">
          <option value="match">Highest Match %</option>
          <option value="newest">Newest First</option>
          <option value="status">By Status</option>
        </select>
      </div>

      {/* Table */}
      {applicants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No applicants yet</h3>
          <p className="text-sm text-slate-400 max-w-sm">Once students apply to your jobs, their profiles will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <FileX className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No results found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100 sticky top-0">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">Match</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <motion.tbody className="divide-y divide-slate-100"
              initial="hidden" animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
              {filtered.map((app) => (
                <motion.tr key={app.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="hover:bg-[#F8F9FB] transition-colors group cursor-pointer"
                  onClick={() => setSelectedCandidate(app)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4C430] to-[#E6B020] flex items-center justify-center text-[#1A1A1A] font-bold text-sm shadow-sm">
                        {(app.studentName || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-[#2E8B57] transition-colors">{app.studentName}</p>
                        {app.appliedAt && <p className="text-xs text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getCandidateBadges(app).map((b, i) => (
                            <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${b.color}`}>{b.icon} {b.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{app.role || app.jobTitle}</td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-center">
                      <MatchScoreCircle score={app.matchScore || 0} size={40} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadge(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status || 'Applied'}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {app.status === 'Applied' && (
                        <button onClick={() => handleUpdateStatus(app.id, 'Under Review')}
                          className="px-2.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                          Review
                        </button>
                      )}
                      {(app.status === 'Applied' || app.status === 'Under Review') && (
                        <>
                          <button onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                            className="px-2.5 py-1.5 text-xs font-bold bg-[#2E8B57]/10 text-[#2E8B57] rounded-lg border border-[#2E8B57]/20 hover:bg-[#2E8B57]/20 transition-colors">
                            Shortlist
                          </button>
                          <button onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                            className="px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {app.status === 'Shortlisted' && (
                        <button onClick={() => handleUpdateStatus(app.id, 'Hired')}
                          className="px-2.5 py-1.5 text-xs font-bold bg-purple-50 text-purple-600 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                          Hire
                        </button>
                      )}
                      {(app.status === 'Hired' || app.status === 'Rejected') && (
                        <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}
    </div>
  );
}
