import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

// Creates the student's profile row after their email is verified (or after an
// auto-confirmed signup). Idempotent — safe to call more than once.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.select().from(profiles).where(eq(profiles.id, user.id));
  if (existing.length === 0) {
    await db.insert(profiles).values({
      id: user.id,
      role: "student",
      fullName: (user.user_metadata?.full_name as string) ?? null,
    });
  }

  return NextResponse.json({ success: true });
}
