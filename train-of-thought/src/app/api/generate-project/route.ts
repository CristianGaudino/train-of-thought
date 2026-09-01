import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const runtime = "nodejs";

// ─── Output schema ────────────────────────────────────────────────────────────

const projectSchema = z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["Not Started", "Planning", "In Progress", "Review", "Done"]).default("Planning"),
    tags: z.array(z.string()).default([]),
    sections: z.array(
        z.object({
            title: z.string(),
            tasks: z.array(
                z.object({
                    title:    z.string(),
                    priority: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
                    notes:    z.string().optional(),
                    subtasks: z.array(
                        z.object({
                            label: z.string(),
                            done:  z.boolean().default(false),
                        })
                    ).default([]),
                })
            ),
        })
    ),
});

export type GeneratedProject = z.infer<typeof projectSchema>;

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    const body = await req.json();
    const { source, idea, stages, brief } = body;

    let prompt = "";

    if (source === "freeform" && idea) {
        // Build from summarised Idea object
        const parts: string[] = [];
        if (idea.title)       parts.push(`Title: ${idea.title}`);
        if (idea.coreConcept) parts.push(`Core concept: ${idea.coreConcept}`);
        if (idea.summary)     parts.push(`Summary: ${idea.summary}`);
        if (idea.problem)     parts.push(`Problem: ${idea.problem}`);
        if (idea.audience)    parts.push(`Audience: ${idea.audience}`);
        if (idea.variations?.length)
            parts.push(`Directions explored:\n${idea.variations.map((v: string) => `- ${v}`).join("\n")}`);
        if (idea.openQuestions?.length)
            parts.push(`Open questions:\n${idea.openQuestions.map((q: string) => `- ${q}`).join("\n")}`);

        prompt = `
You are helping turn a brainstormed idea into a structured project plan.

Here is the idea that was explored in a freeform thinking session:

${parts.join("\n\n")}

Create a practical, actionable project plan from this idea.
The plan should feel grounded — not a wishlist, but something the person could actually start working on.
        `.trim();

    } else if (source === "structured" && stages && brief) {
        // Build from structured session stages + brief
        const stageLines = stages.map((s: { label: string; id: string }) => {
            const content = brief[s.id];
            return content
                ? `${s.label}:\n${content}`
                : `${s.label}: (not yet explored)`;
        });

        const ideaContent = brief["idea"];

        prompt = `
You are helping turn a structured thinking session into a project plan.

The user has been working through their idea in a structured way. Here is what they've developed:

${ideaContent ? `The idea:\n${ideaContent}\n\n` : ""}${stageLines.join("\n\n")}

Create a practical, actionable project plan that reflects the thinking they've done.
Use the stages and brief content to inform the sections and tasks — map the structure they've already built onto a project structure.
        `.trim();

    } else {
        return new Response("Invalid request body", { status: 400 });
    }

    try {
        const { output } = await generateText({
            model: anthropic("claude-haiku-4-5"),
            output: Output.object({ schema: projectSchema }),
            prompt: `
${prompt}

Rules:
- Create 2–5 sections that represent logical phases or areas of work
- Each section should have 2–6 concrete, actionable tasks
- Task titles should be specific and start with a verb (e.g. "Research competitors", "Write first draft")
- Priorities: use Critical sparingly, High for things needed early, Medium for standard work, Low for nice-to-haves
- Tags: 1–3 short tags that describe the project type (e.g. "Design", "Research", "Personal")
- Status should be "Planning" unless the brief clearly indicates work has already started
- Description: 1–2 sentences, plain language, captures what the project is and why it matters
- Do not include placeholder tasks like "Define goals" — be specific to the actual idea
- notes: optional one-line clarification on a task, only when it genuinely adds detail
- subtasks: optional 2–4 concrete checklist steps for tasks that clearly break down; omit for simple tasks
            `.trim(),
        });

        return Response.json(output);

    } catch (err) {
        console.error("[POST /api/generate-project]", err);
        return new Response("Failed to generate project", { status: 500 });
    }
}
