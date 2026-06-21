"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Brain, BookOpen, Sparkles, Target, MessageSquare, Plus, FileText, Check } from "lucide-react";

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.08.79 2.18v3.24c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#151c27] selection:bg-indigo-500/10 overflow-hidden relative flex flex-col font-sans">
      
      {/* Background Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4f46e5 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Floating Gradient Aura */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-20 border-b border-gray-100 bg-white/70 backdrop-blur-md top-0">
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10">
              <Check className="text-white stroke-[3.5px]" size={20} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-none">ShalaOne</span>
              <span className="text-[9px] text-[#4f46e5] font-bold tracking-widest uppercase mt-0.5 block">AI Companion</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-bold bg-[#4f46e5] hover:bg-[#3b32c0] text-white px-5 py-2.5 rounded-full shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/15 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col items-center"
        >
          {/* Animated Tech Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-[#4f46e5] font-bold text-xs mb-6 shadow-sm"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>The Future of Personalized Learning</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-gray-900"
          >
            Master Your Curriculum with{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#4f46e5] to-indigo-500">
              AI-Powered
            </span>{" "}
            Precision.
          </motion.h1>
          
          {/* Subtitle description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-500 mb-10 max-w-2xl leading-relaxed font-medium"
          >
            Upload your personal notes, chat directly with your textbook chapters, and generate instant adaptive quizzes. ShalaOne spots your learning gaps and guides you to syllabus mastery.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-[#3b32c0] text-white px-8 py-4 rounded-full font-bold text-base shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/20 transition-all transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Start Learning Now <ArrowRight size={18} />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-base shadow-sm hover:bg-gray-50/50 transition-all transform hover:scale-[1.01]"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full"
        >
          {/* Feature 1 */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl text-left shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.04)] hover:border-indigo-100 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="text-[#4f46e5]" size={22} />
            </div>
            <h3 className="text-lg font-extrabold mb-2.5 text-gray-900">Contextual Doubt Chat</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Ask any study question and get instant answers grounded strictly in your school textbooks and uploaded notes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl text-left shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(251,113,133,0.04)] hover:border-rose-100 transition-all duration-300 group">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="text-rose-500" size={22} />
            </div>
            <h3 className="text-lg font-extrabold mb-2.5 text-gray-900">Instant AI Quizzes</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Instantly generate syllabus-aligned multiple-choice questions on any chapter to quiz your understanding.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl text-left shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.04)] hover:border-amber-100 transition-all duration-300 group">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="text-amber-600" size={22} />
            </div>
            <h3 className="text-lg font-extrabold mb-2.5 text-gray-900">Mastery Heatmap</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Automatically track performance across chapters, pinpoint Weak Topics, and follow a methodical roadmap.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-100 bg-white/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
          <p className="text-xs font-semibold text-gray-400">
            Built by <span className="font-bold text-gray-600">Abdul Basith</span> &middot; &copy;{" "}
            {new Date().getFullYear()} ShalaOne
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/BasithDev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
            >
              <GithubIcon /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/abdul-basith-36a60231b/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#4f46e5] transition-colors hover:border-indigo-200 hover:bg-indigo-50/50"
            >
              <LinkedinIcon /> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
