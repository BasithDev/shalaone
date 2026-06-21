import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "./auth";
import { quizSchema } from "./quiz";
import { onboardingSchema } from "./onboarding";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("signupSchema", () => {
  const valid = {
    fullName: "Asha Rao",
    email: "asha@example.com",
    password: "supersecret",
    confirmPassword: "supersecret",
  };

  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a short password", () => {
    expect(signupSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" }).success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const res = signupSchema.safeParse({ ...valid, confirmPassword: "different1" });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(signupSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
});

describe("quizSchema", () => {
  const q = { question: "2+2?", options: ["1", "2", "3", "4"], correctIndex: 3 };

  it("accepts 1–10 well-formed questions", () => {
    expect(quizSchema.safeParse({ questions: [q] }).success).toBe(true);
  });

  it("rejects questions that don't have exactly 4 options", () => {
    expect(quizSchema.safeParse({ questions: [{ ...q, options: ["a", "b", "c"] }] }).success).toBe(false);
  });

  it("rejects a correctIndex outside 0–3", () => {
    expect(quizSchema.safeParse({ questions: [{ ...q, correctIndex: 4 }] }).success).toBe(false);
  });

  it("rejects more than 10 questions", () => {
    expect(quizSchema.safeParse({ questions: Array(11).fill(q) }).success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("accepts valid UUIDs with at least one subject", () => {
    expect(onboardingSchema.safeParse({ boardId: UUID, classId: UUID, subjectIds: [UUID] }).success).toBe(true);
  });

  it("rejects empty subject selection", () => {
    expect(onboardingSchema.safeParse({ boardId: UUID, classId: UUID, subjectIds: [] }).success).toBe(false);
  });

  it("rejects non-UUID ids", () => {
    expect(onboardingSchema.safeParse({ boardId: "x", classId: UUID, subjectIds: [UUID] }).success).toBe(false);
  });
});
