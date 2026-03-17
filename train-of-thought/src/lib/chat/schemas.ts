import { z } from "zod";

export const ideaSchema = z.object({
  title: z.string().optional(),
  coreConcept: z.string().optional(),
  audience: z.string().optional(),
  problem: z.string().optional(),
  variations: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
  summary: z.string().optional(),
});

export type Idea = z.infer<typeof ideaSchema>;