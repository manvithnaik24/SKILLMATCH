import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Globe, ExternalLink, Link2, Plus, X, Save, Briefcase,
  GraduationCap, Trophy, Code, FileText, MapPin, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = ['Personal Info', 'Skills', 'Experience', 'Projects', 'Hackathons', 'Links'];

const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#2E8B57]/10 focus:border-[#2E8B57] focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400";
const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('Personal Info');
  const [isSaving, setIsSaving] = useState(false);

  const [info, setInfo] = useState({ name: '', college: '', degree: '', gradYear: '', location: '', phone: '' });
  const [links, setLinks] = useState({ github: '', linkedin: '', portfolio: '', resumeUrl: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setInfo({ name: d.name || '', college: d.college || '', degree: d.degree || '', gradYear: d.gradYear || '', location: d.location || '', phone: d.phone || '' });
        setLinks({ github: d.github || '', linkedin: d.linkedin || '', portfolio: d.portfolio || '', resumeUrl: d.resumeUrl || '' });
        setSkills(d.skills || []);
        setExperience(d.experience || []);
        setProjects(d.projects || []);
        setHackathons(d.hackathons || []);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...info, ...links, skills, experience, projects, hackathons,
        uid: user.uid, email: user.email, role: 'student',
      }, { merge: true });
      toast.success('Profile saved successfully!');
    } catch { toast.error('Failed to save profile.'); }
    finally { setIsSaving(false); }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(''); }
  };

  const addItem = (setter, getter, template) => setter([...getter, template]);
  const removeItem = (setter, getter, idx) => setter(getter.filter((_, i) => i !== idx));
  const updateItem = (setter, getter, idx, key, val) => {
    const copy = [...getter];
    copy[idx] = { ...copy[idx], [key]: val };
    setter(copy);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Complete your profile to improve your match score.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeSection === s ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                {s}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.15 }}>

              {activeSection === 'Personal Info' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { key: 'name', label: 'Full Name', icon: User, placeholder: 'Your full name' },
                      { key: 'college', label: 'College / University', icon: GraduationCap, placeholder: 'e.g. MIT' },
                      { key: 'degree', label: 'Degree', icon: GraduationCap, placeholder: 'e.g. B.Tech Computer Science' },
                      { key: 'gradYear', label: 'Graduation Year', icon: GraduationCap, placeholder: 'e.g. 2026' },
                      { key: 'location', label: 'Location', icon: MapPin, placeholder: 'e.g. Bangalore, India' },
                      { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+91 9876543210' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className={labelClass}>{label}</label>
                        <input type="text" className={inputClass} placeholder={placeholder}
                          value={info[key]} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'Skills' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Code className="w-4 h-4" /> Skills</h2>
                  <div className="flex gap-2">
                    <input type="text" className={inputClass} placeholder="Add a skill and press Enter..."
                      value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()} />
                    <button onClick={addSkill} className="flex-shrink-0 px-4 py-3 bg-[#2E8B57] text-white rounded-xl font-bold text-sm hover:bg-[#1F7A6B] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-full border border-[#2E8B57]/20">
                        {skill}
                        <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && <p className="text-sm text-slate-400">No skills added yet.</p>}
                  </div>
                </div>
              )}

              {activeSection === 'Experience' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Experience</h2>
                    <button onClick={() => addItem(setExperience, experience, { role: '', company: '', duration: '', description: '' })}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-xl hover:bg-[#2E8B57]/20 transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {experience.map((exp, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative">
                        <button onClick={() => removeItem(setExperience, experience, i)}
                          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelClass}>Role / Title</label>
                            <input className={inputClass} placeholder="e.g. Frontend Intern" value={exp.role}
                              onChange={e => updateItem(setExperience, experience, i, 'role', e.target.value)} /></div>
                          <div><label className={labelClass}>Company</label>
                            <input className={inputClass} placeholder="Company name" value={exp.company}
                              onChange={e => updateItem(setExperience, experience, i, 'company', e.target.value)} /></div>
                        </div>
                        <div><label className={labelClass}>Duration</label>
                          <input className={inputClass} placeholder="e.g. Jun 2024 – Aug 2024" value={exp.duration}
                            onChange={e => updateItem(setExperience, experience, i, 'duration', e.target.value)} /></div>
                        <div><label className={labelClass}>Description</label>
                          <textarea rows={2} className={`${inputClass} resize-none`} placeholder="What did you do?"
                            value={exp.description} onChange={e => updateItem(setExperience, experience, i, 'description', e.target.value)} /></div>
                      </div>
                    ))}
                    {experience.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No experience added yet.</p>}
                  </div>
                </div>
              )}

              {activeSection === 'Projects' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Code className="w-4 h-4" /> Projects</h2>
                    <button onClick={() => addItem(setProjects, projects, { title: '', tech: '', description: '', github: '' })}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-xl hover:bg-[#2E8B57]/20 transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {projects.map((proj, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative">
                        <button onClick={() => removeItem(setProjects, projects, i)}
                          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelClass}>Project Title</label>
                            <input className={inputClass} placeholder="e.g. SkillMatch AI" value={proj.title}
                              onChange={e => updateItem(setProjects, projects, i, 'title', e.target.value)} /></div>
                          <div><label className={labelClass}>Tech Stack</label>
                            <input className={inputClass} placeholder="e.g. React, Firebase" value={proj.tech}
                              onChange={e => updateItem(setProjects, projects, i, 'tech', e.target.value)} /></div>
                        </div>
                        <div><label className={labelClass}>Description</label>
                          <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Brief description of the project..."
                            value={proj.description} onChange={e => updateItem(setProjects, projects, i, 'description', e.target.value)} /></div>
                        <div><label className={labelClass}>GitHub Link</label>
                          <input className={inputClass} placeholder="https://github.com/..." value={proj.github}
                            onChange={e => updateItem(setProjects, projects, i, 'github', e.target.value)} /></div>
                      </div>
                    ))}
                    {projects.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No projects added yet.</p>}
                  </div>
                </div>
              )}

              {activeSection === 'Hackathons' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Trophy className="w-4 h-4" /> Hackathons</h2>
                    <button onClick={() => addItem(setHackathons, hackathons, { name: '', year: '', rank: '', project: '' })}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-xl hover:bg-[#2E8B57]/20 transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {hackathons.map((h, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative">
                        <button onClick={() => removeItem(setHackathons, hackathons, i)}
                          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelClass}>Event Name</label>
                            <input className={inputClass} placeholder="e.g. HackIndia 2024" value={h.name}
                              onChange={e => updateItem(setHackathons, hackathons, i, 'name', e.target.value)} /></div>
                          <div><label className={labelClass}>Year</label>
                            <input className={inputClass} placeholder="2024" value={h.year}
                              onChange={e => updateItem(setHackathons, hackathons, i, 'year', e.target.value)} /></div>
                          <div><label className={labelClass}>Rank / Position</label>
                            <input className={inputClass} placeholder="e.g. 1st Place" value={h.rank}
                              onChange={e => updateItem(setHackathons, hackathons, i, 'rank', e.target.value)} /></div>
                          <div><label className={labelClass}>Project Built</label>
                            <input className={inputClass} placeholder="e.g. AI Resume Parser" value={h.project}
                              onChange={e => updateItem(setHackathons, hackathons, i, 'project', e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                    {hackathons.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No hackathons added yet.</p>}
                  </div>
                </div>
              )}

              {activeSection === 'Links' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Globe className="w-4 h-4" /> Links & Resume</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/username', icon: Github },
                      { key: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/username', icon: Linkedin },
                      { key: 'portfolio', label: 'Portfolio / Website', placeholder: 'https://yoursite.com', icon: Globe },
                      { key: 'resumeUrl', label: 'Resume Link (Google Drive / Notion)', placeholder: 'https://drive.google.com/...', icon: FileText },
                    ].map(({ key, label, placeholder, icon: Icon }) => (
                      <div key={key}>
                        <label className={labelClass}><Icon className="w-3.5 h-3.5 inline mr-1" />{label}</label>
                        <input type="url" className={inputClass} placeholder={placeholder}
                          value={links[key]} onChange={e => setLinks(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
