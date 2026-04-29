import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import JobPostForm from '../components/company/JobPostForm';
import JobList from '../components/company/JobList';
import ApplicantList from '../components/company/ApplicantList';

// Fallback animated counter component
function AnimatedNumber({ end, duration = 2, isDec = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const current = Math.min((progress / (duration * 1000)) * end, end);
      setCount(current);

      if (progress < duration * 1000) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{isDec ? count.toFixed(1) : Math.round(count)}</span>;
}

export default function CompanyDashboard() {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch Jobs
    const qJobs = query(collection(db, 'jobs'), where('companyId', '==', user.uid));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(fetchedJobs);
      
      if (fetchedJobs.length > 0) {
        // If no job is selected or the selected job was deleted, select the first one
        setSelectedJobId(prev => {
          if (!prev || !fetchedJobs.find(j => j.id === prev)) {
            return fetchedJobs[0].id;
          }
          return prev;
        });
      } else {
        setSelectedJobId(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setIsLoading(false);
    });

    // Fetch Applications
    const qApps = query(collection(db, 'applications'), where('companyId', '==', user.uid));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      const fetchedApps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(fetchedApps);
    }, (error) => {
      console.error("Error fetching applications:", error);
    });

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [user]);

  const handleCreateJob = async (newJob) => {
    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJob,
        companyId: user.uid,
        companyName: user.name || 'Company',
        createdAt: new Date().toISOString()
      });
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error('Failed to post job.');
    }
  };

  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus
      });
      toast.success(`Applicant marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        toast.success("Job posting deleted successfully!");
        if (selectedJobId === jobId) {
          setSelectedJobId(null);
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job.");
      }
    }
  };

  // Filter applications to only those matching the selected job
  const selectedJobApplications = applications.filter(app => app.jobId === selectedJobId);

  // Format for display
  const displayApplicants = selectedJobApplications.map(app => {
    const job = jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      role: job ? job.title : 'Unknown Role'
    };
  });

  // Derived stats (across all company applications)
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const avgMatchScore = applications.length > 0 
    ? Math.round(applications.reduce((acc, a) => acc + (a.matchScore || 0), 0) / applications.length)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Active Jobs', value: jobs.length, icon: FileText, color: 'text-[#2E8B57]', bg: 'bg-[#2E8B57]/10' },
          { label: 'Total Applicants', value: applications.length, icon: Users, color: 'text-white', bg: 'bg-white/20', isGradient: 'bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white shadow-md shadow-[#2E8B57]/20 border-transparent' },
          { label: 'Shortlisted', value: shortlistedCount, icon: CheckCircle, color: 'text-[#1A1A1A]', bg: 'bg-black/10', isGradient: 'bg-gradient-to-tr from-[#FFD166] to-[#F4C430] text-[#1A1A1A] shadow-md shadow-[#F4C430]/20 border-transparent' },
          { label: 'Avg Match %', value: avgMatchScore, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', isPercent: true },
        ].map((stat, i) => (
          <motion.div 
            variants={itemVariants} 
            key={i} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`p-6 rounded-2xl border ${stat.isGradient ? stat.isGradient : 'bg-white border-slate-200 shadow-sm'} flex items-center gap-5 cursor-pointer`}
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold mb-1 ${stat.isGradient ? 'opacity-90' : 'text-slate-500'}`}>{stat.label}</p>
              {isLoading ? (
                <div className={`h-10 w-20 rounded animate-pulse ${stat.isGradient ? 'bg-black/10' : 'bg-slate-200'}`}></div>
              ) : (
                <p className="text-4xl font-bold tracking-tight">
                  <AnimatedNumber end={stat.value} duration={2} isDec={stat.isDec} />
                  {stat.isPercent && '%'}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Post Form & Active Jobs */}
        <div className="flex flex-col gap-6">
          <JobPostForm onSubmit={handleCreateJob} />
          <div className="h-[400px]">
             <JobList 
               jobs={jobs} 
               selectedJobId={selectedJobId} 
               onSelectJob={setSelectedJobId} 
               onDeleteJob={handleDeleteJob}
               isLoading={isLoading}
             />
          </div>
        </div>

        {/* Right Column: Applicant Tracking */}
        <div className="lg:col-span-2 h-[800px]">
          <ApplicantList 
            applicants={displayApplicants} 
            onUpdateStatus={handleUpdateApplicantStatus} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
