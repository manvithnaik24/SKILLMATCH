import { useState } from 'react';
import { motion } from 'framer-motion';

export default function JobPostForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('Internship');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('Remote');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = skillsRequired
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const newJob = {
      title,
      jobType,
      description,
      skillsRequired: skillsArray,
      experienceLevel,
      salary,
      location,
      workMode,
      deadline,
      status: 'Open'
    };

    if (onSubmit) {
      onSubmit(newJob);
    }

    // Reset form
    setTitle('');
    setJobType('Internship');
    setDescription('');
    setSkillsRequired('');
    setExperienceLevel('Beginner');
    setSalary('');
    setLocation('');
    setWorkMode('Remote');
    setDeadline('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#2E8B57]/10 focus:border-[#2E8B57] focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Post a New Job</h2>
      </div>
      <motion.form 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit} 
        className="p-6 space-y-5 flex-1 overflow-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div variants={itemVariants} className="md:col-span-2">
            <label className={labelClass}>Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className={inputClass}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={labelClass}>Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className={inputClass}
            >
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={labelClass}>Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className={inputClass}
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <label className={labelClass}>Job Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className={labelClass}>Skills Required (comma-separated)</label>
          <input
            type="text"
            required
            value={skillsRequired}
            onChange={(e) => setSkillsRequired(e.target.value)}
            placeholder="e.g. React, TailwindCSS, TypeScript"
            className={inputClass}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div variants={itemVariants}>
            <label className={labelClass}>Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className={inputClass}
            >
              <option value="Beginner">Beginner (0-1 yrs)</option>
              <option value="Intermediate">Intermediate (1-3 yrs)</option>
              <option value="Expert">Expert (3+ yrs)</option>
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={labelClass}>Salary / Stipend</label>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $2k/mo or Unpaid"
              className={inputClass}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className={inputClass}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className={labelClass}>Application Deadline</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-gradient-to-r from-[#2E8B57] to-[#1F7A6B] text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all shadow-md border-transparent"
          >
            Create Job Post
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}
