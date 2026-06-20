"use server";

import { db } from "@/lib/db";
import { profiles, studyProgress, chapters, subjects, boards, classes } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getProfileInfo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (!profile) throw new Error("Profile not found");
  
  const activeProgress = await db.select({ subjectId: chapters.subjectId })
    .from(studyProgress)
    .innerJoin(chapters, eq(studyProgress.chapterId, chapters.id))
    .where(eq(studyProgress.userId, user.id));

  const subjectIds = [...new Set(activeProgress.map(p => p.subjectId))];

  let boardName = "CBSE";
  let className = "Class 10";
  
  if (profile.boardId) {
    const [b] = await db.select({ name: boards.name }).from(boards).where(eq(boards.id, profile.boardId));
    if (b) boardName = b.name;
  }
  
  if (profile.classId) {
    const [c] = await db.select({ name: classes.name }).from(classes).where(eq(classes.id, profile.classId));
    if (c) className = c.name;
  }

  let activeSubjects: Array<{ id: string; name: string }> = [];
  if (subjectIds.length > 0) {
    activeSubjects = await db.select({ id: subjects.id, name: subjects.name })
      .from(subjects)
      .where(inArray(subjects.id, subjectIds));
  }

  return {
    ...profile,
    email: user.email,
    subjectIds,
    boardName,
    className,
    activeSubjects
  };
}

export async function updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await db.update(profiles).set({ fullName }).where(eq(profiles.id, user.id));
    return { success: true };
  } catch (err) {
    console.error("Update profile error:", err);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function updateAcademicInfo(boardId: string, classId: string, newSubjectIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await db.transaction(async (tx) => {
      const [oldProfile] = await tx.select().from(profiles).where(eq(profiles.id, user.id));
      
      const isClassChanged = oldProfile.classId !== classId;

      await tx.update(profiles)
        .set({ boardId, classId })
        .where(eq(profiles.id, user.id));

      if (isClassChanged) {
        await tx.delete(studyProgress).where(eq(studyProgress.userId, user.id));
      } else {
        const existingChapters = await tx.select({ 
          chapterId: studyProgress.chapterId, 
          subjectId: chapters.subjectId 
        })
        .from(studyProgress)
        .innerJoin(chapters, eq(studyProgress.chapterId, chapters.id))
        .where(eq(studyProgress.userId, user.id));

        const existingSubjectIds = [...new Set(existingChapters.map(c => c.subjectId))];
        
        const subjectsToRemove = existingSubjectIds.filter(id => !newSubjectIds.includes(id));
        if (subjectsToRemove.length > 0) {
           const chaptersToRemove = await tx.select({ id: chapters.id })
             .from(chapters)
             .where(inArray(chapters.subjectId, subjectsToRemove));
           const idsToRemove = chaptersToRemove.map(c => c.id);
           if (idsToRemove.length > 0) {
              await tx.delete(studyProgress)
                .where(and(eq(studyProgress.userId, user.id), inArray(studyProgress.chapterId, idsToRemove)));
           }
        }
      }

      if (newSubjectIds.length > 0) {
        const subjectChapters = await tx.select()
          .from(chapters)
          .where(inArray(chapters.subjectId, newSubjectIds));

        if (subjectChapters.length > 0) {
          const progressInserts = subjectChapters.map((chapter) => ({
            userId: user.id,
            chapterId: chapter.id,
            status: "not_started"
          }));

          await tx.insert(studyProgress)
            .values(progressInserts)
            .onConflictDoNothing({ target: [studyProgress.userId, studyProgress.chapterId] });
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Settings transaction error:", error);
    return { success: false, error: "Failed to update academic info." };
  }
}


export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
