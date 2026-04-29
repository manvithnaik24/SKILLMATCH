import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, User, Home, BookOpen, Settings, Search, Bell, Bookmark, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: Home },
    { name: 'Browse Jobs', path: '/student/jobs', icon: Search },
    { name: 'Applications', path: '/student/applications', icon: Briefcase },
    { name: 'Saved Jobs', path: '/student/saved-jobs', icon: Bookmark },
    { name: 'AI Insights', path: '/student/ai-insights', icon: Sparkles },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const companyLinks = [
    { name: 'Dashboard', path: '/company', icon: Home },
    { name: 'Job Postings', path: '/company/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/company/candidates', icon: User },
    { name: 'Notifications', path: '/company/notifications', icon: Bell },
    { name: 'Settings', path: '/company/settings', icon: Settings },
  ];

  const links = user.role === 'student' ? studentLinks : companyLinks;

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-inter text-slate-800">
      {/* Top Navbar */}
      <nav className="bg-white px-8 py-3.5 flex justify-between items-center z-10 sticky top-0 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-14">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E8B57] to-[#1F7A6B] flex items-center justify-center text-white font-bold text-lg shadow-md">
              S
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SkillMatch</span>
          </div>

          {/* Greeting */}
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1">Good morning, {user?.name || 'User'} 👋</h1>
            <p className="text-xs text-slate-500 font-medium">Here's what's happening today.</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <motion.div 
            whileFocus={{ scale: 1.01 }}
            className="hidden lg:flex items-center bg-slate-50 px-4 py-2 rounded-full border border-slate-200 focus-within:border-[#2E8B57] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2E8B57]/10 transition-all w-80"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input 
              type="text" 
              placeholder="Search jobs, candidates..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  toast('Global search coming soon!', { icon: '🔍' });
                  e.target.value = '';
                }
              }}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 font-medium"
            />
          </motion.div>

          <Link to="/notifications">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-slate-50 border border-slate-100 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </motion.button>
          </Link>

          <div className="h-6 w-px bg-slate-200"></div>

          {/* User Profile */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FFD166] to-[#F4C430] flex items-center justify-center text-[#1A1A1A] font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
              {user.role === 'student' ? 'ST' : 'CO'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user?.name || 'User'}</p>
              <p className="text-[11px] font-semibold text-slate-500 capitalize leading-none">{user.role}</p>
            </div>
          </motion.div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden p-6 gap-8">
        {/* Floating Sidebar */}
        <aside className="w-60 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col hidden md:flex h-full overflow-hidden">
          <div className="p-5 flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">
              Main Menu
            </div>
            <ul className="space-y-1">
              {links.map((link, index) => {
                // Exact match for root dashboard links, prefix match for sub-pages
                const isActive = link.path === '/student' || link.path === '/company'
                  ? location.pathname === link.path
                  : location.pathname.startsWith(link.path);
                
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="block relative"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-md shadow-[#2E8B57]/20' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <link.icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        {link.name}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="p-4 border-t border-slate-50">
            <button
              onClick={logout}
              className="w-full relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-slate-500 font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
                Sign Out
              </motion.div>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-transparent h-full pb-10">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
