import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, UserPlus, Briefcase, AlertTriangle, Zap, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const FILTERS = ['All', 'Unread', 'Applicants', 'Jobs', 'Alerts'];

const TYPE_ICONS = {
  'applicant': <UserPlus className="w-5 h-5 text-[#2E8B57]" />,
  'job': <Briefcase className="w-5 h-5 text-blue-500" />,
  'alert': <AlertTriangle className="w-5 h-5 text-[#F4C430]" />,
  'platform': <Zap className="w-5 h-5 text-purple-500" />,
};

const TYPE_BG = {
  'applicant': 'bg-[#2E8B57]/10',
  'job': 'bg-blue-50',
  'alert': 'bg-[#F4C430]/10',
  'platform': 'bg-purple-50',
};

const PRIORITY_BADGE = {
  'high': 'bg-red-50 text-red-600 border-red-100',
  'medium': 'bg-[#F4C430]/10 text-[#D4A017] border-[#F4C430]/20',
  'low': 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    // No orderBy to avoid composite index requirement — sort client-side
    const q = query(
      collection(db, 'notifications'),
      where('companyId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side by createdAt descending
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(data);
      setIsLoading(false);
      // Auto-seed demo notifications if none exist
      if (data.length === 0 && !seeded) {
        setSeeded(true);
        seedDemoNotifications();
      }
    }, (err) => {
      console.error('Notifications error:', err);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const seedDemoNotifications = async () => {
    if (!user) return;
    const demos = [
      { companyId: user.uid, type: 'applicant', title: 'New High-Match Applicant!', message: 'A candidate with 92% match score just applied for your Frontend Intern role.', read: false, priority: 'high', createdAt: new Date().toISOString() },
      { companyId: user.uid, type: 'job', title: 'Job Deadline Approaching', message: 'Your "AI Intern" posting closes in 3 days. You have 5 unreviewed applicants.', read: false, priority: 'medium', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { companyId: user.uid, type: 'platform', title: 'New Feature: Smart Analytics', message: 'SkillMatch now provides AI-powered placement analytics. Check your dashboard!', read: true, priority: 'low', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { companyId: user.uid, type: 'alert', title: 'Job Has No Applicants', message: 'Your "Data Analyst" posting has been live for 7 days with 0 applicants. Consider updating the requirements.', read: false, priority: 'medium', createdAt: new Date(Date.now() - 7200000).toISOString() },
    ];
    try {
      for (const n of demos) {
        await addDoc(collection(db, 'notifications'), n);
      }
    } catch (e) { console.error('Seed error', e); }
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch { toast.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
      toast.success('All notifications marked as read!');
    } catch { toast.error('Failed to update notifications'); }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch { toast.error('Failed to delete notification'); }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Applicants') return n.type === 'applicant';
    if (activeFilter === 'Jobs') return n.type === 'job';
    if (activeFilter === 'Alerts') return n.type === 'alert' || n.type === 'platform';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Stay updated on applicants, jobs, and platform alerts.</p>
        </div>
        {unreadCount > 0 && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-xl hover:bg-[#2E8B57]/20 border border-[#2E8B57]/20 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </motion.button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1 w-fit">
        {FILTERS.map(f => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${activeFilter === f ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">All caught up!</h3>
          <p className="text-sm text-slate-400">No notifications in this category.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 transition-all ${!notif.read ? 'border-[#2E8B57]/20 ring-1 ring-[#2E8B57]/10' : 'border-slate-100'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_BG[notif.type] || 'bg-slate-50'}`}>
                  {TYPE_ICONS[notif.type] || <Bell className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                    {!notif.read && <span className="w-2 h-2 bg-[#2E8B57] rounded-full flex-shrink-0" />}
                    {notif.priority && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGE[notif.priority] || PRIORITY_BADGE['low']}`}>
                        {notif.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1.5">{timeAgo(notif.createdAt)}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!notif.read && (
                    <button onClick={() => markAsRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-[#2E8B57] hover:bg-[#2E8B57]/10 rounded-lg transition-colors" title="Mark as read">
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
