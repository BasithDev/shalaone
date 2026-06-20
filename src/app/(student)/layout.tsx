import { createClient } from "@/lib/supabase/server";
import { getProfileWithAcademicInfo } from "@/lib/queries/profile";
import StudentShell from "./StudentShell";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileWithAcademicInfo(user.id);

  return (
    <StudentShell profile={profile}>
      {children}
    </StudentShell>
  );
}
