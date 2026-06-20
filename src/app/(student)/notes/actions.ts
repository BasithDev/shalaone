"use server";

import { db } from "@/lib/db";
import { notes, chapters, subjects } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function getNotesForUser(subjectFilter?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = db.select({
    id: notes.id,
    fileUrl: notes.fileUrl,
    extractedText: notes.extractedText,
    createdAt: notes.createdAt,
    chapterName: chapters.name,
    subjectName: subjects.name
  })
  .from(notes)
  .innerJoin(chapters, eq(notes.chapterId, chapters.id))
  .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
  .where(eq(notes.userId, user.id))
  .orderBy(desc(notes.createdAt));

  const allNotes = await query;
  
  // Create signed URLs for all notes since they are private
  const notesWithUrls = await Promise.all(allNotes.map(async (n) => {
    const { data } = await supabaseAdmin.storage.from('notes').createSignedUrl(n.fileUrl, 3600);
    return {
      ...n,
      signedUrl: data?.signedUrl || null,
      isImage: n.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null,
      isSearchable: n.extractedText !== null
    };
  }));

  if (subjectFilter && subjectFilter !== "All") {
    return notesWithUrls.filter(n => n.subjectName === subjectFilter);
  }
  
  return notesWithUrls;
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get note to check ownership and get file path
  const [note] = await db.select().from(notes).where(and(eq(notes.id, noteId), eq(notes.userId, user.id)));
  if (!note) return { success: false };

  // Delete from storage using admin client to bypass RLS policies
  await supabaseAdmin.storage.from("notes").remove([note.fileUrl]);

  // Delete from DB (cascades to chunks)
  await db.delete(notes).where(eq(notes.id, noteId));
  
  return { success: true };
}

export async function getStreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const userNotes = await db.select({ createdAt: notes.createdAt })
    .from(notes)
    .where(eq(notes.userId, user.id))
    .orderBy(desc(notes.createdAt));

  if (userNotes.length === 0) return 0;

  const dates = [...new Set(userNotes.map(n => {
    const d = new Date(n.createdAt!);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))];

  let streak = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0; // Streak broken
  }

  let currentDate = new Date(dates[0]); // Starts from either today or yesterday
  
  for (let i = 0; i < dates.length; i++) {
    const dStr = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    if (dates[i] === dStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
