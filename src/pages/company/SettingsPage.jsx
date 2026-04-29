import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Mail, Phone, FileText, Shield, Palette, Trash2, Save, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = ['Company Profile', 'Hiring Preferences', 'Security', 'Delete Account'];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('Company Profile');

  // Company Profile State
  const [profile, setProfile] = useState({ companyName: '', industry: '', website: '', email: '', phone: '', about: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Hiring Preferences
  const [prefs, setPrefs] = useState({ autoShortlist: false, emailNotifications: true, publicProfile: true });

  // Security
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          companyName: data.companyName || data.name || '',
          industry: data.industry || '',
          website: data.website || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          about: data.about || '',
        });
        setPrefs({
          autoShortlist: data.autoShortlist ?? false,
          emailNotifications: data.emailNotifications ?? true,
          publicProfile: data.publicProfile ?? true,
        });
      }
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { ...profile, ...prefs }, { merge: true });
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password') toast.error('Current password is incorrect.');
      else toast.error('Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      toast.success('Password reset email sent!');
    } catch {
      toast.error('Failed to send reset email.');
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#2E8B57]/10 focus:border-[#2E8B57] focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your company profile, preferences, and security.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-52 flex-shrink-0">
          <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1">
            {SECTIONS.map((s) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === s
                    ? s === 'Delete Account' ? 'bg-red-50 text-red-600' : 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm'
                    : s === 'Delete Account' ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                {s}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}>

              {activeSection === 'Company Profile' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Profile</h2>
                  </div>
                  <div className="p-7 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Company Name</label>
                        <input type="text" className={inputClass} value={profile.companyName} onChange={e => setProfile(p => ({ ...p, companyName: e.target.value }))} placeholder="e.g. Acme Corp" />
                      </div>
                      <div>
                        <label className={labelClass}>Industry</label>
                        <select className={inputClass} value={profile.industry} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))}>
                          <option value="">Select industry...</option>
                          {['Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Other'].map(i => <option key={i}>{i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}><Globe className="w-3.5 h-3.5 inline mr-1" />Website</label>
                        <input type="url" className={inputClass} value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yourcompany.com" />
                      </div>
                      <div>
                        <label className={labelClass}><Mail className="w-3.5 h-3.5 inline mr-1" />Contact Email</label>
                        <input type="email" className={inputClass} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}><Phone className="w-3.5 h-3.5 inline mr-1" />Phone</label>
                        <input type="tel" className={inputClass} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 123 4567" />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}><FileText className="w-3.5 h-3.5 inline mr-1" />About Company</label>
                        <textarea rows={4} className={`${inputClass} resize-none`} value={profile.about} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} placeholder="Tell candidates about your company, culture, and mission..." />
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSaveProfile} disabled={isSavingProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                      <Save className="w-4 h-4" />
                      {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </motion.button>
                  </div>
                </div>
              )}

              {activeSection === 'Hiring Preferences' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Hiring Preferences</h2>
                  </div>
                  <div className="p-7 space-y-4">
                    {[
                      { key: 'autoShortlist', label: 'Auto-Shortlist High Match Candidates', desc: 'Automatically move candidates with 80%+ match score to shortlisted status.' },
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email alerts for new applicants, deadlines, and platform updates.' },
                      { key: 'publicProfile', label: 'Public Company Profile', desc: 'Allow students to discover and view your company profile on SkillMatch.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{label}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{desc}</p>
                        </div>
                        <button onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${prefs[key] ? 'bg-[#2E8B57]' : 'bg-slate-200'}`}>
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${prefs[key] ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all">
                      <Save className="w-4 h-4" /> Save Preferences
                    </motion.button>
                  </div>
                </div>
              )}

              {activeSection === 'Security' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Shield className="w-4 h-4" /> Security</h2>
                  </div>
                  <form onSubmit={handleChangePassword} className="p-7 space-y-5">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <div className="relative">
                        <input type={showOld ? 'text' : 'password'} className={`${inputClass} pr-12`} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required placeholder="Enter current password" />
                        <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <input type={showNew ? 'text' : 'password'} className={`${inputClass} pr-12`} value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min 6 characters" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        type="submit" disabled={isChangingPassword}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                        <Shield className="w-4 h-4" />
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </motion.button>
                      <button type="button" onClick={handleForgotPassword}
                        className="text-sm font-semibold text-[#2E8B57] hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'Delete Account' && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-red-100 bg-red-50/30">
                    <h2 className="text-base font-bold text-red-700 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Account</h2>
                  </div>
                  <div className="p-7 space-y-5">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700">This action is permanent and cannot be undone.</p>
                        <p className="text-sm text-red-600 mt-0.5">All your job postings, applicant data, and company profile will be permanently deleted.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Type <span className="text-red-600 font-bold">DELETE</span> to confirm
                      </label>
                      <input type="text" className={inputClass} value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE to confirm" />
                    </div>
                    <motion.button
                      whileHover={deleteConfirm === 'DELETE' ? { scale: 1.02 } : {}}
                      whileTap={deleteConfirm === 'DELETE' ? { scale: 0.97 } : {}}
                      onClick={() => { if (deleteConfirm === 'DELETE') { toast.error('Account deletion requires backend admin access in production.'); } else { toast.error('Type DELETE to confirm.'); } }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${deleteConfirm === 'DELETE' ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </motion.button>
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
