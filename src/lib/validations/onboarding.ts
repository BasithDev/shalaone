import { z } from "zod";

export const onboardingSchema = z.object({
  boardId: z.string().uuid("Invalid board selection"),
  classId: z.string().uuid("Invalid class selection"),
  subjectIds: z.array(z.string().uuid("Invalid subject selection")).min(1, "Select at least one subject")
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
