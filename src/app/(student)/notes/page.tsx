"use client";

import { useState, useEffect, useRef } from "react";
import { getNotesForUser, getStreak, deleteNote } from "./actions";
import { getStudentChapters } from "@/lib/queries/chapters";
import { useToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";
import {
  Plus,
  Trash2,
  FileText,
  Loader2,
  Flame,
  Upload,
  Calendar,
  MoreVertical,
  X
} from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Deletion dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);
  const [uploadChapterId, setUploadChapterId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  // Lock background scroll + reset the picked file whenever the modal toggles.
  useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    setFileName("");
  }, [isModalOpen]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      setFileName(file.name);
    }
  };

  const fetchNotesAndStreak = async () => {
    setLoading(true);
    const n = await getNotesForUser(selectedSubject === "All" ? undefined : selectedSubject);
    setNotes(n);
    
    // Initial fetch of unique subjects for tabs
    if (selectedSubject === "All") {
      const uniqueSubjects = [...new Set(n.map((note: any) => note.subjectName))];
      setSubjects(uniqueSubjects as string[]);
    }
    
    const s = await getStreak();
    setStreak(s);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotesAndStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  useEffect(() => {
    getStudentChapters().then(c => setChapters(c));
  }, []);

  const handleDelete = async (noteId: string) => {
    const ok = await confirm({
      title: "Delete note?",
      message: "This will also remove it from the AI doubt chat.",
      tone: "danger",
      confirmText: "Delete",
    });
    if (!ok) return;
    await deleteNote(noteId);
    toast("Note deleted.", "success");
    fetchNotesAndStreak();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !uploadChapterId) return;

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("File size must be under 10MB.", "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chapterId", uploadChapterId);

    try {
      const res = await fetch("/api/notes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setUploadChapterId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast(
          data.isSearchable
            ? "Note uploaded — it's now searchable in Doubt Chat."
            : "Note uploaded.",
          "success"
        );
        fetchNotesAndStreak();
      } else {
        toast(data.error || "Upload failed.", "error");
      }
    } catch {
      toast("An unexpected error occurred.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const formatNoteDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return "Uploaded Today";
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getSubjectBadgeColors = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes("math")) {
      return { dot: "bg-blue-600", text: "text-blue-600", bg: "bg-blue-50" };
    } else if (name.includes("science") || name.includes("physics") || name.includes("chemistry") || name.includes("biology")) {
      return { dot: "bg-rose-500", text: "text-rose-500", bg: "bg-rose-50" };
    } else if (name.includes("english")) {
      return { dot: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-50" };
    } else {
      return { dot: "bg-purple-500", text: "text-purple-500", bg: "bg-purple-50" };
    }
  };

  const getSubjectThumbnail = (subjectName: string, isImage: boolean, signedUrl: string | null) => {
    if (isImage && signedUrl) {
      return (
        <img 
          src={signedUrl} 
          alt="Notes Content" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
        />
      );
    }
    
    const name = subjectName.toLowerCase();
    if (name.includes("math")) {
      return (
        <div className="w-full h-full bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Grid lines styling */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[14px_24px]" />
          <span className="text-4xl filter drop-shadow-sm relative z-10">📐</span>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 relative z-10">Math formulas</span>
        </div>
      );
    } else if (name.includes("science") || name.includes("physics") || name.includes("chemistry") || name.includes("biology")) {
      return (
        <div className="w-full h-full bg-linear-to-br from-purple-50 to-pink-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <span className="text-4xl filter drop-shadow-sm">🔬</span>
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-2">Core Science</span>
        </div>
      );
    } else if (name.includes("english")) {
      return (
        <div className="w-full h-full bg-linear-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <span className="text-4xl filter drop-shadow-sm">📖</span>
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2">Literature</span>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full bg-linear-to-br from-gray-50 to-blue-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <span className="text-4xl filter drop-shadow-sm">📝</span>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2">Study Guide</span>
        </div>
      );
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter notes client-side based on search query
  const filteredNotes = notes.filter(note => 
    note.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6 sm:p-8 relative">
      <div className="max-w-5xl mx-auto space-y-7">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Notes</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 bg-white hover:bg-gray-50/50 border border-gray-200/80 focus:border-[#4f46e5] focus:bg-white rounded-full py-2 pl-9 pr-4 text-xs font-semibold placeholder-gray-400 outline-none transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            
          </div>
        </div>

        {/* Promo Hero Banner */}
        <div className="bg-linear-to-r from-[#4d44e3] via-[#855fe6] to-[#fc7085] rounded-[24px] p-8 shadow-lg shadow-indigo-600/5 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
          {/* Decorative aura */}
          <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
          <div className="space-y-3 relative z-10">
            <span className="bg-white/15 text-white/95 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Flame size={12} className="text-orange-400 fill-current animate-pulse" /> {streak} day streak
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight max-w-xl">
              Keep your streak going — upload today's notes
            </h1>
            <p className="text-xs text-white/80 font-medium">Consistent review builds mastery.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-gray-50 text-[#4f46e5] px-6 py-3 rounded-full font-bold shadow-md hover:-translate-y-px active:translate-y-0 transition-all flex items-center gap-2 relative z-10 shrink-0 self-start md:self-auto text-xs"
          >
            <Upload size={14} className="stroke-[2.5px]" /> Upload Notes
          </button>
        </div>

        {/* Filters pills row */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button 
            onClick={() => setSelectedSubject("All")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedSubject === "All" 
                ? "bg-[#3525cd] text-white shadow-md shadow-indigo-600/10" 
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50/50"
            }`}
          >
            All Notes
          </button>
          {subjects.map(sub => (
            <button 
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubject === sub 
                  ? "bg-[#3525cd] text-white shadow-md shadow-indigo-600/10" 
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50/50"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-[#4f46e5]" size={36} />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-dashed border-gray-200 p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="w-14 h-14 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-base font-black text-gray-900">No notes found</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto font-medium">
              Upload your study notes here. PDF notes automatically become searchable in Doubt Chat!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => {
              const badge = getSubjectBadgeColors(note.subjectName);
              return (
                <div 
                  key={note.id} 
                  className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/80 overflow-hidden hover:translate-y-[-2px] transition-all duration-250 group flex flex-col"
                >
                  {/* Thumbnail Banner Area */}
                  <div className="h-40 bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-100/50">
                    {getSubjectThumbnail(note.subjectName, note.isImage, note.signedUrl)}
                    
                    {/* Top overlay badge */}
                    <span className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${badge.bg} ${badge.text} shadow-sm uppercase tracking-wider`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {note.subjectName}
                    </span>

                    {!note.isSearchable && (
                       <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-md backdrop-blur-sm tracking-wide">
                         Not Searchable
                       </span>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <a 
                        href={note.signedUrl || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-extrabold text-gray-950 text-base leading-snug hover:text-[#4f46e5] transition-colors line-clamp-2"
                      >
                        {note.chapterName}
                      </a>
                      
                      {/* Three-dot delete menu */}
                      <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => setActiveDropdownId(activeDropdownId === note.id ? null : note.id)}
                          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeDropdownId === note.id && (
                          <div className="absolute right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-20 w-32 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button 
                              onClick={() => handleDelete(note.id)}
                              className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={12} /> Delete Note
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      <Calendar size={13} className="text-gray-400" />
                      {formatNoteDate(note.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-13 h-13 rounded-full bg-[#3525cd] text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all z-30"
        title="Upload Note"
      >
        <Plus size={24} className="stroke-[2.5px]" />
      </button>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-250 border border-gray-100">
            <div className="px-6 py-4.5 border-b border-gray-50 flex justify-between items-center bg-[#f9f9ff]">
              <h2 className="text-base font-black text-gray-900">Upload Study Note</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Chapter Context</label>
                <select 
                  required
                  value={uploadChapterId}
                  onChange={e => setUploadChapterId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:border-[#4f46e5] outline-none transition-colors text-xs font-semibold text-gray-700 bg-gray-50/50"
                >
                  <option value="" disabled>Select a chapter</option>
                  {chapters.map(ch => (
                    <option key={ch.id} value={ch.id} disabled={!ch.hasBook}>
                      {ch.subjectName} - {ch.name} {!ch.hasBook ? "(No content yet)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Document File</label>
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-[#4f46e5] bg-indigo-50/50" : "border-gray-200 hover:border-indigo-300 bg-gray-50/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,image/jpeg,image/png"
                    required
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  />
                  {fileName ? (
                    <span className="flex items-center gap-2 text-xs font-bold text-[#3525cd]">
                      <FileText size={14} /> {fileName}
                    </span>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">Drag &amp; drop or click to browse</span>
                    </>
                  )}
                  <span className="text-[10px] text-gray-400 font-medium leading-normal">
                    PDF, JPG, PNG. Only PDFs are OCR-extracted for AI Doubt Chat.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-[#3525cd] hover:bg-[#281bab] text-white font-bold py-3.5 px-4 rounded-full disabled:bg-indigo-300 flex justify-center items-center gap-2 transition-all text-xs"
                >
                  {isUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : "Upload & Analyze"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
