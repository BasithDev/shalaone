"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  GraduationCap, 
  Globe, 
  ArrowRight, 
  X, 
  Atom, 
  FlaskConical, 
  Calculator, 
  Languages, 
  Compass, 
  FileText, 
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import { getBoards, getClassesForBoard, getSubjectsForClass, completeOnboarding, checkOnboardingStatus } from "./actions";
import { createClient } from "@/lib/supabase/client";

// Map names to Lucide icons dynamically
const getBoardIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("cbse")) return BookOpen;
  if (lower.includes("icse")) return GraduationCap;
  return Globe;
};

const getSubjectIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("physics") || lower.includes("science")) return Atom;
  if (lower.includes("chemistry")) return FlaskConical;
  if (lower.includes("math")) return Calculator;
  if (lower.includes("english") || lower.includes("lang")) return Languages;
  if (lower.includes("social") || lower.includes("geo") || lower.includes("hist")) return Compass;
  return FileText;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const status = await checkOnboardingStatus();
        if (!status.requireOnboarding && !status.isError) {
          router.replace("/dashboard");
          return;
        }

        const b = await getBoards();
        setBoards(b);
      } catch (err) {
        setError("Failed to load initial data. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    async function loadClasses() {
      if (!selectedBoard) return;
      setLoading(true);
      setError("");
      try {
        const c = await getClassesForBoard(selectedBoard);
        setClasses(c);
      } catch (err) {
        setError("Failed to load classes.");
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, [selectedBoard]);

  useEffect(() => {
    async function loadSubjects() {
      if (!selectedClass) return;
      setLoading(true);
      setError("");
      try {
        const s = await getSubjectsForClass(selectedClass);
        setSubjects(s);
      } catch (err) {
        setError("Failed to load subjects.");
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, [selectedClass]);

  const handleBoardSelect = (id: string) => {
    setSelectedBoard(id);
    setSelectedClass("");
    setSelectedSubjects([]);
  };

  const handleClassSelect = (id: string) => {
    setSelectedClass(id);
    setSelectedSubjects([]);
  };

  const toggleSubject = (id: string) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter(sid => sid !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleClose = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleFinish = async () => {
    if (!selectedBoard || !selectedClass || selectedSubjects.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await completeOnboarding(selectedBoard, selectedClass, selectedSubjects);
      if (res.success) {
        window.location.href = "/dashboard";
      } else {
        setError(res.error || "Failed to complete onboarding.");
        setLoading(false);
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;

  if (loading && step === 1 && boards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9ff]">
        <Loader2 className="animate-spin text-[#4f46e5] mb-4" size={40} />
        <p className="text-gray-500 font-semibold">Loading setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-4 selection:bg-indigo-500/10">
      {/* Background Dot pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-8 z-10">
        
        {/* Header Metadata */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step {step} of 3
          </span>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Log Out & Exit"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="bg-[#4f46e5] h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome to ShalaOne</h1>
                <p className="text-gray-500 mt-2 font-medium text-sm">
                  Let's set up your study profile. Which board are you studying under?
                </p>
              </div>

              <div className="space-y-3">
                {boards.map((b) => {
                  const BoardIcon = getBoardIcon(b.name);
                  const isSelected = selectedBoard === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleBoardSelect(b.id)}
                      className={`w-full flex items-center justify-between p-4.5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                        isSelected 
                          ? 'border-[#4f46e5] bg-indigo-50/20 shadow-sm' 
                          : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-100 text-[#4f46e5]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <BoardIcon size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">{b.name}</div>
                          <div className="text-xs text-gray-400 font-semibold mt-0.5">
                            {b.name.includes("CBSE") ? "Central Board of Secondary Education" : 
                             b.name.includes("ICSE") ? "Indian Certificate of Secondary Education" : 
                             "Regional State Education Boards"}
                          </div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-[#4f46e5] bg-[#4f46e5]' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check size={12} className="text-white stroke-[3px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedBoard || loading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#4f46e5] hover:bg-[#3b32c0] text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select your Class</h1>
                <p className="text-gray-500 mt-2 font-medium text-sm">
                  Choose your current grade level to match standard textbooks and curriculum.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-[#4f46e5]" size={28} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {classes.map((c) => {
                    const isSelected = selectedClass === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleClassSelect(c.id)}
                        className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 group ${
                          isSelected 
                            ? 'border-[#4f46e5] bg-indigo-50/20 shadow-sm' 
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-100 text-[#4f46e5]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <GraduationCap size={20} />
                        </div>
                        <div className="font-bold text-gray-900 text-base">{c.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button 
                  onClick={() => {
                    setStep(1);
                    setSelectedClass("");
                    setSelectedSubjects([]);
                  }} 
                  className="px-6 py-3.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-bold text-sm transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedClass || loading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#4f46e5] hover:bg-[#3b32c0] text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Choose your Subjects</h1>
                <p className="text-gray-500 mt-2 font-medium text-sm">
                  Select the subjects you are studying this academic year. You can change these later in settings.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-[#4f46e5]" size={28} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {subjects.map((s) => {
                    const SubjectIcon = getSubjectIcon(s.name);
                    const isSelected = selectedSubjects.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSubject(s.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                          isSelected 
                            ? 'border-[#4f46e5] bg-indigo-50/20 shadow-sm' 
                            : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/5'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-100 text-[#4f46e5]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <SubjectIcon size={18} />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button 
                  onClick={() => {
                    setStep(2);
                    setSelectedSubjects([]);
                  }} 
                  className="px-6 py-3.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full font-bold text-sm transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={selectedSubjects.length === 0 || loading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#4f46e5] hover:bg-[#3b32c0] text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {loading ? "Saving..." : "Finish Onboarding"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
