"use client";

import { useState, useEffect, useMemo } from "react";
import { getStudentChapters } from "@/lib/queries/chapters"; 
import { getQuizHistory } from "./actions";
import { Loader2, Brain, Play, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/toast";

export default function QuizzesPage() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [retakeChapterId, setRetakeChapterId] = useState<string | null>(null);

  const router = useRouter();
  const toast = useToast();

  const subjects = useMemo(() => {
    const seen = new Map<string, string>();
    for (const ch of chapters) if (!seen.has(ch.subjectId)) seen.set(ch.subjectId, ch.subjectName);
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [chapters]);

  const subjectChapters = useMemo(
    () => chapters.filter((c) => c.subjectId === selectedSubjectId),
    [chapters, selectedSubjectId]
  );

  useEffect(() => {
    async function init() {
      const [c, h] = await Promise.all([
        getStudentChapters(),
        getQuizHistory()
      ]);
      setChapters(c);
      setHistory(h);
      setLoading(false);
    }
    init();
  }, []);

  const handleGenerateDirectly = async (chapterId: string) => {
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId })
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/quizzes/${data.quizId}`);
      } else {
        toast(data.error || "Failed to generate quiz. Make sure the chapter has book content uploaded.", "error");
      }
    } catch {
      toast("An unexpected error occurred. Please try again.", "error");
    }
  };

  const handleMainGenerate = async () => {
    if (!selectedChapterId) return;
    setIsGenerating(true);
    await handleGenerateDirectly(selectedChapterId);
    setIsGenerating(false);
  };

  const handleRetake = async (chapterId: string) => {
    setRetakeChapterId(chapterId);
    await handleGenerateDirectly(chapterId);
    setRetakeChapterId(null);
  };

  const getScoreDot = (percentage: number) => {
    if (percentage >= 80) return <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />;
    if (percentage >= 60) return <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />;
    return <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />;
  };

  const getSubjectBadgeColors = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes("math")) {
      return "text-[#f43f5e] bg-[#fff1f2] border-[#ffe4e6]";
    } else if (name.includes("phys") || name.includes("science")) {
      return "text-[#3b82f6] bg-[#eff6ff] border-[#dbeafe]";
    } else if (name.includes("chem")) {
      return "text-[#d97706] bg-[#fffbeb] border-[#fef3c7]";
    } else {
      return "text-[#8b5cf6] bg-[#f5f3ff] border-[#ede9fe]";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-7">
        
        {/* Title and Subtitle */}
        <div className="space-y-1 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Master Your Knowledge</h2>
          <p className="text-xs text-gray-500 font-medium">Generate AI-powered quizzes or review past attempts to strengthen weak areas.</p>
        </div>

        {/* Generate a Quiz Card */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden">
          {/* Decorative subtle gradient background */}
          <div className="absolute right-0 top-0 w-80 h-full bg-linear-to-bl from-indigo-50/20 to-transparent pointer-events-none" />
          
          <div className="flex-1 space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#6366f1] flex items-center justify-center shrink-0 shadow-sm border border-violet-100/30">
                <Sparkles size={20} className="fill-violet-200/50" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900 leading-tight">Generate a Quiz</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xl">
                  AI will create tailored questions based on your current chapter content. Perfect for quick reviews or deep study sessions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1: Subject pills */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Subject</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        setSelectedSubjectId(s.id);
                        setSelectedChapterId("");
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition active:scale-[0.98] ${
                        selectedSubjectId === s.id
                          ? "bg-[#3525cd] text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                  {subjects.length === 0 && (
                    <p className="text-xs text-gray-400 font-medium">No subjects available yet.</p>
                  )}
                </div>
              </div>

              {/* Step 2: Chapter dropdown (filtered by subject) */}
              {selectedSubjectId && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Chapter</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full md:w-96 border border-gray-200 rounded-xl p-3 focus:border-[#3525cd] outline-none transition-colors text-xs font-semibold text-gray-700 bg-gray-50/50 cursor-pointer"
                    disabled={isGenerating}
                  >
                    <option value="" disabled>-- Select Chapter --</option>
                    {subjectChapters.map((ch) => (
                      <option key={ch.id} value={ch.id} disabled={!ch.hasBook}>
                        {ch.name} {!ch.hasBook ? "(No Content)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button 
              onClick={handleMainGenerate}
              disabled={!selectedChapterId || isGenerating}
              className="bg-[#3525cd] hover:bg-[#281bab] disabled:bg-indigo-300 text-white px-6 py-3.5 rounded-full font-bold shadow-md hover:-translate-y-px active:translate-y-0 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {isGenerating ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Play size={12} className="fill-current" /> Start Generating</>
              )}
            </button>
          </div>
        </div>

        {/* Past Attempts Section */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Past Attempts</h2>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-[#3525cd]" size={28} />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-14 h-14 bg-indigo-50 text-[#3525cd] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain size={24} />
                </div>
                <h3 className="text-base font-black text-gray-900">No attempts yet</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto font-medium">
                  Generate and take your first quiz to see your performance history here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chapter</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4.5 text-[10px] font-black text-gray-400 text-right uppercase tracking-widest pr-8">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50/50">
                    {history.map((h) => (
                      <tr key={h.attemptId} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4.5">
                          <Link href={`/quizzes/${h.quizId}/results/${h.attemptId}`} className="font-extrabold text-gray-950 text-sm hover:text-[#3525cd] transition-colors leading-normal">
                            {h.chapterName}
                          </Link>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getSubjectBadgeColors(h.subjectName)}`}>
                            {h.subjectName}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="inline-flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">{h.score}</span>
                            <span className="text-[10px] text-gray-400 font-extrabold">/{h.maxScore}</span>
                            {getScoreDot(h.percentage)}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-xs text-gray-500 font-bold">
                          {formatDate(h.createdAt)}
                        </td>
                        <td className="px-6 py-4.5 text-right pr-8">
                          <button 
                            onClick={() => handleRetake(h.chapterId)}
                            disabled={retakeChapterId === h.chapterId}
                            className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-bold text-[#3525cd] hover:bg-gray-50 disabled:bg-gray-50/50 disabled:text-indigo-300 transition-colors cursor-pointer"
                          >
                            {retakeChapterId === h.chapterId ? (
                              <Loader2 size={12} className="animate-spin text-[#3525cd]" />
                            ) : (
                              <RefreshCw size={12} className="text-[#3525cd]" />
                            )}
                            Retake
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
