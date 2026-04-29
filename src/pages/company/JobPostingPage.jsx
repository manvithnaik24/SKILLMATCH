import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import JobPostForm from '../../components/company/JobPostForm';
import JobList from '../../components/company/JobList';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function JobPostingPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Open', 'Closed'

  useEffect(() => {
    if (!user) return;
    const qJobs = query(collection(db, 'jobs'), where('companyId', '==', user.uid));
    const unsubJobs = onSnapshot(qJobs, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(fetchedJobs);
      setIsLoading(false);
    }, (error) => {
      toast.error("Failed to load jobs");
      setIsLoading(false);
    });

    return () => unsubJobs();
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
      toast.error('Failed to post job.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        toast.success("Job posting deleted!");
      } catch (error) {
        toast.error("Failed to delete job.");
      }
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = (currentStatus || 'Open') === 'Open' ? 'Closed' : 'Open';
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
      toast.success(`Job marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const jobStatus = job.status || 'Open';
    const matchesStatus = filterStatus === 'All' || jobStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Postings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your internship and full-time job listings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
        {/* Left Column: Job Post Form */}
        <div className="flex flex-col gap-6 h-full overflow-hidden">
          <JobPostForm onSubmit={handleCreateJob} />
        </div>

        {/* Right Column: Active Jobs */}
        <div className="lg:col-span-2 h-full overflow-hidden flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm">
          {/* Controls */}
          <div className="p-5 border-b border-slate-100 flex gap-4 bg-slate-50/50">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all font-medium placeholder-slate-400 text-slate-800"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-40 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex-1 overflow-auto bg-[#F8F9FB] p-4">
             <JobList 
               jobs={filteredJobs} 
               onDeleteJob={handleDeleteJob}
               onToggleStatus={handleToggleStatus}
               isLoading={isLoading}
               hideHeader={true}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
