import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStudentLibrary } from "@/lib/queries/library";
import SubjectsClientMap from "./SubjectsClientMap";

export default async function SubjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const library = await getStudentLibrary();

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Header */}
        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Bookbag</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Read or download the textbooks for every chapter in your class.
          </p>
        </div>

        {library.length === 0 ? (
          <div className="bg-white p-12 rounded-[24px] text-center shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Your bookbag is empty</h3>
            <p className="text-gray-500 mt-2 font-medium">
              Finish onboarding or wait for the admin to add subjects and books to your class.
            </p>
          </div>
        ) : (
          <SubjectsClientMap library={library} />
        )}
      </div>
    </div>
  );
}
