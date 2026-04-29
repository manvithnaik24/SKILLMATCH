// Data Models for SkillMatch (Mock Database)

// User Model
// - id: string
// - name: string
// - role: 'student' | 'company'
// - skills: string[] (empty for company)
export const mockUsers = [
  {
    id: 'user-student-1',
    name: 'Alice Smith',
    role: 'student',
    skills: ['React', 'JavaScript', 'Tailwind', 'HTML', 'CSS', 'Figma']
  },
  {
    id: 'user-company-1',
    name: 'TechCorp HR',
    role: 'company',
    skills: []
  }
];

// Job Model
// - id: string
// - title: string
// - companyId: string
// - skillsRequired: string[]
// - deadline: string
export const mockJobs = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    companyId: 'user-company-1',
    skillsRequired: ['React', 'Tailwind', 'TypeScript'],
    deadline: '2023-11-15'
  },
  {
    id: 'job-2',
    title: 'Full Stack Engineer',
    companyId: 'user-company-1',
    skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    deadline: '2023-11-20'
  },
  {
    id: 'job-3',
    title: 'UI Developer',
    companyId: 'user-company-1',
    skillsRequired: ['HTML', 'CSS', 'Figma', 'React'],
    deadline: '2023-11-25'
  }
];

// Application Model
// - id: string
// - studentId: string
// - jobId: string
// - status: 'Applied' | 'Shortlisted' | 'Rejected' | 'Interviewing'
// - matchScore: number
export const mockApplications = [
  {
    id: 'app-1',
    studentId: 'user-student-1',
    jobId: 'job-1',
    status: 'Shortlisted',
    matchScore: 94
  },
  {
    id: 'app-2',
    studentId: 'user-student-1',
    jobId: 'job-2',
    status: 'Applied',
    matchScore: 82
  },
  {
    id: 'app-3',
    studentId: 'user-student-1',
    jobId: 'job-3',
    status: 'Rejected',
    matchScore: 65
  }
];
