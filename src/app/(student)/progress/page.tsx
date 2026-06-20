import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFullSyllabusMap } from "@/lib/queries/progress";
import ProgressClientMap from "./ProgressClientMap";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const syllabusMap = await getFullSyllabusMap(user.id);

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-7">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Progress Analytics</h2>
        </div>

        {/* Dynamic Maps */}
        {syllabusMap.length === 0 ? (
          <div className="bg-white p-12 rounded-[24px] text-center shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Your syllabus is empty</h3>
            <p className="text-gray-500 mt-2 font-medium">Finish onboarding or wait for the admin to add subjects to your class.</p>
          </div>
        ) : (
          <ProgressClientMap syllabusMap={syllabusMap} />
        )}

      </div>
    </div>
  );
}
