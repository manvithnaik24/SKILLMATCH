import fs from 'fs';
const file = fs.readFileSync('src/components/student/AnalyticsPanel.jsx', 'utf-8');
const modFile = file.replace('export default function AnalyticsPanel({ applications }) {', 'console.log("CountUp type:", typeof CountUp, "FileText type:", typeof FileText, "motion type:", typeof motion);\nexport default function AnalyticsPanel({ applications }) {');
fs.writeFileSync('src/components/student/AnalyticsPanel.jsx', modFile);
