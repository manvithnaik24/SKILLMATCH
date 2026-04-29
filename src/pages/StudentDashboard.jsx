import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import AnalyticsPanel from '../components/student/AnalyticsPanel';
import JobList from '../components/student/JobList';
import ApplicationTracker from '../components/student/ApplicationTracker';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch All Jobs
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(fetchedJobs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setIsLoading(false);
    });

    // Fetch Student's Applications
    const qApps = query(collection(db, 'applications'), where('studentId', '==', user.uid));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      const fetchedApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApps(fetchedApps);
    });

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [user]);



  const handleApply = async (job, matchScore) => {
    // Prevent duplicate applications locally (also prevented by not showing button, but just in case)
    if (apps.some(app => app.jobId === job.id)) {
      toast.error('You have already applied to this job.');
      return;
    }

    try {
      const newApp = {
        studentId: user.uid,
        studentName: user.name || 'Student',
        jobId: job.id,
        companyId: job.companyId,
        role: job.title,
        company: job.companyName || 'Unknown Company',
        status: 'Applied',
        matchScore: matchScore,
        appliedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'applications'), newApp);
      toast.success('Successfully applied to ' + job.title);
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application.');
    }
  };

  const appliedJobIds = apps.map(app => app.jobId);
  const currentSkills = user?.skills || [];

  return (
    <div className="space-y-8">
      {/* Analytics Panel */}
      <AnalyticsPanel applications={apps} totalJobs={jobs.length} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Jobs Grid */}
        <div className="lg:col-span-2">
          <JobList 
            jobs={jobs}
            userSkills={currentSkills} 
            onApply={handleApply} 
            appliedJobIds={appliedJobIds} 
            isLoading={isLoading}
          />
        </div>

        {/* Application Tracker & Sidebar */}
        <div className="flex flex-col gap-8">
          <div className="h-[400px]">
            <ApplicationTracker applications={apps} isLoading={isLoading} />
          </div>

          {/* Skill Assessments Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Skill Assessments</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-5 border border-slate-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">React Fundamentals</h3>
                  <span className="px-2.5 py-1 bg-[#2E8B57]/10 text-[#2E8B57] rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-1.5 mb-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-[#2E8B57] h-full rounded-full"
                  ></motion.div>
                </div>
                <p className="text-[11px] font-bold text-slate-400 text-right uppercase tracking-wider">Score: 92/100</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-5 border border-slate-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">Advanced JavaScript</h3>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Available</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 mb-4 uppercase tracking-wider">Est. time: 45 mins</p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 bg-slate-900 border-none rounded-lg text-sm font-bold text-white shadow-sm hover:bg-black transition-colors"
                >
                  Start Test
                </motion.button>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
