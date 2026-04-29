import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Briefcase, Star, AlertTriangle, Zap, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const FILTERS = ['All', 'Unread', 'Jobs', 'Applications', 'Alerts'];

const TYPE_CONFIG = {
  'job':         { icon: Briefcase, bg: 'bg-[#2E8B57]/10',   color: 'text-[#2E8B57]' },
  'match':       { icon: Star,      bg: 'bg-[#F4C430]/10',   color: 'text-[#D4A017]' },
  'application': { icon: UserCheck, bg: 'bg-blue-50',         color: 'text-blue-600' },
  'alert':       { icon: AlertTriangle, bg: 'bg-red-50',     color: 'text-red-500' },
  'platform':    { icon: Zap,       bg: 'bg-purple-50',       color: 'text-purple-600' },
};

const PRIORITY_BADGE = {
  high:   'bg-red-50 text-red-600 border-red-100',
  medium: 'bg-[#F4C430]/10 text-[#D4A017] border-[#F4C430]/20',
  low:    'bg-slate-100 text-slate-500 border-slate-200',
};

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'studentNotifications'), where('studentId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(data);
      setIsLoading(false);
      if (data.length === 0 && !seeded) {
        setSeeded(true);
        seedDemos();
      }
    }, () => setIsLoading(false));
    return () => unsub();
  }, [user]);

  const seedDemos = async () => {
    const demos = [
      { studentId: user.uid, type: 'match', title: 'New High-Match Job!', message: 'Frontend Intern at Google matches 92% of your skills.', read: false, priority: 'high', createdAt: new Date().toISOString() },
      { studentId: user.uid, type: 'application', title: 'Application Shortlisted!', message: 'Congratulations! You\'ve been shortlisted for the React Developer role at TechCorp.', read: false, priority: 'high', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { studentId: user.uid, type: 'job', title: 'Deadline Approaching', message: 'The application deadline for "AI Research Intern" is in 2 days.', read: false, priority: 'medium', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { studentId: user.uid, type: 'alert', title: 'Complete Your Profile', message: 'Your profile is 60% complete. Add more skills to improve your match score.', read: true, priority: 'low', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { studentId: user.uid, type: 'platform', title: 'SkillMatch AI is here!', message: 'Smart job matching is now live. Update your skills to see your match scores.', read: true, priority: 'low', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ];
    try {
      for (const n of demos) await addDoc(collection(db, 'studentNotifications'), n);
    } catch (e) { console.error(e); }
  };

  const markAsRead = async (id) => {
    try { await updateDoc(doc(db, 'studentNotifications', id), { read: true }); }
    catch { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => updateDoc(doc(db, 'studentNotifications', n.id), { read: true })));
      toast.success('All marked as read!');
    } catch { toast.error('Failed'); }
  };

  const deleteNotif = async (id) => {
    try { await deleteDoc(doc(db, 'studentNotifications', id)); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Jobs') return n.type === 'job' || n.type === 'match';
    if (activeFilter === 'Applications') return n.type === 'application';
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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6" /> Notifications
            {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Stay updated on jobs, applications, and alerts.</p>
        </div>
        {unreadCount > 0 && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-[#2E8B57]/10 text-[#2E8B57] text-sm font-bold rounded-xl hover:bg-[#2E8B57]/20 border border-[#2E8B57]/20 transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </motion.button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex flex-wrap gap-1 w-fit">
        {FILTERS.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${activeFilter === f ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
            {f}
          </motion.button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
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
          <Bell className="w-12 h-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">All caught up!</h3>
          <p className="text-sm text-slate-400">No notifications in this category.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG['platform'];
              const Icon = cfg.icon;
              return (
                <motion.div key={notif.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 transition-all ${!notif.read ? 'border-[#2E8B57]/20 ring-1 ring-[#2E8B57]/10' : 'border-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                      {!notif.read && <span className="w-2 h-2 bg-[#2E8B57] rounded-full flex-shrink-0" />}
                      {notif.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${PRIORITY_BADGE[notif.priority] || PRIORITY_BADGE.low}`}>
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
                    <button onClick={() => deleteNotif(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
