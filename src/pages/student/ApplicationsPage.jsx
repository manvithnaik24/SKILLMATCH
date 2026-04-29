import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle, Clock, XCircle, Award, Eye, FileX } from 'lucide-react';
import MatchScoreCircle from '../../components/MatchScoreCircle';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  'Applied':      { bg: 'bg-[#F4C430]/10', text: 'text-[#D4A017]', border: 'border-[#F4C430]/20', icon: Clock },
  'Under Review': { bg: 'bg-blue-50',       text: 'text-blue-600',   border: 'border-blue-100',      icon: Eye },
  'Shortlisted':  { bg: 'bg-[#2E8B57]/10', text: 'text-[#2E8B57]', border: 'border-[#2E8B57]/20', icon: CheckCircle },
  'Hired':        { bg: 'bg-purple-50',     text: 'text-purple-600', border: 'border-purple-100',    icon: Award },
  'Rejected':     { bg: 'bg-red-50',        text: 'text-red-600',   border: 'border-red-100',       icon: XCircle },
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'applications'), where('studentId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
      setApplications(data);
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsub();
  }, [user]);

  const handleWithdraw = async (appId, jobTitle) => {
    if (!window.confirm(`Withdraw application for "${jobTitle}"?`)) return;
    try {
      await deleteDoc(doc(db, 'applications', appId));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw'); }
  };

  const filtered = filterStatus === 'All' ? applications : applications.filter(a => a.status === filterStatus);

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    hired: applications.filter(a => a.status === 'Hired').length,
    pending: applications.filter(a => ['Applied', 'Under Review'].includes(a.status)).length,
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Track your internship and job applications in real-time.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: stats.total, color: 'from-[#2E8B57] to-[#1F7A6B]', textColor: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'bg-white', textColor: 'text-slate-900', border: 'border border-slate-100' },
          { label: 'Shortlisted', value: stats.shortlisted, color: 'from-[#F4C430] to-[#D4A017]', textColor: 'text-white' },
          { label: 'Hired', value: stats.hired, color: 'from-purple-500 to-purple-700', textColor: 'text-white' },
        ].map(({ label, value, color, textColor, border }) => (
          <div key={label} className={`p-5 rounded-2xl shadow-sm ${color.startsWith('from') ? `bg-gradient-to-br ${color}` : color} ${border || ''}`}>
            <p className={`text-sm font-semibold ${textColor} opacity-80`}>{label}</p>
            <p className={`text-4xl font-bold tracking-tight mt-1 ${textColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex flex-wrap gap-1">
        {['All', 'Applied', 'Under Review', 'Shortlisted', 'Hired', 'Rejected'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${filterStatus === s ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
            {s} {s !== 'All' && <span className="ml-1 opacity-70">({applications.filter(a => a.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Application List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <FileX className="w-12 h-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">{filterStatus === 'All' ? 'No applications yet' : `No ${filterStatus} applications`}</h3>
          <p className="text-sm text-slate-400">{filterStatus === 'All' ? 'Start applying to jobs from the Browse Jobs page.' : 'Try another filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['Applied'];
              const Icon = cfg.icon;
              return (
                <motion.div key={app.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#2E8B57]/20 hover:shadow-md transition-all p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2E8B57]/10 to-[#1F7A6B]/10 flex items-center justify-center text-[#2E8B57] font-bold text-base flex-shrink-0">
                      {(app.companyName || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 tracking-tight">{app.jobTitle}</h3>
                          <p className="text-sm font-semibold text-slate-500">{app.companyName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <MatchScoreCircle score={app.matchScore || 0} size={44} />
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {app.status || 'Applied'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-slate-400 flex-wrap">
                        {app.appliedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        )}
                        {app.status === 'Applied' && (
                          <button onClick={() => handleWithdraw(app.id, app.jobTitle)}
                            className="text-red-400 hover:text-red-600 hover:underline ml-auto transition-colors">
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Progress Track */}
                  <div className="mt-4 flex items-center gap-1">
                    {['Applied', 'Under Review', 'Shortlisted', 'Hired'].map((step, i) => {
                      const steps = ['Applied', 'Under Review', 'Shortlisted', 'Hired'];
                      const currentIdx = steps.indexOf(app.status);
                      const isActive = i <= currentIdx && app.status !== 'Rejected';
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`h-1.5 flex-1 rounded-full transition-all ${isActive ? 'bg-[#2E8B57]' : 'bg-slate-100'}`} />
                          {i < 3 && <div className={`w-2 h-2 rounded-full mx-0.5 ${isActive ? 'bg-[#2E8B57]' : 'bg-slate-200'}`} />}
                        </div>
                      );
                    })}
                    {app.status === 'Rejected' && (
                      <div className="h-1.5 flex-1 rounded-full bg-red-200" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
