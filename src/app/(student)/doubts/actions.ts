"use server";

import { db } from "@/lib/db";
import { doubtSessions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getDoubtHistory(chapterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return await db.select()
    .from(doubtSessions)
    .where(and(eq(doubtSessions.chapterId, chapterId), eq(doubtSessions.userId, user.id)))
    .orderBy(desc(doubtSessions.createdAt));
}
