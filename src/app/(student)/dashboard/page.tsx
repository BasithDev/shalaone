import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  getStreak, 
  getQuizStats, 
  getDoubtCount, 
  getNoteStats, 
  getRecentActivity, 
  getFocusAreas, 
  getSubjectProgress 
} from "@/lib/queries/dashboard";
import { 
  Flame,
  Brain,
  MessageCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import { getProfileWithAcademicInfo } from "@/lib/queries/profile";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileWithAcademicInfo(user.id);

  if (!profile || !profile.boardId) {
    redirect("/onboarding");
  }

  const [streak, quizStats, doubtCount, noteStats, recentActivity, focusAreas, subjectProgress] = await Promise.all([
    getStreak(user.id),
    getQuizStats(user.id),
    getDoubtCount(user.id),
    getNoteStats(user.id),
    getRecentActivity(user.id),
    getFocusAreas(user.id),
    getSubjectProgress(user.id)
  ]);

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Calculate average syllabus progress
  const avgSyllabusProgress = subjectProgress.length > 0 
    ? Math.round(subjectProgress.reduce((sum, s) => sum + s.percentage, 0) / subjectProgress.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-7">
        
        {/* Greeting Banner */}
        <div className="pb-2">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">{todayStr}</span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-1.5">
            {greeting}, {profile.fullName?.split(' ')[0] || "Student"} 👋
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Streak Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-200">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              <Flame className="text-orange-500 stroke-[2px]" size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Study Streak</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-gray-900 leading-none">{streak}</span>
                <span className="text-xs font-bold text-gray-500 ml-1">days</span>
              </div>
            </div>
          </div>

          {/* Quizzes Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-200">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
              <Brain className="text-blue-600 stroke-[2px]" size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Quizzes Taken</span>
              <span className="text-2xl font-black text-gray-900 leading-none block mt-0.5">{quizStats.total}</span>
              <span className="text-[10px] font-bold text-gray-400 block mt-1">Avg Score: {quizStats.avgPercentage}%</span>
            </div>
          </div>

          {/* Doubts Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-200">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
              <MessageCircle className="text-amber-500 stroke-[2px]" size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Doubts Asked</span>
              <span className="text-2xl font-black text-gray-900 leading-none block mt-0.5">{doubtCount}</span>
              <span className="text-[10px] font-bold text-gray-400 block mt-1">This Month</span>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-200">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="text-green-600 stroke-[2px]" size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Notes Uploaded</span>
              <span className="text-2xl font-black text-gray-900 leading-none block mt-0.5">{noteStats.total}</span>
            </div>
            {noteStats.todayCount > 0 && (
              <span className="bg-rose-50 text-rose-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                {noteStats.todayCount} today
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Continue Where You Left Off */}
            {recentActivity && (
              <div className="bg-[#4f46e5] rounded-[24px] p-7 shadow-lg shadow-indigo-600/10 text-white relative overflow-hidden group">
                {/* Background decorative blurry aura */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center justify-between gap-6 relative z-10">
                  <div className="space-y-1.5">
                    <span className="bg-white/15 text-white/95 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Continue where you left off
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight pt-1 leading-snug">
                      {recentActivity.chapterName}
                    </h3>
                    <p className="text-xs text-white/70 font-semibold">
                      {recentActivity.type === "quiz" ? "Quiz Study" : "Doubt Analysis"}
                    </p>
                  </div>
                  <Link 
                    href={recentActivity.type === 'quiz' ? '/quizzes' : '/doubts'}
                    className="w-12 h-12 rounded-full bg-white text-[#4f46e5] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform shrink-0"
                  >
                    <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Subjects Progress List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Your Subjects</h3>
                <Link href="/progress" className="text-xs font-bold text-[#4f46e5] hover:text-[#3b32be]">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {subjectProgress.length === 0 ? (
                  <div className="col-span-3 bg-white p-8 rounded-3xl border border-gray-100 text-center text-sm font-semibold text-gray-400">
                    No curriculum subjects selected.
                  </div>
                ) : (
                  subjectProgress.slice(0, 3).map((sub, idx) => {
                    const name = sub.subjectName.toLowerCase();
                    const color = name.includes("math") 
                      ? "bg-[#4f46e5]" 
                      : name.includes("science") || name.includes("physics") || name.includes("chemistry") || name.includes("biology")
                      ? "bg-[#f59e0b]" 
                      : "bg-[#fb7185]";
                    
                    const emoji = name.includes("math") ? "📐" : name.includes("science") ? "🔬" : "📖";

                    return (
                      <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200">
                        <div>
                          <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shadow-sm">
                            {emoji}
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-base mt-4 truncate">{sub.subjectName}</h4>
                          <span className="text-xs text-gray-400 font-semibold block mt-0.5">Progress</span>
                        </div>
                        <div className="mt-6">
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="text-xs font-black text-gray-700">{sub.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${sub.percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Circular Syllabus Progress Card */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="text-base font-black text-gray-900 tracking-tight mb-4">Syllabus Progress</h3>
              
              {/* Circular SVG Chart */}
              <div className="flex flex-col items-center justify-center py-4 border-b border-gray-100/85">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-gray-100 fill-none"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-[#fb7185] fill-none"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * avgSyllabusProgress) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center leading-none">
                    <span className="text-2xl font-black text-gray-900">{avgSyllabusProgress}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Completed</span>
                  </div>
                </div>
              </div>

              {/* Subject Breakdowns */}
              <div className="pt-4 space-y-2.5">
                {subjectProgress.map((sub, idx) => {
                  const name = sub.subjectName.toLowerCase();
                  const dotColor = name.includes("math") 
                    ? "bg-[#4f46e5]" 
                    : name.includes("science") || name.includes("physics") || name.includes("chemistry") || name.includes("biology")
                    ? "bg-[#f59e0b]" 
                    : "bg-[#fb7185]";
                  
                  return (
                    <div key={"legend-" + idx} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                        <span>{sub.subjectName}</span>
                      </div>
                      <span className="text-gray-900">{sub.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Focus Areas Card */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-base font-black text-gray-900 tracking-tight">Focus Areas</h3>
              </div>

              {focusAreas.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-2xl block mb-2">🎉</span>
                  <p className="text-xs font-bold text-gray-400">All caught up! No weak topics detected yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {focusAreas.map((area, idx) => (
                    <div key={idx} className="bg-[#fcf8f2] border border-[#f5ece0] p-4 rounded-2xl flex flex-col gap-1.5">
                      <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                        {area.subjectName}
                      </span>
                      <h4 className="font-extrabold text-gray-900 text-sm leading-snug">
                        {area.chapterName}
                      </h4>
                      <div className="flex gap-3 mt-1.5 border-t border-gray-200/50 pt-2">
                        <Link href="/doubts" className="text-xs font-bold text-[#4f46e5] hover:text-[#3b32be] flex items-center gap-1">
                          Clear Doubts
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/quizzes" className="text-xs font-bold text-[#4f46e5] hover:text-[#3b32be]">
                          Retake Quiz
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
