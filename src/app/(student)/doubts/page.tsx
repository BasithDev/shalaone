"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { getDoubtHistory } from "./actions";
import { getStudentChapters } from "@/lib/queries/chapters";
import { Send, Loader2, Sparkles, Lock, BookOpen, MessageCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";

type Chapter = {
  id: string;
  name: string;
  order: number | null;
  subjectId: string;
  subjectName: string;
  hasBook: boolean;
};

type Message = { question: string; answer: string; createdAt: string | Date };

const SUGGESTIONS = [
  "Summarize this chapter in simple words",
  "What are the key points to remember?",
  "Explain the main idea with an example",
];

export default function DoubtsPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const [history, setHistory] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  // Load chapters; honour a ?chapterId deep-link, else auto-select first subject.
  useEffect(() => {
    getStudentChapters().then((c) => {
      const list = c as Chapter[];
      setChapters(list);

      const params = new URLSearchParams(window.location.search);
      const chId = params.get("chapterId");
      const deepLinked = chId ? list.find((ch) => ch.id === chId) : undefined;

      if (deepLinked) {
        setSelectedSubjectId(deepLinked.subjectId);
        setSelectedChapterId(deepLinked.id);
      } else if (list.length > 0) {
        setSelectedSubjectId(list[0].subjectId);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedChapterId) {
      setLoadingHistory(true);
      getDoubtHistory(selectedChapterId).then((h) => {
        setHistory(h.reverse() as Message[]);
        setLoadingHistory(false);
        setCurrentAnswer("");
      });
    } else {
      setHistory([]);
    }
  }, [selectedChapterId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [currentAnswer, history, isGenerating]);

  const subjects = useMemo(() => {
    const seen = new Map<string, string>();
    for (const ch of chapters) if (!seen.has(ch.subjectId)) seen.set(ch.subjectId, ch.subjectName);
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [chapters]);

  const subjectChapters = useMemo(
    () => chapters.filter((c) => c.subjectId === selectedSubjectId),
    [chapters, selectedSubjectId]
  );

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setSelectedChapterId("");
    setError("");
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedChapterId || isGenerating) return;

    const q = question;
    setQuestion("");
    setPendingQuestion(q);
    setCurrentAnswer("Thinking...");
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: selectedChapterId, question: q }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong generating a response — try again");
        setCurrentAnswer("");
        setIsGenerating(false);
        return;
      }

      setCurrentAnswer("");
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value);
          setCurrentAnswer(acc);
        }
      }

      setHistory((prev) => [...prev, { question: q, answer: acc, createdAt: new Date() }]);
      setCurrentAnswer("");
      setPendingQuestion("");
    } catch {
      setError("Something went wrong generating a response — try again");
      setCurrentAnswer("");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-surface">
      {/* ── Left panel ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-80 shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest">
        <div className="border-b border-outline-variant/40 px-5 py-5">
          <h2 className="text-[20px] font-extrabold tracking-[-0.01em] text-on-surface">Doubt Chat</h2>
          <p className="mt-0.5 text-sm text-on-surface-variant">Pick a subject and chapter to begin</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Subjects */}
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/70">
            Subject
          </p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSubject(s.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-[0.98]",
                  selectedSubjectId === s.id
                    ? "bg-primary-sheen text-on-primary shadow-soft"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Chapters */}
          <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/70">
            Chapter
          </p>
          <ul className="space-y-1">
            {subjectChapters.map((ch) => {
              const active = ch.id === selectedChapterId;
              return (
                <li key={ch.id}>
                  <button
                    disabled={!ch.hasBook}
                    onClick={() => ch.hasBook && setSelectedChapterId(ch.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                      active
                        ? "bg-primary-container/12 text-primary"
                        : ch.hasBook
                        ? "text-on-surface hover:bg-surface-container-low"
                        : "cursor-not-allowed text-on-surface-variant/50"
                    )}
                  >
                    <span className="truncate">{ch.name}</span>
                    {!ch.hasBook && <Lock className="size-3.5 shrink-0" />}
                  </button>
                </li>
              );
            })}
            {subjectChapters.length === 0 && (
              <li className="px-3 py-2 text-sm text-on-surface-variant/70">No chapters in this subject.</li>
            )}
          </ul>

          {/* Past sessions */}
          {selectedChapterId && (
            <div className="mt-8">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/70">
                Past sessions
              </p>
              {loadingHistory ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-on-surface-variant/60" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm italic text-on-surface-variant/70">No previous questions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {[...history].reverse().map((h, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-outline-variant/40 bg-surface-container-low/60 p-3"
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-on-surface">{h.question}</p>
                      <p className="mt-1 text-xs text-on-surface-variant/70">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Chat area ──────────────────────────────────────────── */}
      <section className="flex min-h-0 flex-1 flex-col bg-surface">
        {/* Mobile selectors */}
        <div className="flex gap-2 border-b border-outline-variant/40 bg-surface-container-lowest p-3 md:hidden">
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSelectSubject(e.target.value)}
            className="flex-1 rounded-[8px] border border-outline-variant bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="flex-1 rounded-[8px] border border-outline-variant bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface"
          >
            <option value="" disabled>Chapter…</option>
            {subjectChapters.map((ch) => (
              <option key={ch.id} value={ch.id} disabled={!ch.hasBook}>
                {ch.name}{!ch.hasBook ? " (locked)" : ""}
              </option>
            ))}
          </select>
        </div>

        {!selectedChapterId ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary-container/12 text-primary shadow-soft">
              <MessageCircle size={28} />
            </span>
            <h2 className="text-xl font-extrabold text-on-surface">Welcome to Doubt Chat</h2>
            <p className="mt-2 max-w-md text-on-surface-variant">
              Choose a chapter and ask anything — your AI tutor answers from the whole chapter, in simple words.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-outline-variant/40 bg-surface-container-lowest px-6 py-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-container/12 text-primary">
                <BookOpen className="size-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-[17px] font-bold text-on-surface">{selectedChapter?.name}</h2>
                <p className="truncate text-sm text-on-surface-variant">{selectedChapter?.subjectName}</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 space-y-6 overflow-y-auto scroll-smooth px-4 py-6 md:px-8">
              {history.length === 0 && !isGenerating && (
                <div className="py-8 text-center">
                  <p className="mb-5 font-semibold text-on-surface-variant">
                    Ask your first question about this chapter
                  </p>
                  <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuestion(s)}
                        className="rounded-full border border-primary/30 bg-surface-container-lowest px-4 py-2 text-sm font-medium text-primary shadow-soft transition hover:bg-primary-container/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.map((msg, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary-sheen px-5 py-3 text-[15px] font-medium text-on-primary shadow-soft md:max-w-2xl">
                      {msg.question}
                    </div>
                  </div>
                  <AiBubble>{msg.answer}</AiBubble>
                </div>
              ))}

              {isGenerating && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary-sheen px-5 py-3 text-[15px] font-medium text-on-primary shadow-soft md:max-w-2xl">
                      {pendingQuestion}
                    </div>
                  </div>
                  <AiBubble thinking={currentAnswer === "Thinking..." || currentAnswer === ""}>
                    {currentAnswer === "Thinking..." ? "" : currentAnswer}
                  </AiBubble>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-outline-variant/40 bg-surface-container-lowest px-4 py-4 md:px-8">
              {error && <p className="mx-auto mb-2 max-w-3xl px-2 text-sm font-medium text-error">{error}</p>}
              <form onSubmit={handleAsk} className="mx-auto flex max-w-3xl items-center gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a doubt about this chapter…"
                  disabled={isGenerating}
                  className="flex-1 rounded-full border border-outline-variant bg-surface-container-low px-5 py-3 text-[15px] text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isGenerating}
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-sheen text-on-primary shadow-soft transition hover:shadow-soft-lg hover:brightness-105 active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5 translate-x-px" />}
                </button>
              </form>
              <p className="mt-3 text-center text-xs font-medium text-on-surface-variant/70">
                Answers are AI-generated from your textbook chapter.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function AiBubble({ children, thinking = false }: { children: string; thinking?: boolean }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast("Answer copied", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Couldn't copy", "error");
    }
  };

  return (
    <div className="flex justify-start">
      <div className="group max-w-[90%] rounded-2xl rounded-tl-md border border-primary/10 bg-surface-container-low px-5 py-4 shadow-soft md:max-w-3xl">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" /> AI Tutor
          </span>
          {!thinking && children && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold text-on-surface-variant/70 opacity-0 transition hover:bg-surface-container hover:text-on-surface group-hover:opacity-100"
              aria-label="Copy answer"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        {thinking ? (
          <span className="flex items-center gap-2 font-medium text-on-surface-variant">
            <Loader2 size={16} className="animate-spin text-primary" /> Thinking…
          </span>
        ) : (
          <div className="chat-md text-[15px] text-on-surface">
            <ReactMarkdown>{children}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
