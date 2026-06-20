import { db } from "@/lib/db";
import { quizzes, quizAttempts, chapters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, ChevronLeft, RefreshCw, Brain } from "lucide-react";

export default async function QuizResultsPage({ params }: { params: Promise<{ quizId: string, attemptId: string }> }) {
  const resolvedParams = await params;
  
  const [data] = await db.select({
    attemptScore: quizAttempts.score,
    answers: quizAttempts.answers,
    questions: quizzes.questions,
    chapterName: chapters.name,
    chapterId: chapters.id,
  })
  .from(quizAttempts)
  .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
  .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
  .where(and(eq(quizAttempts.id, resolvedParams.attemptId), eq(quizzes.id, resolvedParams.quizId)));

  if (!data) redirect("/quizzes");

  const questions = data.questions as any[];
  const answers = data.answers as number[];
  const maxScore = questions.length;
  const percentage = (data.attemptScore / maxScore) * 100;

  let feedbackMessage = "Let's review this one.";
  let colorTheme = "text-red-600 bg-red-50 border-red-200";
  
  if (percentage >= 80) {
    feedbackMessage = "Nice work! You've mastered this chapter.";
    colorTheme = "text-green-700 bg-green-50 border-green-200";
  } else if (percentage >= 60) {
    feedbackMessage = "Good effort! Keep practicing to reach mastery.";
    colorTheme = "text-yellow-700 bg-yellow-50 border-yellow-200";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <Link href="/quizzes" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
            <ChevronLeft size={20} /> Back to Quizzes
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-bold text-gray-900">{data.chapterName}</h1>
            <p className="text-sm text-gray-500 font-medium">Quiz Results</p>
          </div>
        </div>

        {/* Score Card */}
        <div className={`p-10 rounded-3xl border-2 flex flex-col items-center text-center shadow-sm ${colorTheme}`}>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-inherit">
             <span className="text-4xl font-black">{data.attemptScore}</span>
             <span className="text-xl font-bold text-gray-400 mt-2">/{maxScore}</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-2">{feedbackMessage}</h2>
          <p className="font-medium opacity-80 mb-8 max-w-md">
            Your progress for this chapter has been automatically updated in your study dashboard based on this score.
          </p>
          
          <div className="flex gap-4">
             {/* Retake visually is a link to /quizzes to generate a fresh one, since retake means generating a new one */}
             <Link 
               href="/quizzes" 
               className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold shadow-sm transition-all hover:bg-gray-50 flex items-center gap-2 border border-gray-200"
             >
               <RefreshCw size={18} /> Generate New Quiz
             </Link>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Question Breakdown</h3>
          </div>
          <div className="p-8 space-y-8">
            {questions.map((q, idx) => {
              const studentAnswer = answers[idx];
              const isCorrect = studentAnswer === q.correctIndex;
              
              return (
                <div key={idx} className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="mt-1 shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-500" size={24} />
                      ) : (
                        <XCircle className="text-red-500" size={24} />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-1">Question {idx + 1}</span>
                      <h4 className="text-lg font-bold text-gray-900 leading-snug">{q.question}</h4>
                    </div>
                  </div>

                  <div className="pl-10 space-y-2">
                    {q.options.map((opt: string, optIdx: number) => {
                      let bgColor = "bg-gray-50 border-gray-200 text-gray-600";
                      let badge = null;

                      if (optIdx === q.correctIndex) {
                        bgColor = "bg-green-50 border-green-200 text-green-900 ring-1 ring-green-500";
                        badge = <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded ml-2">Correct Answer</span>;
                      } else if (optIdx === studentAnswer && !isCorrect) {
                        bgColor = "bg-red-50 border-red-200 text-red-900";
                        badge = <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded ml-2">Your Answer</span>;
                      }

                      return (
                        <div key={optIdx} className={`p-4 rounded-xl border flex justify-between items-center ${bgColor}`}>
                          <span className="font-medium">{opt}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
