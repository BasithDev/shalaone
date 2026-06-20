"use server";

import { db } from "@/lib/db";
import { boards, classes, subjects, chapters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- BOARDS ---
export async function createBoard(name: string) {
  await db.insert(boards).values({ name });
  revalidatePath("/admin/boards");
}

export async function deleteBoard(id: string) {
  await db.delete(boards).where(eq(boards.id, id));
  revalidatePath("/admin/boards");
}

// --- CLASSES ---
export async function createClass(name: string, boardId: string) {
  await db.insert(classes).values({ name, boardId });
  revalidatePath("/admin/classes");
}

export async function deleteClass(id: string) {
  await db.delete(classes).where(eq(classes.id, id));
  revalidatePath("/admin/classes");
}

// --- SUBJECTS ---
export async function createSubject(name: string, classId: string) {
  await db.insert(subjects).values({ name, classId });
  revalidatePath("/admin/subjects");
}

export async function deleteSubject(id: string) {
  await db.delete(subjects).where(eq(subjects.id, id));
  revalidatePath("/admin/subjects");
}

// --- CHAPTERS ---
export async function createChapter(name: string, subjectId: string, order: number) {
  await db.insert(chapters).values({ name, subjectId, order });
  revalidatePath("/admin/chapters");
}

export async function deleteChapter(id: string) {
  await db.delete(chapters).where(eq(chapters.id, id));
  revalidatePath("/admin/chapters");
}
