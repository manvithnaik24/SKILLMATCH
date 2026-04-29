// ─── SkillMatch AI Engine ─────────────────────────────────────────────────────
// Client-side rule-based AI using weighted scoring + heuristics

// ── 1. SMART MATCH SCORE ────────────────────────────────────────────────────
export function calculateMatchScore(student, job) {
  const required = (job.skillsRequired || []).map(s => s.toLowerCase());
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const projects = student.projects || [];
  const hackathons = student.hackathons || [];
  const experience = student.experience || [];

  let score = 0;

  // Skill overlap – 60 pts max
  if (required.length > 0) {
    const matched = required.filter(s => studentSkills.includes(s)).length;
    score += Math.round((matched / required.length) * 60);
  } else {
    score += 40; // no skills required = neutral
  }

  // Project relevance – 15 pts max
  const jobKeywords = [
    ...(job.title || '').toLowerCase().split(/\W+/),
    ...required,
  ];
  const projScore = projects.filter(p =>
    jobKeywords.some(kw => kw.length > 2 &&
      (p.tech || '').toLowerCase().includes(kw) ||
      (p.title || '').toLowerCase().includes(kw))
  ).length;
  score += Math.min(projScore * 5, 15);

  // Experience – 10 pts max
  score += Math.min(experience.length * 5, 10);

  // Hackathons – 5 pts max
  score += Math.min(hackathons.length * 2.5, 5);

  // Profile completeness – 10 pts max
  const fields = [student.name, student.college, student.resumeUrl, student.github, student.linkedin];
  const filled = fields.filter(Boolean).length;
  score += Math.round((filled / fields.length) * 10);

  return Math.min(Math.round(score), 100);
}

