import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding database...");

  // Clear existing data (cascade will handle related tables)
  await db.delete(schema.boards).where(eq(schema.boards.name, 'CBSE'));

  // Insert Board
  const [board] = await db
    .insert(schema.boards)
    .values({ name: "CBSE" })
    .returning();

  console.log(`Created board: ${board.name}`);

  // Insert Classes
  const classesToInsert = [
    { boardId: board.id, name: "Class 9" },
    { boardId: board.id, name: "Class 10" },
  ];

  const createdClasses = await db
    .insert(schema.classes)
    .values(classesToInsert)
    .returning();

  console.log(`Created classes: ${createdClasses.map((c) => c.name).join(", ")}`);

  // Insert Subjects
  const subjectsToInsert = createdClasses.flatMap((cls) => [
    { classId: cls.id, name: "Mathematics" },
    { classId: cls.id, name: "Science" },
    { classId: cls.id, name: "English" },
  ]);

  const createdSubjects = await db
    .insert(schema.subjects)
    .values(subjectsToInsert)
    .returning();

  console.log(
    `Created subjects: ${createdSubjects.map((s) => s.name).join(", ")}`
  );

  // Insert Chapters for Class 10 Math and Science
  const class10 = createdClasses.find((c) => c.name === "Class 10");
  if (class10) {
    const mathClass10 = createdSubjects.find((s) => s.classId === class10.id && s.name === "Mathematics");
    const scienceClass10 = createdSubjects.find((s) => s.classId === class10.id && s.name === "Science");

    if (mathClass10) {
      await db.insert(schema.chapters).values([
        { subjectId: mathClass10.id, name: "Real Numbers", order: 1 },
        { subjectId: mathClass10.id, name: "Polynomials", order: 2 },
        { subjectId: mathClass10.id, name: "Quadratic Equations", order: 3 },
        { subjectId: mathClass10.id, name: "Trigonometry", order: 4 },
      ]);
      console.log("Created chapters for Class 10 Mathematics");
    }

    if (scienceClass10) {
      await db.insert(schema.chapters).values([
        { subjectId: scienceClass10.id, name: "Light – Reflection and Refraction", order: 1 },
        { subjectId: scienceClass10.id, name: "Acids, Bases and Salts", order: 2 },
        { subjectId: scienceClass10.id, name: "Life Processes", order: 3 },
      ]);
      console.log("Created chapters for Class 10 Science");
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
