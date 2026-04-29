import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Link2, FileText, Star, CheckCircle, Award, Briefcase, Code, Trophy, BookOpen } from 'lucide-react';
import MatchScoreCircle from '../MatchScoreCircle';

export default function CandidateProfileModal({ candidate, onClose, onUpdateStatus }) {
  if (!candidate) return null;

  const skills = candidate.skills || [];
  const matchScore = candidate.matchScore || 0;

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-[#2E8B57]';
    if (score >= 50) return 'text-[#F4C430]';
    return 'text-red-500';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Hired': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Shortlisted': return 'bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20';
      case 'Under Review': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-[#F4C430]/10 text-[#D4A017] border-[#F4C430]/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-7 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F4C430] to-[#E6B020] flex items-center justify-center text-[#1A1A1A] font-bold text-xl shadow-md">
                {(candidate.studentName || 'C')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{candidate.studentName || 'Candidate'}</h2>
                <p className="text-sm font-semibold text-slate-500">{candidate.role || candidate.jobTitle || 'Applied Position'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusStyle(candidate.status)}`}>
                    {candidate.status || 'Applied'}
                  </span>
                  {candidate.appliedAt && (
                    <span className="text-xs text-slate-400 font-medium">
                      Applied {new Date(candidate.appliedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <MatchScoreCircle score={matchScore} size={52} />
                <p className={`text-xs font-bold mt-1 ${getScoreColor(matchScore)}`}>Match</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-7 space-y-6">
            {/* Skills */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Code className="w-3.5 h-3.5" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-[#2E8B57]/10 text-[#2E8B57] text-xs font-bold rounded-full border border-[#2E8B57]/20">
                    {skill}
                  </span>
                )) : (
                  <span className="text-slate-400 text-sm">No skills listed</span>
                )}
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BookOpen, label: 'College / University', value: candidate.college || 'Not specified' },
                { icon: Briefcase, label: 'Experience', value: candidate.experience || 'Fresher' },
                { icon: Trophy, label: 'Hackathons', value: candidate.hackathons || 'Not listed' },
                { icon: Star, label: 'Certifications', value: candidate.certifications || 'Not listed' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Code className="w-3.5 h-3.5" /> Projects
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-600 font-medium">{candidate.projects || 'No project details listed by candidate.'}</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {candidate.resumeUrl && (
                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors border border-slate-200">
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              )}
              {candidate.linkedin && (
                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors border border-blue-100">
                  <Link2 className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {candidate.github && (
                <a href={candidate.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-black transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {!candidate.resumeUrl && !candidate.linkedin && !candidate.github && (
                <p className="text-sm text-slate-400 font-medium">No external links provided.</p>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-colors border border-slate-200">
              Close
            </button>
            <div className="flex gap-2">
              {(candidate.status === 'Applied' || candidate.status === 'Under Review') && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { onUpdateStatus(candidate.id, 'Shortlisted'); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-xl hover:bg-[#2E8B57]/20 border border-[#2E8B57]/20 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Shortlist
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { onUpdateStatus(candidate.id, 'Rejected'); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 border border-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" /> Reject
                  </motion.button>
                </>
              )}
              {candidate.status === 'Shortlisted' && (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { onUpdateStatus(candidate.id, 'Hired'); onClose(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 text-sm font-bold rounded-xl hover:bg-purple-100 border border-purple-100 transition-colors"
                >
                  <Award className="w-4 h-4" /> Hire Candidate
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
