"use server";

import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { boards, classes, subjects, profiles, studyProgress, chapters } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function getBoards() {
  return await db.select().from(boards);
}

export async function getClassesForBoard(boardId: string) {
  if (!boardId) return [];
  return await db.select().from(classes).where(eq(classes.boardId, boardId));
}

export async function getSubjectsForClass(classId: string) {
  if (!classId) return [];
  return await db.select().from(subjects).where(eq(subjects.classId, classId));
}

export async function checkOnboardingStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { requireOnboarding: false, isError: true };

  const { data: profile } = await supabase.from('profiles').select('board_id').eq('id', user.id).single();
  return { requireOnboarding: !profile?.board_id, isError: false };
}

export async function completeOnboarding(boardId: string, classId: string, subjectIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validation = onboardingSchema.safeParse({ boardId, classId, subjectIds });
  if (!validation.success) {
    return { success: false, error: "Invalid selection data" };
  }

  const payload = validation.data;

  try {
    await db.transaction(async (tx) => {
      // 1. Create or update the profile (upsert) so onboarding works even if the
      //    profile row wasn't created yet right after signup verification.
      await tx
        .insert(profiles)
        .values({
          id: user.id,
          role: "student",
          fullName: (user.user_metadata?.full_name as string) ?? null,
          boardId: payload.boardId,
          classId: payload.classId,
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: { boardId: payload.boardId, classId: payload.classId },
        });

      // 2. Fetch all chapters for selected subjects
      const subjectChapters = await tx.select()
        .from(chapters)
        .where(inArray(chapters.subjectId, payload.subjectIds));

      // 3. Create study_progress rows if there are any chapters
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
    });

    return { success: true };
  } catch (error) {
    console.error("Onboarding transaction error:", error);
    return { success: false, error: "Failed to save onboarding data. Please try again." };
  }
}
