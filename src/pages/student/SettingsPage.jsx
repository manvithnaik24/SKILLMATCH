import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, Palette, Trash2, Save, Eye, EyeOff, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = ['Account', 'Security', 'Preferences', 'Appearance', 'Danger Zone'];
const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#2E8B57]/10 focus:border-[#2E8B57] focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400";
const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

export default function StudentSettingsPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('Account');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const [prefs, setPrefs] = useState({ emailAlerts: true, jobNotifications: true, applicationUpdates: true });
  const [theme, setTheme] = useState('light');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setPrefs({ emailAlerts: d.emailAlerts ?? true, jobNotifications: d.jobNotifications ?? true, applicationUpdates: d.applicationUpdates ?? true });
        setTheme(d.theme || 'light');
        setName(d.name || '');
        setEmail(d.email || '');
      }
    };
    load();
  }, [user]);

  const handleSaveAccount = async () => {
    setIsSavingAccount(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { name, email }, { merge: true });
      toast.success('Account updated!');
    } catch { toast.error('Failed to save'); }
    finally { setIsSavingAccount(false); }
  };

  const handleSavePrefs = async () => {
    try {
      await setDoc(doc(db, 'users', user.uid), { ...prefs, theme }, { merge: true });
      toast.success('Preferences saved!');
    } catch { toast.error('Failed to save'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setIsChangingPw(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password changed successfully!');
      setOldPassword(''); setNewPassword('');
    } catch (err) {
      if (err.code === 'auth/wrong-password') toast.error('Current password is incorrect');
      else toast.error('Failed to change password');
    } finally { setIsChangingPw(false); }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      toast.success('Password reset email sent!');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your account, security, and preferences.</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === s
                    ? s === 'Danger Zone' ? 'bg-red-50 text-red-600' : 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm'
                    : s === 'Danger Zone' ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.15 }}>

              {activeSection === 'Account' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><User className="w-4 h-4" /> Account Details</h2>
                  </div>
                  <div className="p-7 space-y-5">
                    <div><label className={labelClass}>Full Name</label>
                      <input type="text" className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" /></div>
                    <div><label className={labelClass}><Mail className="w-3.5 h-3.5 inline mr-1" />Email Address</label>
                      <input type="email" className={`${inputClass} opacity-70`} value={email} readOnly placeholder="Email (managed by Firebase Auth)" /></div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSaveAccount} disabled={isSavingAccount}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                      <Save className="w-4 h-4" />
                      {isSavingAccount ? 'Saving...' : 'Save Changes'}
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
                        <input type={showOld ? 'text' : 'password'} className={`${inputClass} pr-12`} value={oldPassword}
                          onChange={e => setOldPassword(e.target.value)} required placeholder="Enter current password" />
                        <button type="button" onClick={() => setShowOld(!showOld)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <div className="relative">
                        <input type={showNew ? 'text' : 'password'} className={`${inputClass} pr-12`} value={newPassword}
                          onChange={e => setNewPassword(e.target.value)} required placeholder="Min 6 characters" />
                        <button type="button" onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        type="submit" disabled={isChangingPw}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                        <Shield className="w-4 h-4" />
                        {isChangingPw ? 'Changing...' : 'Change Password'}
                      </motion.button>
                      <button type="button" onClick={handleForgotPassword} className="text-sm font-semibold text-[#2E8B57] hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'Preferences' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Preferences</h2>
                  </div>
                  <div className="p-7 space-y-4">
                    {[
                      { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive job match and application updates via email.' },
                      { key: 'jobNotifications', label: 'New Job Notifications', desc: 'Get notified when new jobs match your skill profile.' },
                      { key: 'applicationUpdates', label: 'Application Status Updates', desc: 'Get alerts when your application status changes.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 gap-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{label}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
                        </div>
                        <button onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${prefs[key] ? 'bg-[#2E8B57]' : 'bg-slate-200'}`}>
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${prefs[key] ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSavePrefs}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all">
                      <Save className="w-4 h-4" /> Save Preferences
                    </motion.button>
                  </div>
                </div>
              )}

              {activeSection === 'Appearance' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance</h2>
                  </div>
                  <div className="p-7 space-y-4">
                    <p className="text-sm text-slate-500 font-medium">Choose your preferred display theme.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'light', label: 'Light Mode', bg: 'bg-white border-slate-200', preview: '☀️' },
                        { value: 'dark', label: 'Dark Mode', bg: 'bg-slate-800 border-slate-700', preview: '🌙' },
                      ].map(({ value, label, bg, preview }) => (
                        <button key={value} onClick={() => setTheme(value)}
                          className={`p-6 rounded-2xl border-2 text-center transition-all ${theme === value ? 'border-[#2E8B57] ring-4 ring-[#2E8B57]/10' : 'border-slate-100 hover:border-slate-200'} ${bg}`}>
                          <div className="text-3xl mb-3">{preview}</div>
                          <p className={`text-sm font-bold ${value === 'dark' ? 'text-white' : 'text-slate-800'}`}>{label}</p>
                          {theme === value && <div className="mt-2 flex items-center justify-center gap-1 text-xs text-[#2E8B57] font-bold"><CheckCircle className="w-3.5 h-3.5" /> Active</div>}
                        </button>
                      ))}
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleSavePrefs}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all">
                      <Save className="w-4 h-4" /> Save Theme
                    </motion.button>
                  </div>
                </div>
              )}

              {activeSection === 'Danger Zone' && (
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm">
                  <div className="px-7 py-5 border-b border-red-100 bg-red-50/30">
                    <h2 className="text-base font-bold text-red-700 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</h2>
                  </div>
                  <div className="p-7 space-y-5">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700">This action is permanent and cannot be undone.</p>
                        <p className="text-sm text-red-600 mt-0.5">Your profile, applications, and saved jobs will be permanently deleted.</p>
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
                      onClick={() => deleteConfirm === 'DELETE' ? toast.error('Account deletion requires admin access in production.') : toast.error('Type DELETE to confirm.')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${deleteConfirm === 'DELETE' ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                      <Trash2 className="w-4 h-4" /> Delete My Account
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
