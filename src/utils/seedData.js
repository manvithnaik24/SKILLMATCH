import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const SAMPLE_JOBS = [
  {
    title: "Frontend Intern",
    companyName: "Google",
    companyId: "seed-google-123",
    description: "Join our core UI team to build next-generation web applications using React and modern CSS. You will work closely with designers and senior engineers to implement pixel-perfect, accessible interfaces.",
    skillsRequired: ["React", "JavaScript", "TailwindCSS"],
    location: "Mountain View, CA (Hybrid)",
    deadline: "2024-12-31",
  },
  {
    title: "AI Intern",
    companyName: "Amazon",
    companyId: "seed-amazon-123",
    description: "Help us build the next generation of AWS AI tools. You will be training models, evaluating prompt pipelines, and deploying Python-based microservices.",
    skillsRequired: ["Python", "Machine Learning", "AWS"],
    location: "Seattle, WA (Remote)",
    deadline: "2024-11-15",
  },
  {
    title: "Data Analyst",
    companyName: "Infosys",
    companyId: "seed-infosys-123",
    description: "Analyze large datasets to extract meaningful business insights. You will create dashboards in Tableau and write complex SQL queries to support our enterprise clients.",
    skillsRequired: ["SQL", "Data Analysis", "Tableau", "Python"],
    location: "Bangalore, India",
    deadline: "2024-10-30",
  }
];

export const seedDatabaseIfEmpty = async () => {
  try {
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(jobsRef);
    
    if (snapshot.empty) {
      console.log("🌱 Database empty! Seeding sample jobs...");
      for (const job of SAMPLE_JOBS) {
        await addDoc(jobsRef, {
          ...job,
          createdAt: new Date().toISOString()
        });
      }
      console.log("✅ Sample jobs seeded successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};
