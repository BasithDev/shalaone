"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/components/toast";

export default function QuizTaker({ quiz }: { quiz: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = async () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (isLastQuestion) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: quiz.id, answers: newAnswers })
        });
        
        const data = await res.json();
        if (res.ok) {
          router.replace(`/quizzes/${quiz.id}/results/${data.attemptId}`);
        } else {
          toast(data.error || "Failed to submit the quiz.", "error");
          setIsSubmitting(false);
        }
      } catch {
        toast("An error occurred submitting the quiz.", "error");
        setIsSubmitting(false);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const progressPercentage = ((currentIndex) / questions.length) * 100;

  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="p-8 md:p-10">
        <div className="mb-8 flex justify-between items-center text-sm font-bold text-gray-500 uppercase tracking-widest">
          <span>Question {currentIndex + 1} of {questions.length}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-8">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4 mb-10">
          {currentQuestion.options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between ${
                selectedOption === idx 
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-50" 
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-800"
              }`}
            >
              <span className={`text-lg font-medium ${selectedOption === idx ? "text-blue-900" : ""}`}>{opt}</span>
              {selectedOption === idx && <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm"><Check size={14} strokeWidth={3} /></div>}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={selectedOption === null || isSubmitting}
            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-px"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Submitting...</>
            ) : isLastQuestion ? (
              <><Check size={20} /> Submit Quiz</>
            ) : (
              <>Next <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
