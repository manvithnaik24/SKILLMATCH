import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MapPin, Calendar, Briefcase, Zap, CheckCircle, Trash2 } from 'lucide-react';
import { addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsubSaved = onSnapshot(
      query(collection(db, 'savedJobs'), where('studentId', '==', user.uid)),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
        setSavedJobs(data);
        setIsLoading(false);
      }
    );
    const unsubApps = onSnapshot(
      query(collection(db, 'applications'), where('studentId', '==', user.uid)),
      (snap) => setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubSaved(); unsubApps(); };
  }, [user]);

  const appliedIds = new Set(applications.map(a => a.jobId));

  const handleRemove = async (savedId, title) => {
    try {
      await deleteDoc(doc(db, 'savedJobs', savedId));
      toast.success(`Removed "${title}" from saved`);
    } catch { toast.error('Failed to remove'); }
  };

  const handleApply = async (item) => {
    if (appliedIds.has(item.jobId)) return toast.error('Already applied!');
    setApplying(item.id);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: item.jobId, jobTitle: item.job?.title || '', companyId: item.job?.companyId || '',
        companyName: item.job?.companyName || '', studentId: user.uid,
        studentName: user.name || 'Student', matchScore: 0, skills: user.skills || [],
        status: 'Applied', appliedAt: new Date().toISOString(),
      });
      toast.success(`Applied to ${item.job?.title}!`);
    } catch { toast.error('Failed to apply.'); }
    finally { setApplying(null); }
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-36 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-[#F4C430]" /> Saved Jobs
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">{savedJobs.length} jobs saved for later.</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Bookmark className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No saved jobs yet</h3>
          <p className="text-sm text-slate-400 max-w-sm">Browse the Jobs page and click Save to bookmark opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {savedJobs.map(item => {
              const job = item.job || {};
              const isApplied = appliedIds.has(item.jobId);
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#F4C430]/30 hover:shadow-md transition-all p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F4C430]/20 to-[#D4A017]/10 flex items-center justify-center text-[#D4A017] font-bold text-base flex-shrink-0">
                      {(job.companyName || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{job.title || 'Job Title'}</h3>
                          <p className="text-sm font-semibold text-slate-500">{job.companyName}</p>
                        </div>
                        <button onClick={() => handleRemove(item.id, job.title)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500 mt-2">
                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                        {job.deadline && <span className="flex items-center gap-1 text-orange-600"><Calendar className="w-3.5 h-3.5" />Due: {job.deadline}</span>}
                        {item.savedAt && <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5 text-[#F4C430]" />Saved {new Date(item.savedAt).toLocaleDateString()}</span>}
                      </div>
                      {(job.skillsRequired || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.skillsRequired.map((s, i) => (
                            <span key={i} className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{s}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleApply(item)}
                          disabled={isApplied || applying === item.id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isApplied ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white hover:shadow-md shadow-sm'}`}>
                          <CheckCircle className="w-4 h-4" />
                          {isApplied ? 'Applied ✓' : applying === item.id ? 'Applying...' : 'Apply Now'}
                        </motion.button>
                      </div>
                    </div>
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
