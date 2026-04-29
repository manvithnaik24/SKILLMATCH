import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock } from 'lucide-react';
import MatchScoreCircle from '../MatchScoreCircle';

export default function JobCard({ job, userSkills = [], onApply, isApplied }) {
  const jobSkills = job.skillsRequired || job.jobSkills || [];
  
  // Compute matching logic
  const matchedSkills = jobSkills.filter(skill => userSkills.includes(skill));
  const missingSkills = jobSkills.filter(skill => !userSkills.includes(skill));
  const matchScore = jobSkills.length > 0 
    ? Math.round((matchedSkills.length / jobSkills.length) * 100) 
    : 0;

  // Determine badge color and label based on score
  const getMatchInfo = (score) => {
    if (score >= 70) return { label: 'High Match', color: 'text-[#2E8B57] bg-[#2E8B57]/10 border-[#2E8B57]/20', icon: '🔥' };
    if (score >= 40) return { label: 'Medium Match', color: 'text-[#F4C430] bg-[#F4C430]/10 border-[#F4C430]/20', icon: '⭐' };
    return { label: 'Low Match', color: 'text-red-600 bg-red-50 border-red-100', icon: '⚠️' };
  };

  const matchInfo = getMatchInfo(matchScore);

  const handleApplyClick = () => {
    if (onApply && !isApplied) {
      onApply(job, matchScore);
    }
  };

  const companyName = job.companyName || job.company || 'Unknown Company';

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 pt-2">
        <div className="flex gap-4 items-start pr-4">
          {/* Company Logo Placeholder */}
          <div className="w-12 h-12 rounded-full bg-slate-100 flex flex-shrink-0 items-center justify-center border border-slate-200 text-slate-500 font-bold text-xl shadow-sm">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#2E8B57] transition-colors tracking-tight leading-tight mb-1">{job.title}</h3>
            <p className="text-sm text-slate-500 font-medium">{companyName}</p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-full px-1.5 py-1.5 pr-4 shadow-sm flex-shrink-0"
        >
          <MatchScoreCircle score={matchScore} size={32} />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Match</span>
            <span className={`text-xs font-bold leading-none mt-0.5 ${matchInfo.color.split(' ')[0]}`}>{matchInfo.label}</span>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 text-[12px] font-semibold text-slate-500 mb-4 pt-4 border-t border-slate-50">
        {job.location && (
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
          </div>
        )}
        {job.createdAt && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(job.createdAt).toLocaleDateString()}
          </div>
        )}
        {job.deadline && (
          <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
            <Clock className="w-3.5 h-3.5" />
            Due: {job.deadline}
          </div>
        )}
      </div>

      {job.description && (
        <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      <div className="flex-1 space-y-4">
        {matchedSkills.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Matched Skills</p>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-[#2E8B57]/10 text-[#2E8B57] text-xs rounded-full font-semibold border border-[#2E8B57]/20 shadow-sm hover:bg-[#2E8B57]/20 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Missing Skills</p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full font-semibold border border-red-100 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-slate-100">
        <motion.button 
          whileHover={!isApplied ? { scale: 1.02 } : {}}
          whileTap={!isApplied ? { scale: 0.97 } : {}}
          onClick={handleApplyClick}
          disabled={isApplied}
          className={`w-full py-3 rounded-full text-sm font-bold shadow-md ${
            isApplied 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
              : 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white'
          }`}
        >
          {isApplied ? 'Application Submitted' : 'Apply Now'}
        </motion.button>
      </div>
    </motion.div>
  );
}
