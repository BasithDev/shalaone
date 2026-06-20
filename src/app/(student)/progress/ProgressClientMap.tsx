"use client";

import {
  BookOpen,
  AlertTriangle,
  Activity
} from "lucide-react";

export default function ProgressClientMap({ syllabusMap }: { syllabusMap: any[] }) {
  // Compute overall stats
  let totalChapters = 0;
  let totalMastered = 0;
  let weakCount = 0;
  let inProgressCount = 0;

  syllabusMap.forEach(sub => {
    totalChapters += sub.totalChapters;
    totalMastered += sub.masteredCount;
    sub.chapters.forEach((ch: any) => {
      if (ch.status === "weak") weakCount++;
      if (ch.status === "in_progress") inProgressCount++;
    });
  });

  const overallPercentage = totalChapters === 0 ? 0 : Math.round((totalMastered / totalChapters) * 100);

  // Block color mapping
  const getBlockColor = (status: string) => {
    switch (status) {
      case "mastered": return "bg-[#3525cd]";
      case "in_progress": return "bg-[#a5b4fc]";
      case "weak": return "bg-[#b58f33]";
      default: return "bg-[#e2e8f0]";
    }
  };

  return (
    <div className="space-y-7">
      
      {/* Top 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Circular Progress */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-6 flex flex-col items-center justify-center min-h-[160px]">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#3525cd" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={`${251.2 * (overallPercentage / 100)} 251.2`} 
                className="transition-all duration-1000 ease-out" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-gray-900 leading-none">{overallPercentage}%</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Overall</span>
            </div>
          </div>
        </div>

        {/* Card 2: Chapters Mastered */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 border-l-4 border-l-[#3b82f6] p-6 flex items-center gap-4 min-h-[160px]">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#3b82f6] flex items-center justify-center shrink-0 border border-blue-100/30">
            <BookOpen size={18} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-gray-900 leading-none">{totalMastered}/{totalChapters}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chapters Mastered</p>
          </div>
        </div>

        {/* Card 3: Weak Topics */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 border-l-4 border-l-[#eab308] p-6 flex items-center gap-4 min-h-[160px]">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#eab308] flex items-center justify-center shrink-0 border border-amber-100/30">
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-gray-900 leading-none">{weakCount}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weak Topics</p>
          </div>
        </div>

        {/* Card 4: Chapters In Progress */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 border-l-4 border-l-[#6366f1] p-6 flex items-center gap-4 min-h-[160px]">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#6366f1] flex items-center justify-center shrink-0 border border-indigo-100/30">
            <Activity size={18} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-gray-900 leading-none">{inProgressCount}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chapters In Progress</p>
          </div>
        </div>

      </div>

      {/* Syllabus Map Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-8 space-y-6">
        
        {/* Header with Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-gray-900 tracking-tight">Syllabus Map</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Chapter completion status across all subjects.</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-black text-gray-400 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e2e8f0]" /> Not Started
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#a5b4fc]" /> In Progress
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b58f33]" /> Weak
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3525cd]" /> Mastered
            </div>
          </div>
        </div>

        {/* Subjects list rows */}
        <div className="space-y-5 pt-2">
          {syllabusMap.map(sub => (
            <div key={sub.subjectId} className="space-y-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="flex justify-between items-center text-xs font-extrabold text-gray-900">
                <span>{sub.subjectName}</span>
                <span className="text-gray-400 font-bold">{sub.percentage}%</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sub.chapters.map((ch: any) => (
                  <div
                    key={ch.id}
                    className={`w-6 h-6 rounded-md transition-all hover:scale-105 cursor-help relative group ${getBlockColor(ch.status)}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-snug">
                      {ch.name}
                      <span className="block text-[8px] text-gray-400 mt-0.5 uppercase tracking-wider font-extrabold">{ch.status.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Subject Completion Progress Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-8 space-y-6">
        <h3 className="text-base font-black text-gray-900 tracking-tight">Subject Completion</h3>
        
        <div className="space-y-5">
          {syllabusMap.map(sub => (
            <div key={sub.subjectId} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold">
                <span className="text-gray-700">{sub.subjectName}</span>
                <span className="text-[#3525cd] font-black">{sub.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#3525cd] h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${sub.percentage}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
