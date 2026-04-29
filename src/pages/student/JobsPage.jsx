import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import {
  collection, query, where, onSnapshot, addDoc, doc,
  getDocs, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, Briefcase, Star, BookOpen,
  CheckCircle, ChevronDown, SlidersHorizontal, Bookmark, BookmarkCheck, Zap
} from 'lucide-react';
import MatchScoreCircle from '../../components/MatchScoreCircle';
import { calculateMatchScore, getMatchLabel, getMatchExplanation, getSkillGap } from '../../utils/aiEngine';
import toast from 'react-hot-toast';

const SORT_OPTIONS = ['Best Match', 'Newest', 'Deadline Soon'];

export default function StudentJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Best Match');
  const [minMatch, setMinMatch] = useState(0);
  const [expandedJob, setExpandedJob] = useState(null);
  const [applying, setApplying] = useState(null);

  const studentSkills = user?.skills || [];

  useEffect(() => {
    if (!user) return;

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });

    const unsubApps = onSnapshot(
      query(collection(db, 'applications'), where('studentId', '==', user.uid)),
      (snap) => setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubSaved = onSnapshot(
      query(collection(db, 'savedJobs'), where('studentId', '==', user.uid)),
      (snap) => setSavedJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubJobs(); unsubApps(); unsubSaved(); };
  }, [user]);


  const enrichedJobs = useMemo(() => {
    const fullStudent = { ...user, skills: studentSkills };
    return jobs.map(job => {
      const ms = calculateMatchScore(fullStudent, job);
      const gap = getSkillGap(fullStudent, job);
      return {
        ...job,
        matchScore: ms,
        missingSkills: gap.critical.concat(gap.optional),
        skillGap: gap,
        matchLabel: getMatchLabel(ms),
        matchExplanation: getMatchExplanation(fullStudent, job),
      };
    });
  }, [jobs, studentSkills]);

  const filtered = useMemo(() => {
    let result = enrichedJobs.filter(j => {
      const s = searchTerm.toLowerCase();
      return (
        (j.title || '').toLowerCase().includes(s) ||
        (j.companyName || '').toLowerCase().includes(s) ||
        (j.description || '').toLowerCase().includes(s)
      ) && j.matchScore >= minMatch;
    });

    if (sortBy === 'Best Match') result.sort((a, b) => b.matchScore - a.matchScore);
    else if (sortBy === 'Newest') result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    else if (sortBy === 'Deadline Soon') result.sort((a, b) => new Date(a.deadline || '9999') - new Date(b.deadline || '9999'));

    return result;
  }, [enrichedJobs, searchTerm, sortBy, minMatch]);

  const appliedIds = new Set(applications.map(a => a.jobId));
  const savedIds = new Set(savedJobs.map(s => s.jobId));

  const handleApply = async (job) => {
    if (appliedIds.has(job.id)) return toast.error('Already applied!');
    setApplying(job.id);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id, jobTitle: job.title, companyId: job.companyId,
        companyName: job.companyName, studentId: user.uid,
        studentName: user.name || 'Student', matchScore: job.matchScore,
        skills: studentSkills, status: 'Applied',
        appliedAt: new Date().toISOString(),
      });
      toast.success(`Applied to ${job.title}!`);
    } catch { toast.error('Failed to apply.'); }
    finally { setApplying(null); }
  };

  const handleSave = async (job) => {
    const existing = savedJobs.find(s => s.jobId === job.id);
    if (existing) {
      await deleteDoc(doc(db, 'savedJobs', existing.id));
      toast.success('Removed from saved jobs');
    } else {
      await addDoc(collection(db, 'savedJobs'), {
        jobId: job.id, studentId: user.uid,
        job: { title: job.title, companyName: job.companyName, location: job.location, deadline: job.deadline, skillsRequired: job.skillsRequired },
        savedAt: new Date().toISOString(),
      });
      toast.success('Job saved!');
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse" />
      {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Jobs</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">{filtered.length} opportunities matched for you</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search jobs, companies, skills..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all font-medium placeholder-slate-400 text-slate-800"
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="w-44 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all cursor-pointer">
          {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-bold text-slate-500">Min Match:</span>
          <input type="range" min="0" max="90" step="10" value={minMatch}
            onChange={e => setMinMatch(Number(e.target.value))}
            className="w-24 accent-[#2E8B57]" />
          <span className="text-xs font-bold text-[#2E8B57] min-w-[32px]">{minMatch}%</span>
        </div>
      </div>

      {/* Job Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="w-12 h-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No jobs found</h3>
          <p className="text-sm text-slate-400">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => {
            const isApplied = appliedIds.has(job.id);
            const isSaved = savedIds.has(job.id);
            const isExpanded = expandedJob === job.id;

            return (
              <motion.div key={job.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#2E8B57]/20 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E8B57]/10 to-[#1F7A6B]/10 flex items-center justify-center text-[#2E8B57] font-bold text-lg flex-shrink-0 border border-[#2E8B57]/10">
                      {(job.companyName || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 tracking-tight">{job.title}</h2>
                          <p className="text-sm font-semibold text-slate-500">{job.companyName}</p>
                          {job.matchLabel && (
                            <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${job.matchLabel.bg} ${job.matchLabel.color}`}>
                              {job.matchLabel.label}
                            </span>
                          )}
                        </div>
                        <MatchScoreCircle score={job.matchScore} size={52} />
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500 mt-3">
                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                        {job.jobType && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.jobType}</span>}
                        {job.workMode && <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{job.workMode}</span>}
                        {job.deadline && <span className="flex items-center gap-1 text-orange-600"><Calendar className="w-3.5 h-3.5" />Due: {job.deadline}</span>}
                        {job.salary && <span className="flex items-center gap-1 text-[#2E8B57]"><Star className="w-3.5 h-3.5" />{job.salary}</span>}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(job.skillsRequired || []).map((skill, i) => {
                          const has = studentSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                          return (
                            <span key={i} className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${has ? 'bg-[#2E8B57]/10 text-[#2E8B57] border border-[#2E8B57]/20' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                              {has ? '✓' : '✗'} {skill}
                            </span>
                          );
                        })}
                      </div>

                      {/* Expanded Description */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="mt-4 space-y-3">
                            <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                              {job.description || 'No description provided.'}
                            </div>
                            {/* AI Match Explanation */}
                            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-r from-[#2E8B57]/5 to-transparent border border-[#2E8B57]/15">
                              <span className="text-base flex-shrink-0">✨</span>
                              <div>
                                <p className="text-xs font-bold text-[#2E8B57] mb-0.5">AI Match Explanation</p>
                                <p className="text-xs text-slate-600 font-medium">{job.matchExplanation}</p>
                              </div>
                            </div>
                            {/* Skill Gap */}
                            {job.skillGap?.critical?.length > 0 && (
                              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100">
                                <p className="text-xs font-bold text-red-700 mb-2">⚠️ Missing Critical Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {job.skillGap.critical.map((s, i) => (
                                    <span key={i} className="text-xs px-2.5 py-0.5 bg-white text-red-600 rounded-full border border-red-200 font-bold">{s}</span>
                                  ))}
                                </div>
                                {job.skillGap.currentScore < 90 && (
                                  <p className="text-xs text-red-600 font-semibold mt-2">
                                    Learn {job.skillGap.critical[0]} → match improves {job.skillGap.currentScore}% → ~{job.skillGap.learnOneScore}%
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleApply(job)}
                          disabled={isApplied || applying === job.id}
                          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isApplied ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white hover:shadow-md'}`}>
                          <CheckCircle className="w-4 h-4" />
                          {isApplied ? 'Applied ✓' : applying === job.id ? 'Applying...' : 'Apply Now'}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleSave(job)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isSaved ? 'bg-[#F4C430]/10 text-[#D4A017] border-[#F4C430]/30' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          {isSaved ? 'Saved' : 'Save'}
                        </motion.button>
                        <button onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                          className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors ml-auto">
                          {isExpanded ? 'Less' : 'View Details'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
