import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, TrendingUp, CheckCircle, ArrowRight, UserCircle, Building2, Briefcase, Zap, Shield } from 'lucide-react';

const Landing = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter selection:bg-primary/20 selection:text-primary">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                <Target size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                SkillMatch
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 font-medium text-text-secondary">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
              <a href="#users" className="hover:text-primary transition-colors">Who is it for?</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-medium text-text-primary hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/login" className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2">
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
          <div className="absolute top-32 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 left-1/2 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-primary font-semibold mb-8 border border-secondary/20">
              <Zap size={16} className="text-secondary" />
              <span>Smart Internship Portal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight mb-8 leading-[1.1]">
              Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">Right Internship</span>, Not Just Any Internship
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Stop guessing. Start matching. Our AI-driven platform analyzes your skills to find the perfect internship gap and matches you with top companies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2">
                Get Started for Free <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-white text-text-primary border-2 border-gray-200 hover:border-primary/30 hover:bg-gray-50 px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
                Login to Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 top-1/2"></div>
            <div className="rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-xl p-2 shadow-2xl overflow-hidden ring-1 ring-gray-900/5">
              <div className="rounded-xl overflow-hidden bg-white border border-gray-100 flex flex-col h-[400px]">
                {/* Mock Header */}
                <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                {/* Mock Body */}
                <div className="flex flex-1 p-6 gap-6 bg-gray-50/30">
                  <div className="w-64 hidden md:flex flex-col gap-4">
                    <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex gap-4">
                      <div className="h-24 bg-primary/10 rounded-xl flex-1 border border-primary/20"></div>
                      <div className="h-24 bg-secondary/10 rounded-xl flex-1 border border-secondary/20"></div>
                      <div className="h-24 bg-blue-50 rounded-xl flex-1 border border-blue-100"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-12 bg-gray-50 rounded-lg w-full"></div>
                        <div className="h-12 bg-gray-50 rounded-lg w-full"></div>
                        <div className="h-12 bg-gray-50 rounded-lg w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">Built for Smarter Connections</h2>
            <p className="text-lg text-text-secondary">Our platform uses advanced algorithms to ensure students find roles where they can thrive, and companies find talent that fits perfectly.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Card 1 */}
            <motion.div variants={fadeIn} className="bg-background rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Smart Matching</h3>
              <p className="text-text-secondary leading-relaxed">
                We go beyond keywords. Our AI understands context, mapping your exact abilities to role requirements for a precise match score.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeIn} className="bg-background rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 group-hover:bg-secondary group-hover:text-gray-900 transition-all">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Skill Gap Analyzer</h3>
              <p className="text-text-secondary leading-relaxed">
                Discover exactly what's missing. Get actionable insights on which skills to learn next to land your dream internship.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeIn} className="bg-background rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Briefcase size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text-primary">Application Tracker</h3>
              <p className="text-text-secondary leading-relaxed">
                Never lose track again. Manage all your applications, interviews, and offers in one beautifully organized dashboard.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">How It Works</h2>
            <p className="text-lg text-text-secondary">Three simple steps to connect with your perfect opportunity.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="relative group">
                <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center text-2xl font-bold text-primary shadow-lg border-4 border-background mb-6 group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-3">Add Your Skills</h3>
                  <p className="text-text-secondary">Build your profile with your technical and soft skills, projects, and career goals.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center text-2xl font-bold text-secondary shadow-lg border-4 border-background mb-6 group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-3">Get Matched Jobs</h3>
                  <p className="text-text-secondary">Our AI instantly curates a list of internships where your skills perfectly align.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border-4 border-background mb-6 group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-3">Apply & Track</h3>
                  <p className="text-text-secondary">Apply with one click and monitor your progress through every interview stage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Users Section */}
      <section id="users" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            {/* Students */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-primary/5 rounded-[2rem] p-10 lg:p-14 border border-primary/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <UserCircle size={120} className="text-primary" />
              </div>
              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold mb-6">
                  For Students
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-text-primary">Kickstart your career with confidence</h3>
                <ul className="space-y-4 mb-10">
                  {['Discover roles that match your true potential', 'Identify skills you need to learn to get hired', 'Stand out to recruiters with verified skill scores'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="text-primary mt-1 flex-shrink-0" size={20} />
                      <span className="text-text-secondary text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:gap-4 transition-all">
                  Join as Student <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>

            {/* Companies */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-secondary/5 rounded-[2rem] p-10 lg:p-14 border border-secondary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Building2 size={120} className="text-secondary" />
              </div>
              <div className="relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-yellow-700 font-semibold mb-6">
                  For Companies
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-text-primary">Hire the right talent, faster</h3>
                <ul className="space-y-4 mb-10">
                  {['Stop sifting through irrelevant resumes', 'Match with candidates based on verified skills', 'Reduce time-to-hire by connecting with pre-screened talent'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Shield className="text-secondary mt-1 flex-shrink-0" size={20} />
                      <span className="text-text-secondary text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="inline-flex items-center gap-2 text-yellow-700 font-semibold text-lg hover:gap-4 transition-all">
                  Join as Company <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-24 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to find your perfect match?</h2>
          <p className="text-xl text-white/80 mb-12">
            Join thousands of students and companies already using SkillMatch.
          </p>
          <Link to="/login" className="inline-flex bg-secondary hover:bg-secondary-light text-gray-900 px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-105 hover:shadow-xl items-center gap-3">
            Start your journey today <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Target size={24} className="text-primary" />
            <span className="text-xl font-bold">SkillMatch</span>
          </div>
          <p>© {new Date().getFullYear()} SkillMatch. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
