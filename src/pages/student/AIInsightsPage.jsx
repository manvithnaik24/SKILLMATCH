import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, Target, BookOpen, Mic2, ChevronDown, ChevronRight,
  CheckCircle, AlertTriangle, TrendingUp, Star, Download, Zap, User
} from 'lucide-react';
import {
  getResumeScore, getCareerRecommendations, getLearningRoadmap,
  getInterviewQuestions, getStudentInsights, getMatchLabel
} from '../../utils/aiEngine';

const TABS = ['Resume AI', 'Career Path', 'Learning Roadmap', 'Interview Prep', 'My Insights'];

const SectionCard = ({ title, children, icon: Icon, badge }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
      <h2 className="font-bold text-slate-800 flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-[#2E8B57]" /> {title}
      </h2>
      {badge && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white flex items-center gap-1"><Sparkles className="w-3 h-3" />{badge}</span>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function AIInsightsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Resume AI');
  const [student, setStudent] = useState({});
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [snap, appSnap] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        getDocs(query(collection(db, 'applications'), where('studentId', '==', user.uid))),
      ]);
      if (snap.exists()) setStudent({ uid: user.uid, ...snap.data() });
      setApplications(appSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    };
    load();
  }, [user]);

  const resumeData = useMemo(() => getResumeScore(student), [student]);
  const careers = useMemo(() => getCareerRecommendations(student), [student]);
  const roadmap = useMemo(() => getLearningRoadmap(selectedRole), [selectedRole]);
  const questions = useMemo(() => getInterviewQuestions(selectedRole), [selectedRole]);
  const insights = useMemo(() => getStudentInsights(student, applications, []), [student, applications]);

  const INSIGHT_STYLE = {
    warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, color: 'text-amber-600' },
    tip:     { bg: 'bg-blue-50 border-blue-200',   icon: Zap,            color: 'text-blue-600' },
    info:    { bg: 'bg-[#2E8B57]/5 border-[#2E8B57]/20', icon: Brain,   color: 'text-[#2E8B57]' },
    success: { bg: 'bg-purple-50 border-purple-200', icon: Star,         color: 'text-purple-600' },
  };

  const ScoreArc = ({ score, max = 100, size = 120, color = '#2E8B57' }) => {
    const r = 45; const circ = 2 * Math.PI * r;
    const pct = score / max; const dash = pct * circ;
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="50" y="50" textAnchor="middle" dy="6" fontSize="18" fontWeight="800" fill="#1e293b">{score}</text>
        <text x="50" y="68" textAnchor="middle" fontSize="8" fill="#94a3b8">/100</text>
      </svg>
    );
  };

  if (isLoading) return (
    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}</div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2E8B57] to-[#1F7A6B] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          AI Career Assistant
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Smart insights powered by your profile — no LLM needed.</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex flex-wrap gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}>

          {/* ── Resume AI ── */}
          {activeTab === 'Resume AI' && (
            <div className="space-y-4">
              <SectionCard title="Profile & Resume Score" icon={User} badge="AI Scored">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <ScoreArc score={resumeData.total} color={resumeData.total >= 70 ? '#2E8B57' : resumeData.total >= 50 ? '#F4C430' : '#ef4444'} />
                    <span className={`text-sm font-bold ${resumeData.total >= 70 ? 'text-[#2E8B57]' : resumeData.total >= 50 ? 'text-[#D4A017]' : 'text-red-600'}`}>
                      {resumeData.total >= 70 ? 'Strong Profile' : resumeData.total >= 50 ? 'Needs Work' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {Object.entries(resumeData.sections).map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-bold text-slate-600 capitalize">{key}</span>
                          <span className="text-xs font-bold text-slate-500">{val.score}/{val.max}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(val.score / val.max) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className={`h-full rounded-full ${val.score / val.max > 0.7 ? 'bg-[#2E8B57]' : val.score / val.max > 0.4 ? 'bg-[#F4C430]' : 'bg-red-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Suggestions */}
              <SectionCard title="AI Suggestions" icon={Sparkles} badge="Smart Fixes">
                <div className="space-y-2.5">
                  {Object.values(resumeData.sections).flatMap(s => s.tips).map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-amber-800">{tip}</p>
                    </div>
                  ))}
                  {Object.values(resumeData.sections).flatMap(s => s.tips).length === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-[#2E8B57]/5 border border-[#2E8B57]/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-[#2E8B57]" />
                      <p className="text-sm font-bold text-[#2E8B57]">Your profile looks great! No major issues found.</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── Career Path ── */}
          {activeTab === 'Career Path' && (
            <SectionCard title="AI Career Recommendations" icon={Target} badge="Based on Skills">
              <div className="space-y-3">
                {careers.map((c, i) => {
                  const labelCfg = getMatchLabel(c.confidence);
                  return (
                    <motion.div key={c.role}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#2E8B57]/20 hover:bg-slate-50/50 transition-all group">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E8B57]/10 to-[#1F7A6B]/10 flex items-center justify-center text-base flex-shrink-0">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-sm">{c.role}</p>
                          {i === 0 && <span className="text-xs font-bold px-2 py-0.5 bg-[#2E8B57]/10 text-[#2E8B57] rounded-full border border-[#2E8B57]/20">Best Fit</span>}
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.confidence}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B]" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-lg font-black text-[#2E8B57]">{c.confidence}%</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${labelCfg.bg} ${labelCfg.color}`}>{labelCfg.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
                {careers.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Add skills to your profile to get career recommendations.</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* ── Learning Roadmap ── */}
          {activeTab === 'Learning Roadmap' && (
            <div className="space-y-4">
              {/* Role selector */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-bold text-slate-600">Target Role:</span>
                {['Frontend Developer', 'Backend Developer', 'Data Analyst', 'ML / AI Engineer'].map(r => (
                  <button key={r} onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedRole === r ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#2E8B57]/30'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <SectionCard title={`${selectedRole} — 6-Week Roadmap`} icon={BookOpen} badge="AI Generated">
                <div className="space-y-3">
                  {roadmap.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex gap-4 items-start">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-gradient-to-br from-[#2E8B57] to-[#1F7A6B] text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                          W{item.week}
                        </div>
                        {i < roadmap.length - 1 && <div className="w-0.5 h-6 bg-slate-100 mt-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-bold text-slate-900 text-sm">{item.topic}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.resources.map((r, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{r}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => {
                    const text = roadmap.map(w => `Week ${w.week}: ${w.topic}\nResources: ${w.resources.join(', ')}`).join('\n\n');
                    const blob = new Blob([`${selectedRole} Learning Roadmap\n\n${text}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'roadmap.txt'; a.click();
                  }} className="flex items-center gap-2 text-sm font-bold text-[#2E8B57] hover:underline">
                    <Download className="w-4 h-4" /> Download Checklist
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── Interview Prep ── */}
          {activeTab === 'Interview Prep' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-bold text-slate-600">Role:</span>
                {['Frontend Developer', 'Backend Developer', 'Data Analyst', 'ML / AI Engineer'].map(r => (
                  <button key={r} onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${selectedRole === r ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#2E8B57]/30'}`}>
                    {r}
                  </button>
                ))}
              </div>

              {[
                { key: 'technical', label: '⚙️ Technical Questions', count: questions.technical?.length },
                { key: 'hr', label: '🤝 HR Questions', count: questions.hr?.length },
                { key: 'scenario', label: '🎯 Scenario Questions', count: questions.scenario?.length },
              ].map(({ key, label, count }) => (
                <SectionCard key={key} title={`${label} (${count})`} icon={Mic2}>
                  <div className="space-y-2">
                    {(questions[key] || []).map((item, i) => {
                      const qId = `${key}-${i}`;
                      return (
                        <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                          <button onClick={() => setExpandedQ(expandedQ === qId ? null : qId)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
                            <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                            {expandedQ === qId ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                          </button>
                          <AnimatePresence>
                            {expandedQ === qId && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="px-4 pb-4 flex items-start gap-2.5">
                                  <Sparkles className="w-4 h-4 text-[#2E8B57] flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-slate-600 font-medium"><span className="font-bold text-[#2E8B57]">Tip: </span>{item.tip}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              ))}
            </div>
          )}

          {/* ── My Insights ── */}
          {activeTab === 'My Insights' && (
            <div className="space-y-4">
              <SectionCard title="AI Insights — Your Activity" icon={TrendingUp} badge="Personalized">
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Apply to more jobs and complete your profile to unlock insights.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights.map((ins, i) => {
                      const cfg = INSIGHT_STYLE[ins.type] || INSIGHT_STYLE.info;
                      const Icon = cfg.icon;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0 mt-0.5`} />
                          <p className="text-sm font-medium text-slate-800">{ins.text}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Quick Stats */}
              <SectionCard title="Profile Snapshot" icon={User}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Skills Added', value: (student.skills || []).length, color: 'text-[#2E8B57]' },
                    { label: 'Projects', value: (student.projects || []).length, color: 'text-blue-600' },
                    { label: 'Experience', value: (student.experience || []).length, color: 'text-purple-600' },
                    { label: 'Hackathons', value: (student.hackathons || []).length, color: 'text-[#D4A017]' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className={`text-3xl font-black ${color}`}>{value}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
