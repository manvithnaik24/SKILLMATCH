import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Link as LinkIcon, Code, X, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setResumeLink(user.resumeLink || '');
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        resumeLink,
        skills
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Profile</h2>
          <p className="text-slate-500 mt-1">Manage your personal information and skills.</p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Basic Information</h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User size={16} className="text-slate-400" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-[#2E8B57] focus:ring-[#2E8B57] outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={user.email || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 px-4 py-2.5 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <LinkIcon size={16} className="text-slate-400" /> Resume / Portfolio Link
              </label>
              <input 
                type="url" 
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                placeholder="https://"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-[#2E8B57] focus:ring-[#2E8B57] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Your Skills</h3>
            
            <div className="space-y-4">
              <form onSubmit={handleAddSkill} className="flex gap-3">
                <div className="relative flex-1">
                  <Code size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g. React, Python, UI Design)"
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 focus:border-[#2E8B57] focus:ring-[#2E8B57] outline-none transition-colors"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newSkill.trim()}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Plus size={18} /> Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No skills added yet.</p>
                ) : (
                  skills.map((skill, index) => (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={index}
                      className="px-3 py-1.5 bg-[#2E8B57]/10 text-[#2E8B57] rounded-full text-sm font-semibold flex items-center gap-2 border border-[#2E8B57]/20"
                    >
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="p-0.5 hover:bg-[#2E8B57]/20 rounded-full transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#2E8B57] hover:bg-[#1F7A6B] text-white font-bold rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-sm disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
