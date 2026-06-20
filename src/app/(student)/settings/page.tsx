"use client";

import { useState, useEffect } from "react";
import { getProfileInfo, updateProfile, updateAcademicInfo, logout } from "./actions";
import { getBoards, getClassesForBoard, getSubjectsForClass } from "../../onboarding/actions";
import { FullPageLoader } from "@/components/Loading";
import { 
  User,
  GraduationCap,
  Shield,
  Info,
  Loader2,
  CheckCircle,
  AlertTriangle,
  LogOut,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Brain,
  FileText,
  Flame,
  Target
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  // Academic Info Form State
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);
  const [academicMessage, setAcademicMessage] = useState({ text: "", type: "" });
  const [showClassChangeWarning, setShowClassChangeWarning] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const p = await getProfileInfo();
        if (p) {
          setProfile(p);
          setFullName(p.fullName || "");
          setSelectedBoard(p.boardId || "");
          setSelectedClass(p.classId || "");
          setSelectedSubjects(p.subjectIds || []);
          
          const b = await getBoards();
          setBoards(b);
          
          if (p.boardId) {
            const c = await getClassesForBoard(p.boardId);
            setClasses(c);
          }
          if (p.classId) {
            const s = await getSubjectsForClass(p.classId);
            setSubjects(s);
          }
        }
      } catch (err) {
        console.error("Failed to load settings data:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleBoardChange = async (boardId: string) => {
    setSelectedBoard(boardId);
    setSelectedClass("");
    setSelectedSubjects([]);
    setShowClassChangeWarning(false);
    const c = await getClassesForBoard(boardId);
    setClasses(c);
    setSubjects([]);
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedSubjects([]);
    setShowClassChangeWarning(false);
    const s = await getSubjectsForClass(classId);
    setSubjects(s);
  };

  const toggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
    setShowClassChangeWarning(false);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage({ text: "", type: "" });
    const res = await updateProfile(fullName);
    if (res.success) {
      setProfile({ ...profile, fullName });
      setProfileMessage({ text: "Profile updated successfully!", type: "success" });
    } else {
      setProfileMessage({ text: res.error || "Failed to update profile.", type: "error" });
    }
    setIsSavingProfile(false);
  };

  const handleAcademicSave = async () => {
    const isClassChanged = profile.classId !== selectedClass;
    
    if (isClassChanged && !showClassChangeWarning) {
      setShowClassChangeWarning(true);
      return;
    }

    setIsSavingAcademic(true);
    setAcademicMessage({ text: "", type: "" });
    
    const res = await updateAcademicInfo(selectedBoard, selectedClass, selectedSubjects);
    if (res.success) {
      const p = await getProfileInfo();
      if (p) {
        setProfile(p);
        setSelectedBoard(p.boardId || "");
        setSelectedClass(p.classId || "");
        setSelectedSubjects(p.subjectIds || []);
      }
      setAcademicMessage({ text: "Academic info updated successfully!", type: "success" });
      setShowClassChangeWarning(false);
      setIsEditingAcademic(false);
    } else {
      setAcademicMessage({ text: res.error || "Failed to update academic info.", type: "error" });
    }
    setIsSavingAcademic(false);
  };

  const handleTabClick = (tab: string) => {
    if (tab === "academic") {
      setActiveTab("profile");
      setTimeout(() => {
        const el = document.getElementById("academic-setup");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    } else {
      setActiveTab(tab);
    }
  };

  const getSubjectColorStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("math")) {
      return "bg-amber-50 text-amber-600 border border-amber-100/50 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider";
    }
    if (n.includes("science")) {
      return "bg-rose-50 text-rose-600 border border-rose-100/50 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider";
    }
    if (n.includes("english")) {
      return "bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider";
    }
    return "bg-gray-50 text-gray-600 border border-gray-150 rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider";
  };

  if (loading) return <div className="min-h-screen bg-[#f9f9ff]"><FullPageLoader label="Loading your settings…" /></div>;

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-7">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-7 items-start">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-60 bg-white rounded-3xl p-4 border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-1">
            <button
              onClick={() => handleTabClick("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left border-l-[3.5px] cursor-pointer ${
                activeTab === "profile" 
                  ? "border-l-[#3525cd] bg-indigo-50/30 text-[#3525cd]" 
                  : "border-l-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <User size={16} /> Profile
            </button>
            <button
              onClick={() => handleTabClick("academic")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left border-l-[3.5px] text-gray-500 hover:text-gray-900 hover:bg-gray-50/50 border-l-transparent cursor-pointer"
            >
              <GraduationCap size={16} /> Academic Info
            </button>
            <button
              onClick={() => handleTabClick("help")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left border-l-[3.5px] cursor-pointer ${
                activeTab === "help"
                  ? "border-l-[#3525cd] bg-indigo-50/30 text-[#3525cd]"
                  : "border-l-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <HelpCircle size={16} /> How to use
            </button>
            <button
              onClick={() => handleTabClick("account")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left border-l-[3.5px] cursor-pointer ${
                activeTab === "account"
                  ? "border-l-[#3525cd] bg-indigo-50/30 text-[#3525cd]"
                  : "border-l-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              <Shield size={16} /> Account
            </button>
          </div>

          {/* Forms Section */}
          <div className="flex-1 w-full space-y-6">
            
            {activeTab === "profile" && (
              <>
                {/* Personal Info Card */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 space-y-6">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 leading-none">Personal Info</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1.5">Update your photo and personal details here.</p>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-6">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-8 border-b border-gray-50 pb-6">
                      {/* Avatar Editor */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 shadow-inner">
                          <img
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName || 'Student')}`}
                            alt="Student Profile Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold max-w-[120px] text-center leading-normal">Avatar generated from your name</span>
                      </div>

                      {/* Inputs Grid */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-600">Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-gray-250 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-gray-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-600">Email Address</label>
                          <input 
                            type="email" 
                            disabled
                            value={profile.email}
                            className="w-full bg-gray-50/50 border border-gray-200 text-gray-400 rounded-xl p-3 cursor-not-allowed text-sm font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {profileMessage.text && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {profileMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        {profileMessage.text}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        disabled={isSavingProfile || fullName === profile.fullName}
                        className="bg-[#3525cd] hover:bg-[#281bab] disabled:bg-indigo-300 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        {isSavingProfile && <Loader2 size={12} className="animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Academic Setup Card */}
                <div id="academic-setup" className="bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 space-y-6">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100/30 flex items-center justify-center text-rose-500 shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 leading-none">Academic Setup</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1.5">Your current curriculum configuration.</p>
                    </div>
                  </div>

                  <div className="bg-[#eff6ff] border border-blue-100/60 rounded-2xl p-4 flex gap-3 items-start text-blue-700 text-xs font-semibold leading-relaxed animate-in fade-in duration-200">
                    <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                    <p>
                      Changing your class will update your syllabus and progress tracking. <span className="underline cursor-pointer hover:text-blue-800">Learn more</span>
                    </p>
                  </div>

                  {!isEditingAcademic ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Education Board Sub-card */}
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] text-center">
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Education Board</span>
                          <h4 className="text-lg font-black text-gray-900">{profile.boardName || "CBSE"}</h4>
                        </div>
                        <button 
                          onClick={() => setIsEditingAcademic(true)}
                          className="text-xs font-bold text-[#3525cd] hover:text-[#281bab] underline cursor-pointer mt-4"
                        >
                          Change &gt;
                        </button>
                      </div>

                      {/* Current Class Sub-card */}
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] text-center">
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Current Class</span>
                          <h4 className="text-lg font-black text-gray-900">{profile.className || "Class 10"}</h4>
                        </div>
                        <button 
                          onClick={() => setIsEditingAcademic(true)}
                          className="text-xs font-bold text-[#3525cd] hover:text-[#281bab] underline cursor-pointer mt-4"
                        >
                          Change &gt;
                        </button>
                      </div>

                      {/* Active Subjects Sub-card */}
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] text-center">
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-3">Active Subjects</span>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {profile.activeSubjects && profile.activeSubjects.length > 0 ? (
                              profile.activeSubjects.map((sub: any) => (
                                <span key={sub.id} className={getSubjectColorStyle(sub.name)}>
                                  {sub.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold italic">None selected</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsEditingAcademic(true)}
                          className="text-xs font-bold text-[#3525cd] hover:text-[#281bab] underline cursor-pointer mt-4"
                        >
                          Manage &gt;
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Interactive Editing Fields */
                    <div className="space-y-5 bg-gray-50/30 border border-gray-100 rounded-2xl p-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Board</label>
                        <select
                          value={selectedBoard}
                          onChange={(e) => handleBoardChange(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-3 bg-white text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                        >
                          <option value="" disabled>Select Board</option>
                          {boards.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Class</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => handleClassChange(e.target.value)}
                          disabled={!selectedBoard}
                          className="w-full border border-gray-300 rounded-xl p-3 bg-white text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="" disabled>Select Class</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subjects (Select at least one)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {subjects.length === 0 ? (
                            <p className="text-xs text-gray-400 font-bold italic col-span-2 py-2">Select a class first.</p>
                          ) : subjects.map(sub => {
                            const isSelected = selectedSubjects.includes(sub.id);
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => toggleSubject(sub.id)}
                                className={`p-3 rounded-xl border text-left text-xs font-black transition-all cursor-pointer ${
                                  isSelected 
                                    ? "border-[#3525cd] bg-indigo-50/40 text-[#3525cd]" 
                                    : "border-gray-200 text-gray-600 hover:border-indigo-300 bg-white"
                                }`}
                              >
                                {sub.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {showClassChangeWarning && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex gap-3 items-start animate-in zoom-in-95 duration-200">
                          <AlertTriangle className="shrink-0 mt-0.5 text-rose-600" />
                          <div>
                            <h4 className="font-extrabold text-sm mb-1">Warning: Progress Reset</h4>
                            <p className="text-xs font-semibold opacity-90">Changing your Class or Board will permanently reset all your mastery progress and history. Click Save again if you're sure.</p>
                          </div>
                        </div>
                      )}

                      {academicMessage.text && (
                        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${academicMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {academicMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                          {academicMessage.text}
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditingAcademic(false);
                            setSelectedBoard(profile.boardId || "");
                            setSelectedClass(profile.classId || "");
                            setSelectedSubjects(profile.subjectIds || []);
                            setShowClassChangeWarning(false);
                            setAcademicMessage({ text: "", type: "" });
                          }}
                          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          onClick={handleAcademicSave}
                          disabled={isSavingAcademic || selectedSubjects.length === 0}
                          className={`text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer ${
                            showClassChangeWarning ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3525cd] hover:bg-[#281bab]'
                          }`}
                        >
                          {isSavingAcademic && <Loader2 size={12} className="animate-spin" />}
                          {showClassChangeWarning ? "Confirm Reset & Save" : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "help" && (
              <div className="space-y-6">
                {/* Intro */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center text-[#3525cd] shrink-0">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900 leading-none">How to use ShalaOne</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1.5">A quick guide to getting the most out of your study companion.</p>
                    </div>
                  </div>
                </div>

                {/* Feature guide */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 space-y-6">
                  {[
                    {
                      icon: BookOpen,
                      color: "text-[#3525cd] bg-indigo-50",
                      title: "Bookbag (Subjects)",
                      body: "Your textbooks live here. Open any chapter to Read it in the browser or Download the PDF. You only see the subjects you selected — add or remove subjects anytime in Academic Info.",
                    },
                    {
                      icon: MessageCircle,
                      color: "text-blue-600 bg-blue-50",
                      title: "AI Doubt Chat",
                      body: "Pick a subject and chapter, then ask anything. The AI tutor answers using your actual chapter — so it stays on your syllabus and won't make things up. Want the source? Just ask \"which page?\" and it will cite it.",
                    },
                    {
                      icon: Brain,
                      color: "text-violet-600 bg-violet-50",
                      title: "Quizzes",
                      body: "Generate a 10-question quiz for any chapter and take it to test yourself. Your score sets that chapter's progress status (see below). You can retake a quiz anytime to improve.",
                    },
                    {
                      icon: FileText,
                      color: "text-emerald-600 bg-emerald-50",
                      title: "Notes",
                      body: "Upload your own notes as PDF, JPG, or PNG. PDF notes become searchable, so the AI Doubt Chat can also answer using your personal notes — not just the textbook.",
                    },
                    {
                      icon: Flame,
                      color: "text-orange-500 bg-orange-50",
                      title: "Study Streak",
                      body: "Your streak counts the number of days in a row you upload notes. Upload something every day to keep it alive!",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-gray-900">{item.title}</h4>
                          <p className="text-xs font-medium text-gray-500 leading-relaxed">{item.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* How mastery works */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/30 flex items-center justify-center text-amber-500 shrink-0">
                      <Target size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 leading-none">How progress &amp; mastery work</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1.5">Your progress is based on your quiz scores.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <span className="text-lg font-black text-emerald-600">80%+</span>
                      <p className="text-[11px] font-bold text-emerald-700/80 uppercase tracking-wider mt-1">Mastered</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                      <span className="text-lg font-black text-blue-600">60–79%</span>
                      <p className="text-[11px] font-bold text-blue-700/80 uppercase tracking-wider mt-1">In Progress</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                      <span className="text-lg font-black text-amber-600">Below 60%</span>
                      <p className="text-[11px] font-bold text-amber-700/80 uppercase tracking-wider mt-1">Weak</p>
                    </div>
                  </div>

                  <ul className="text-xs font-medium text-gray-500 leading-relaxed space-y-1.5 list-disc pl-5">
                    <li>Score <strong className="text-gray-700">80% or above</strong> on a chapter's quiz to mark it <strong className="text-emerald-600">Mastered</strong>.</li>
                    <li>Your subject completion % = chapters mastered ÷ total chapters.</li>
                    <li>Chapters marked <strong className="text-amber-600">Weak</strong> show up in your dashboard's Focus Areas.</li>
                    <li>Retaking a quiz recalculates the status from your newest score.</li>
                    <li>Only quizzes change progress — reading or asking doubts does not.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-gray-100 space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-none">Account Settings</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1.5">Manage your login status and account details.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                    <h4 className="text-sm font-extrabold text-gray-800 mb-1">Sign Out</h4>
                    <p className="text-xs font-semibold text-gray-400 mb-4">Log out of ShalaOne on this device.</p>
                    <button 
                      onClick={() => logout()}
                      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>

                  <div className="p-4 border border-rose-100 rounded-2xl bg-rose-50/10">
                    <h4 className="text-sm font-extrabold text-rose-800 mb-1">Danger Zone</h4>
                    <p className="text-xs font-semibold text-rose-600/80 mb-4">Account deletion is currently disabled. Please contact your system administrator to remove your data permanently.</p>
                    <button disabled className="bg-rose-50 text-rose-400 px-5 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed opacity-70 border border-rose-100/50">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
