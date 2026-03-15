import { convertToModelMessages, streamText } from "ai";
import { model } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") ?? "dev";
    const { limited } = rateLimit(ip);
    if (limited) {
        return new Response("Too many requests", { status: 429 });
    }

    const { messages, depth, activeStageId, activeStageQuestion, stages, brief, isShapingRequest } = await req.json();

    // Strip the silent shaping trigger message — it should never reach the model
    const cleanMessages = isShapingRequest
        ? messages.filter((m: any) => {
              const text = m.parts
                  ?.filter((p: any) => p.type === "text")
                  .map((p: any) => p.text)
                  .join("") ?? m.content ?? "";
              return !(m.role === "user" && text.trim() === "__SHAPE__");
          })
        : messages;

    const depthInstruction = `
        DEPTH LEVEL: ${depth}
        1 = light, conversational — short focused responses
        2 = moderate detail — some structure and elaboration
        3 = deep — thorough, surfaces nuance and tensions
        Adjust response length and complexity accordingly.
    `;

    // Brief context from other stages — so each thread knows what's been established elsewhere
    const briefContext = brief && Object.keys(brief).length > 0
        ? `
        WHAT'S BEEN ESTABLISHED SO FAR:
        ${Object.entries(brief).map(([k, v]) => `- ${k}: ${v}`).join("\n")}
        Reference these naturally when relevant. Do not re-explore what's already settled.
        `
        : "";

    // The user hit "Shape this idea" — read the idea conversation and generate stages
    const shapingInstructions = isShapingRequest
        ? `
        The user has decided they're ready to shape their idea into a structured journey.
        Read the conversation so far carefully.

        Your response must begin with a %%STAGES%% block, then a short acknowledgement.

        Analyse the idea — infer the domain (novel, app, album, film, business, game, artwork, etc.),
        scale, and what dimensions actually matter for THIS specific project.

        Generate 2–5 custom stages that make sense FOR THIS PROJECT ONLY.
        Do not use generic stages. A novel needs different stages than a mobile app.
        Never include "The idea" as a stage — it already exists in the UI.

        Examples of good stages by domain:
        - Novel/writing: Voice & tone, Characters, World & setting, Structure & form
        - App/software: Core experience, Users & context, Technical shape, Scope
        - Album/music: Sound & mood, Themes & lyrics, Format & release
        - Film/video: Genre & tone, Characters, Visual language, Production shape
        - Visual art: Medium & form, Concept & meaning, Series or standalone
        - Event/experience: Audience, Format, Logistics shape
        - Business/product: The why, Who it's for, Shape & model

        Format EXACTLY as (no whitespace outside the block):
        %%STAGES:{"stages":[{"id":"snake_case_id","label":"Short label","question":"One focused question for this stage"}]}%%

        Then write one short paragraph — acknowledge that their journey is ready and they can explore
        each dimension in any order. Keep it warm and brief.

        Also seed the brief with what you already know from the idea conversation:
        %%BRIEF:{"idea":"One clear sentence summarising the idea"}%%
        `
        : "";

    // Per-stage conversation instructions
    const stageInstructions = !isShapingRequest && stages && stages.length > 0
        ? `
        The user is currently exploring stage: "${activeStageId}".
        ${activeStageQuestion ? `The guiding question for this stage is: "${activeStageQuestion}". The user is responding to this — keep that context in mind.` : ""}

        Stay focused on this stage. Ask one question at a time. Keep it conversational.
        Avoid bullet points. No productivity language.

        When you have enough from this stage to write a clear summary, emit at the END of your response:
        %%BRIEF:{"${activeStageId}":"1–2 sentence summary of what was established"}%%
        `
        : !isShapingRequest
        ? `
        The user is in the idea stage — still exploring freely before shaping.
        Be curious and open. Follow their energy. No structure yet.
        Ask one good question at a time. Keep responses short.
        `
        : "";

    const result = streamText({
        model: model,
        system: `
            You are a creative thinking partner inside an app called "Train of Thought".
            Your job is to help users shape and develop their creative ideas and projects
            through focused, thoughtful conversation.

            HOW TO BEHAVE:
            - Be curious and specific, not generic.
            - Ask one question at a time — never list multiple questions.
            - Respond to the actual idea in front of you, not a generic version of it.
            - Keep responses concise. Prefer prose over bullets.
            - Never use corporate or productivity language.
            - Match the energy of the idea.

            BRIEF BLOCKS:
            You can populate the user's live brief using %%BRIEF%% blocks.
            Format: %%BRIEF:{"stage_id":"Summary text"}%%
            - Only emit when you have enough for a clear, specific 1–2 sentence summary.
            - Always place at the END of your message, never mid-response.
            - Capture actual decisions, not vague descriptions.

            ${briefContext}
            ${shapingInstructions}
            ${stageInstructions}
            ${depthInstruction}
        `,
        messages: await convertToModelMessages(cleanMessages),
    });

    return result.toUIMessageStreamResponse();
}
