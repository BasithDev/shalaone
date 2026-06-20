"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, BookText, Download, MessageSquare, Lock } from "lucide-react";
import type { LibrarySubject } from "@/lib/queries/library";

export default function SubjectsClientMap({ library }: { library: LibrarySubject[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const activeSubject = library[activeIndex] || library[0];

  return (
    <div className="space-y-6">
      {/* Subject tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {library.map((sub, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={sub.subjectId}
              onClick={() => setActiveIndex(index)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#3525cd] text-white shadow-md shadow-indigo-600/10"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50/50"
              }`}
            >
              {isActive && <BookOpen size={13} className="stroke-[2.5px]" />}
              {sub.subjectName}
            </button>
          );
        })}
      </div>

      {/* Subject summary */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3525cd] flex items-center justify-center shrink-0 border border-indigo-100/30">
          <BookText size={20} className="stroke-[2px]" />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 leading-tight">{activeSubject.subjectName}</h3>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            <span>{activeSubject.chapters.length} Chapters</span>
            <span>•</span>
            <span>{activeSubject.bookCount} Books available</span>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <h3 className="text-lg font-black text-gray-900 tracking-tight pt-1">Chapters</h3>
      <div className="space-y-4">
        {activeSubject.chapters.map((ch, idx) => {
          const available = !!ch.fileUrl;
          return (
            <div
              key={ch.id}
              className={`bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all hover:translate-x-0.5 duration-200 ${
                available ? "border-l-4 border-l-[#3525cd]" : "border-l-4 border-l-gray-200"
              }`}
            >
              {/* Left: number + title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${
                    available ? "bg-indigo-50 text-[#3525cd]" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug truncate">
                    {ch.name}
                  </h4>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                    {available ? "Textbook ready" : "No book uploaded yet"}
                  </p>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => router.push(`/doubts?chapterId=${ch.id}`)}
                  className="p-2 text-gray-400 hover:text-[#3525cd] hover:bg-indigo-50 border border-gray-200/80 rounded-xl transition-all cursor-pointer"
                  title="Ask doubts about this chapter"
                >
                  <MessageSquare size={15} />
                </button>

                {available ? (
                  <>
                    <a
                      href={`${ch.fileUrl}?download`}
                      className="inline-flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-[#3525cd] hover:bg-gray-50 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={13} /> Download
                    </a>
                    <a
                      href={ch.fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#3525cd] hover:bg-[#281bab] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm hover:-translate-y-px active:translate-y-0 transition-all"
                      title="Read in browser"
                    >
                      <BookOpen size={13} className="stroke-[2.5px]" /> Read
                    </a>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100">
                    <Lock size={13} /> Unavailable
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
