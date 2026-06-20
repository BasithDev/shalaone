import { db } from "@/lib/db";
import { profiles, boards, classes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProfileWithAcademicInfo(userId: string) {
  const result = await db.select({
    id: profiles.id,
    fullName: profiles.fullName,
    role: profiles.role,
    boardId: profiles.boardId,
    boardName: boards.name,
    classId: profiles.classId,
    className: classes.name,
  })
  .from(profiles)
  .leftJoin(boards, eq(profiles.boardId, boards.id))
  .leftJoin(classes, eq(profiles.classId, classes.id))
  .where(eq(profiles.id, userId))
  .limit(1);

  if (result.length === 0) return null;
  return result[0];
}