export function getMatchLabel(score) {
  if (score >= 95) return { label: 'Perfect Fit',         color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 80) return { label: 'Strong Match',        color: 'text-[#2E8B57]',   bg: 'bg-[#2E8B57]/10 border-[#2E8B57]/20' };
  if (score >= 60) return { label: 'Good Match',          color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' };
  if (score >= 40) return { label: 'Partial Match',       color: 'text-[#D4A017]',   bg: 'bg-[#F4C430]/10 border-[#F4C430]/30' };
  return              { label: 'Upskill Recommended',  color: 'text-red-600',     bg: 'bg-red-50 border-red-200' };
}

export function getMatchExplanation(student, job) {
  const required = (job.skillsRequired || []).map(s => s.toLowerCase());
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const matched = required.filter(s => studentSkills.includes(s));
  const missing = required.filter(s => !studentSkills.includes(s));
  const parts = [];
  if (matched.length > 0) parts.push(`Matched ${matched.length} skill${matched.length > 1 ? 's' : ''}: ${matched.slice(0, 3).join(', ')}`);
  if ((student.projects || []).length > 0) parts.push(`${student.projects.length} relevant project${student.projects.length > 1 ? 's' : ''}`);
  if ((student.experience || []).length > 0) parts.push(`${student.experience.length} internship/work experience`);
  if (missing.length > 0) parts.push(`Missing: ${missing.slice(0, 2).join(', ')}`);
  return parts.join(' · ') || 'General profile match';
}

// ── 2. SKILL GAP ANALYZER ───────────────────────────────────────────────────
const CRITICAL_SKILLS = ['react','node.js','python','sql','typescript','java','aws','docker','git','mongodb','firebase','javascript','next.js','express'];

export function getSkillGap(student, job) {
  const required = (job.skillsRequired || []).map(s => s.toLowerCase());
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const missing = required.filter(s => !studentSkills.includes(s));
  const critical = missing.filter(s => CRITICAL_SKILLS.includes(s));
  const optional = missing.filter(s => !CRITICAL_SKILLS.includes(s));
  const currentScore = calculateMatchScore(student, job);
  const learnOneScore = Math.min(currentScore + Math.round(60 / Math.max(required.length, 1)), 100);
  return { critical, optional, currentScore, learnOneScore };
}

// ── 3. RESUME SCORER ────────────────────────────────────────────────────────
export function getResumeScore(student) {
  let total = 0;
  const sections = {
    skills:     { score: 0, max: 25, tips: [] },
    projects:   { score: 0, max: 25, tips: [] },
    experience: { score: 0, max: 20, tips: [] },
    links:      { score: 0, max: 15, tips: [] },
    profile:    { score: 0, max: 15, tips: [] },
  };

  // Skills
  const skills = student.skills || [];
  sections.skills.score = Math.min(skills.length * 3, 25);
  if (skills.length < 5) sections.skills.tips.push('Add at least 5 skills to improve visibility');
  if (skills.length >= 8) sections.skills.tips.push('Great skill diversity!');

  // Projects
  const projects = student.projects || [];
  sections.projects.score = Math.min(projects.length * 8, 25);
  if (projects.length === 0) sections.projects.tips.push('Add at least 2 projects with GitHub links');
  else if (projects.filter(p => p.github).length === 0) sections.projects.tips.push('Add GitHub links to your projects');

  // Experience
  const exp = student.experience || [];
  sections.experience.score = Math.min(exp.length * 10, 20);
  if (exp.length === 0) sections.experience.tips.push('Add internship or work experience');

  // Links
  let linkScore = 0;
  if (student.resumeUrl) linkScore += 6;
  if (student.github) linkScore += 5;
  if (student.linkedin) linkScore += 4;
  sections.links.score = Math.min(linkScore, 15);
  if (!student.resumeUrl) sections.links.tips.push('Add a resume link (Google Drive/Notion)');
  if (!student.github) sections.links.tips.push('Add your GitHub profile');
  if (!student.linkedin) sections.links.tips.push('Add your LinkedIn profile');

  // Profile completeness
  const fields = ['name','college','degree','location','gradYear'];
  const filled = fields.filter(f => student[f]).length;
  sections.profile.score = Math.round((filled / fields.length) * 15);
  if (filled < 5) sections.profile.tips.push('Complete your personal info (college, degree, location)');

  total = Object.values(sections).reduce((sum, s) => sum + s.score, 0);
  return { total, sections };
}

// ── 4. CAREER RECOMMENDATIONS ───────────────────────────────────────────────
const CAREER_MAP = [
  { role: 'Frontend Developer',     keywords: ['react','javascript','html','css','vue','angular','next.js','typescript'], confidence: 0 },
  { role: 'Backend Developer',      keywords: ['node.js','express','python','java','spring','django','postgresql','mongodb'], confidence: 0 },
  { role: 'Full Stack Developer',   keywords: ['react','node.js','mongodb','express','javascript','firebase'], confidence: 0 },
  { role: 'Data Analyst',           keywords: ['python','sql','excel','pandas','tableau','power bi','data'], confidence: 0 },
  { role: 'ML / AI Engineer',       keywords: ['python','tensorflow','pytorch','machine learning','numpy','scikit-learn','nlp'], confidence: 0 },
  { role: 'DevOps Engineer',        keywords: ['docker','kubernetes','aws','ci/cd','linux','terraform','jenkins'], confidence: 0 },
  { role: 'UI/UX Designer',         keywords: ['figma','design','ui','ux','wireframe','adobe xd','user research'], confidence: 0 },
  { role: 'Mobile Developer',       keywords: ['flutter','react native','kotlin','swift','android','ios','dart'], confidence: 0 },
  { role: 'Cybersecurity Analyst',  keywords: ['security','networking','linux','ethical hacking','ctf','firewall','python'], confidence: 0 },
  { role: 'Cloud Engineer',         keywords: ['aws','azure','gcp','cloud','terraform','kubernetes','serverless'], confidence: 0 },
];

export function getCareerRecommendations(student) {
  const skills = (student.skills || []).map(s => s.toLowerCase());
  const projText = (student.projects || []).map(p => `${p.title} ${p.tech}`.toLowerCase()).join(' ');
  const all = [...skills, ...projText.split(/\W+/)];

  const scored = CAREER_MAP.map(c => {
    const hits = c.keywords.filter(kw => all.includes(kw)).length;
    return { ...c, confidence: Math.min(Math.round((hits / c.keywords.length) * 100), 98) };
  }).filter(c => c.confidence > 0).sort((a, b) => b.confidence - a.confidence).slice(0, 5);

  return scored.length > 0 ? scored : [{ role: 'General Software Engineer', confidence: 40 }];
}

// ── 5. LEARNING ROADMAP ─────────────────────────────────────────────────────
const ROADMAPS = {
  'Frontend Developer': [
    { week: 1, topic: 'HTML5 & CSS3 Fundamentals', resources: ['MDN Web Docs', 'freeCodeCamp HTML/CSS'] },
    { week: 2, topic: 'JavaScript ES6+ Core Concepts', resources: ['javascript.info', 'Eloquent JavaScript'] },
    { week: 3, topic: 'React.js Basics & Hooks', resources: ['React Official Docs', 'Scrimba React Course'] },
    { week: 4, topic: 'API Integration & State Management', resources: ['Axios Docs', 'Zustand / Redux Toolkit'] },
    { week: 5, topic: 'Build 2 Portfolio Projects', resources: ['GitHub', 'Vercel for deployment'] },
    { week: 6, topic: 'Apply to Jobs & Interview Prep', resources: ['LeetCode Easy', 'Frontend Interview Handbook'] },
  ],
  'Backend Developer': [
    { week: 1, topic: 'Node.js & Express Fundamentals', resources: ['Node.js Docs', 'The Odin Project'] },
    { week: 2, topic: 'Databases: SQL & MongoDB', resources: ['PostgreSQL Tutorial', 'MongoDB University'] },
    { week: 3, topic: 'REST API Design & Authentication', resources: ['REST API Tutorial', 'JWT.io'] },
    { week: 4, topic: 'Cloud Deployment & Docker', resources: ['AWS Free Tier', 'Docker Docs'] },
    { week: 5, topic: 'Build an API-based Project', resources: ['GitHub', 'Render.com Deployment'] },
    { week: 6, topic: 'Apply & Interview Prep', resources: ['LeetCode', 'System Design Primer'] },
  ],
  'Data Analyst': [
    { week: 1, topic: 'Python for Data Analysis', resources: ['Kaggle Python Course', 'Corey Schafer YouTube'] },
    { week: 2, topic: 'SQL & Database Queries', resources: ['Mode SQL Tutorial', 'SQLZoo'] },
    { week: 3, topic: 'Pandas, NumPy & Matplotlib', resources: ['Kaggle Pandas Course', 'Real Python'] },
    { week: 4, topic: 'Data Visualization: Tableau/Power BI', resources: ['Tableau Public', 'Power BI YouTube'] },
    { week: 5, topic: 'End-to-End Analysis Project', resources: ['Kaggle Datasets', 'GitHub'] },
    { week: 6, topic: 'Apply & Portfolio Showcase', resources: ['Kaggle Profile', 'LinkedIn Projects'] },
  ],
  'ML / AI Engineer': [
    { week: 1, topic: 'Python & Math for ML (Linear Algebra, Stats)', resources: ['Khan Academy', '3Blue1Brown'] },
    { week: 2, topic: 'scikit-learn Basics & Supervised Learning', resources: ['scikit-learn Docs', 'Kaggle ML Course'] },
    { week: 3, topic: 'Neural Networks & Deep Learning Intro', resources: ['fast.ai', 'Andrew Ng Coursera'] },
    { week: 4, topic: 'NLP or Computer Vision Specialization', resources: ['Hugging Face', 'OpenCV Docs'] },
    { week: 5, topic: 'Build an ML Project + Kaggle Competition', resources: ['Kaggle', 'Papers With Code'] },
    { week: 6, topic: 'Apply & Publish on GitHub', resources: ['LinkedIn', 'arXiv for inspiration'] },
  ],
};

export function getLearningRoadmap(role) {
  return ROADMAPS[role] || ROADMAPS['Frontend Developer'].map(w => ({
    ...w, topic: `${role}: ${w.topic}`
  }));
}

// ── 6. INTERVIEW QUESTIONS ──────────────────────────────────────────────────
const INTERVIEW_BANK = {
  'Frontend Developer': {
    technical: [
      { q: 'What is the Virtual DOM and how does React use it?', tip: 'Explain diffing algorithm and why it improves performance.' },
      { q: 'What is the difference between useEffect and useLayoutEffect?', tip: 'Focus on when each runs relative to paint.' },
      { q: 'Explain CSS flexbox vs grid — when would you use each?', tip: 'Give a real layout example for each.' },
      { q: 'What are JavaScript closures and where are they useful?', tip: 'Use a practical example like a counter or memoization.' },
      { q: 'How does event delegation work in JavaScript?', tip: 'Explain bubbling and why it improves performance.' },
    ],
    hr: [
      { q: 'Tell me about yourself and your journey into frontend development.', tip: 'Structure: Background → Skills → Goal' },
      { q: 'Describe a challenging project and how you solved a key problem.', tip: 'Use STAR: Situation, Task, Action, Result' },
      { q: 'Where do you see yourself in 2 years?', tip: 'Align with the company\'s domain or tech stack.' },
    ],
    scenario: [
      { q: 'A page loads slowly — walk me through how you would debug and optimize it.', tip: 'Mention Lighthouse, lazy loading, code splitting, CDN.' },
      { q: 'Your component re-renders 20x per second unexpectedly. What do you check?', tip: 'useMemo, useCallback, prop stability, state structure.' },
    ],
  },
  'Data Analyst': {
    technical: [
      { q: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?', tip: 'Use a Venn diagram analogy to explain clearly.' },
      { q: 'How would you handle missing data in a dataset?', tip: 'Discuss imputation, deletion, and when each applies.' },
      { q: 'What is the difference between correlation and causation?', tip: 'Give a classic misleading example.' },
      { q: 'Explain the difference between a bar chart and a histogram.', tip: 'Categorical vs continuous data.' },
      { q: 'What is a p-value and how do you interpret it?', tip: 'Keep it simple: probability the result is due to chance.' },
    ],
    hr: [
      { q: 'Tell me about a time you turned data into a business decision.', tip: 'Quantify the impact if possible.' },
      { q: 'How do you communicate complex findings to non-technical stakeholders?', tip: 'Mention visual storytelling, simplification.' },
      { q: 'Why are you interested in data analytics?', tip: 'Connect to a genuine curiosity or past experience.' },
    ],
    scenario: [
      { q: 'You have a dataset with 30% missing values. What do you do?', tip: 'Analyze missingness pattern first (MCAR, MAR, MNAR).' },
      { q: 'Sales dropped 20% last month. Walk me through how you would investigate.', tip: 'Segment, compare, correlate. Funnel analysis.' },
    ],
  },
};

const DEFAULT_QUESTIONS = {
  technical: [
    { q: 'What programming languages are you most comfortable with?', tip: 'Mention specific projects.' },
    { q: 'Explain your most complex project end-to-end.', tip: 'Use STAR format.' },
    { q: 'How do you stay updated with new technologies?', tip: 'Mention blogs, courses, side projects.' },
    { q: 'What version control tools have you used?', tip: 'Mention Git flow and branching strategies.' },
    { q: 'Explain the concept of APIs and how you have worked with them.', tip: 'Give a real example.' },
  ],
  hr: [
    { q: 'Tell me about yourself.', tip: 'Background → Skills → Ambition (2 mins)' },
    { q: 'Why do you want this internship/job?', tip: 'Research the company — show genuine interest.' },
    { q: 'What is your biggest weakness?', tip: 'Choose a real one with steps you are taking to improve.' },
  ],
  scenario: [
    { q: 'How would you handle a disagreement with a teammate?', tip: 'Focus on communication and compromise.' },
    { q: 'You are given a vague project. How do you start?', tip: 'Ask clarifying questions, define scope.' },
  ],
};

export function getInterviewQuestions(role) {
  return INTERVIEW_BANK[role] || DEFAULT_QUESTIONS;
}

// ── 7. CANDIDATE BADGES ─────────────────────────────────────────────────────
export function getCandidateBadges(candidate) {
  const badges = [];
  const score = candidate.matchScore || 0;
  const exp = (candidate.experience || []).length;
  const proj = (candidate.projects || []).length;
  const hacks = (candidate.hackathons || []).length;

  if (score >= 90) badges.push({ icon: '🥇', label: 'Top Candidate', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' });
  if (exp >= 2) badges.push({ icon: '💼', label: 'Experienced', color: 'bg-blue-50 text-blue-700 border-blue-200' });
  if (hacks >= 2) badges.push({ icon: '🚀', label: 'Fast Learner', color: 'bg-purple-50 text-purple-700 border-purple-200' });
  if (proj >= 3 && exp === 0) badges.push({ icon: '💡', label: 'High Potential', color: 'bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20' });
  if ((candidate.skills || []).length >= 8) badges.push({ icon: '⚡', label: 'Multi-Skilled', color: 'bg-orange-50 text-orange-700 border-orange-200' });

  return badges.slice(0, 3);
}

export function getAISummary(candidate) {
  const name = candidate.studentName || candidate.name || 'This candidate';
  const skills = (candidate.skills || []).slice(0, 3).join(', ') || 'various technologies';
  const exp = (candidate.experience || []).length;
  const proj = (candidate.projects || []).length;
  const hacks = (candidate.hackathons || []).length;
  const score = candidate.matchScore || 0;

  let summary = `${name} is a ${score >= 80 ? 'strong' : score >= 60 ? 'good' : 'developing'} candidate with skills in ${skills}.`;
  if (exp > 0) summary += ` Has ${exp} internship experience.`;
  if (proj > 0) summary += ` Built ${proj} project${proj > 1 ? 's' : ''}.`;
  if (hacks > 0) summary += ` Participated in ${hacks} hackathon${hacks > 1 ? 's' : ''}.`;
  return summary;
}

// ── 8. JOB QUALITY CHECKER ──────────────────────────────────────────────────
export function checkJobQuality(job) {
  const warnings = [];
  if (!job.description || job.description.trim().length < 50) warnings.push('Missing or very short job description');
  if (!job.skillsRequired || job.skillsRequired.length === 0) warnings.push('No skills required listed');
  if (!job.location) warnings.push('No location specified');
  if (!job.deadline) warnings.push('No application deadline set');
  if (!job.salary) warnings.push('Salary/stipend not mentioned');
  return { warnings, quality: warnings.length === 0 ? 'good' : warnings.length <= 2 ? 'fair' : 'poor' };
}

// ── 9. STUDENT ANALYTICS INSIGHTS ───────────────────────────────────────────
export function getStudentInsights(student, applications, allJobs) {
  const insights = [];
  const avgMatch = applications.length > 0
    ? Math.round(applications.reduce((s, a) => s + (a.matchScore || 0), 0) / applications.length) : 0;

  if (avgMatch < 50 && applications.length > 2) {
    insights.push({ type: 'warning', text: 'You tend to apply to low-match jobs. Focus on 70%+ matches for better results.' });
  }
  const resumeScore = getResumeScore(student);
  if (resumeScore.total < 60) {
    insights.push({ type: 'tip', text: `Your profile score is ${resumeScore.total}/100. Complete it to improve visibility.` });
  }
  const recs = getCareerRecommendations(student);
  if (recs.length > 0) {
    insights.push({ type: 'info', text: `Best role fit based on your skills: ${recs[0].role} (${recs[0].confidence}% match)` });
  }
  const shortlisted = applications.filter(a => a.status === 'Shortlisted' || a.status === 'Hired').length;
  if (shortlisted > 0) {
    insights.push({ type: 'success', text: `${shortlisted} application${shortlisted > 1 ? 's' : ''} shortlisted — great work!` });
  }
  return insights;
}
