import { db } from "@/lib/db";
import { quizzes, chapters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QuizTaker from "./QuizTaker";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = await params;
  const quizId = resolvedParams.quizId;
  
  const [quiz] = await db.select({
    id: quizzes.id,
    questions: quizzes.questions,
    chapterName: chapters.name,
  })
  .from(quizzes)
  .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
  .where(eq(quizzes.id, quizId));

  if (!quiz) {
    redirect("/quizzes");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{quiz.chapterName} Quiz</h1>
          <p className="text-sm text-gray-500 font-medium">Auto-generated AI Assessment</p>
        </div>
      </header>
      <main className="flex-1 p-8 flex justify-center items-start pt-12">
        <QuizTaker quiz={quiz} />
      </main>
    </div>
  );
}
