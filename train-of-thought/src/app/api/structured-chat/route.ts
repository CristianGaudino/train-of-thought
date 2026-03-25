import { convertToModelMessages, streamText } from "ai";
import { model } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 30;
export const runtime = "nodejs";

// Per-stage coaching: what does a sharp question look like for each stage archetype?
// Keyed by rough label match (lowercased). Falls back to generic if no match.
function getStageCoaching(stageLabel: string, stageQuestion: string): string {
    const label = stageLabel?.toLowerCase() ?? "";

    if (label.includes("voice") || label.includes("tone") || label.includes("style")) return `
        You're helping the user find the voice of their work — not describe it abstractly, but feel it.
        Don't ask "what tone do you want?" Ask about a specific piece of writing, music, or film they love,
        and what it does that they want to steal. Or ask them to imagine a line of dialogue from their work
        and say it out loud — what does it sound like? Ground the abstract in the concrete.
    `;
    if (label.includes("character") || label.includes("people") || label.includes("users")) return `
        You're helping the user find who lives in this world — or who this is for.
        Don't ask for demographics or archetypes. Ask about one specific person, real or imagined.
        What does that person want that they'd never admit? What do they do on a bad day?
        The more specific the person, the more real the work becomes.
    `;
    if (label.includes("world") || label.includes("setting") || label.includes("context")) return `
        You're helping the user locate their idea in a place and time — physical, cultural, emotional.
        Don't ask "what's the setting?" Ask what the air smells like, what the light is doing,
        what people argue about, what they take for granted. The world is built in details.
    `;
    if (label.includes("structure") || label.includes("form") || label.includes("shape")) return `
        You're helping the user find the container for their idea — the shape that makes it legible.
        Don't ask about format generically. Ask: where does it start (not at the beginning)?
        What happens at the halfway point? What's the last image or moment?
        Form and content aren't separate — push them to find how the structure IS the meaning.
    `;
    if (label.includes("sound") || label.includes("music") || label.includes("mood")) return `
        You're helping the user find the sonic world of their project.
        Don't ask about genre. Ask: what song would play in the first scene, or the last?
        What's the tempo of the emotion — is this a slow build or a sudden drop?
        Ask them to describe the feeling of the sound before the sound itself.
    `;
    if (label.includes("scope") || label.includes("scale") || label.includes("technical")) return `
        You're helping the user find the real edges of their idea — what's in and what's out.
        Don't ask about features or tech stack. Ask: what's the ONE thing it has to do brilliantly?
        What would you cut if you could only keep half? Where's the simplest version that still matters?
    `;
    if (label.includes("why") || label.includes("purpose") || label.includes("meaning")) return `
        You're helping the user find the real reason this exists.
        Don't ask "what's the mission?" Ask: who would be worse off if this didn't exist?
        What problem are they personally tired of living with? Is this something they want to make,
        or something they feel they have to make? That difference matters enormously.
    `;

    // Generic fallback — still more specific than the original
    return `
        Ask about the most specific, concrete aspect of what the user just said.
        Never ask a question that could apply to any project.
        Name something from their actual words and push on it.
        One question. No lists.
    `;
}

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

    // Depth is a creative mode, not just length
    const depthInstruction = `
        DEPTH LEVEL: ${depth}
        1 — Conversational: short, warm, keep it moving. One small question at a time.
            Don't push too hard — let the user find their footing.
        2 — Reflective: notice patterns across what's been said. Name what seems to be emerging.
            Ask the question that connects this stage to something they said earlier.
        3 — Rigorous: take the idea seriously and test it. Ask the uncomfortable question.
            What assumption is the whole thing resting on? What would need to be true for this to work?
            Push back constructively. Surface the tension.
    `;

    // Brief context — give each stage thread awareness of what's been settled elsewhere
    const briefContext = brief && Object.keys(brief).length > 0
        ? `
        WHAT'S BEEN ESTABLISHED SO FAR:
        ${Object.entries(brief).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

        Do not re-explore settled ground. Build on it. Reference it specifically when it's relevant
        to what the user is saying now.
        `
        : "";

    // Shaping: analyse the conversation and generate bespoke stages
    const shapingInstructions = isShapingRequest
        ? `
        The user is ready to shape their idea into a structured creative journey.
        Read the full conversation carefully before generating anything.

        Your response must begin with a %%STAGES%% block, then a short human response.

        GENERATING STAGES:
        Infer the domain (novel, app, album, film, business, game, artwork, event, etc.),
        the scale, and crucially — what dimensions are actually unresolved or generative for THIS idea.
        Don't generate stages for things that are already obvious or settled.

        Generate 2–5 stages. Each stage should be a creative lens, not a project management bucket.
        Name them like a thoughtful collaborator would, not like a consultant.
        Never include "The idea" as a stage.

        Good stages feel specific to this project. Bad stages feel like a template.

        Examples by domain (use as inspiration only — derive the real ones from the conversation):
        - Novel: Voice & tone, The protagonist's wound, World logic, Structure & time
        - App: The core moment, Who it's really for, What it replaces, The hard constraint
        - Album: The emotional arc, Sound world, What it's reacting against, Format & release
        - Film: The image at the centre, Character want vs need, Tone & genre tension, Production shape
        - Visual art: Material & process, The question it's asking, Series or singular, Audience & context
        - Event: The feeling you're creating, Who it's for and who it's not, The one unforgettable moment
        - Business: The real problem, Who suffers without this, The simplest version, Why now

        Format EXACTLY as (no whitespace outside the block):
        %%STAGES:{"stages":[{"id":"snake_case_id","label":"Short label","question":"One focused, specific question for this stage — not generic"}]}%%

        Then write one short paragraph — warm, specific to their idea. Tell them what you noticed
        about the idea and what the journey ahead might open up. Don't list the stages back.

        Seed the brief with what's already clear from the conversation:
        %%BRIEF:{"idea":"One sharp sentence — the idea as it's emerged, with its specific texture"}%%
        `
        : "";

    // Per-stage conversation
    const activeStage = stages?.find((s: any) => s.id === activeStageId);
    const activeStageLabel = activeStage?.label ?? "";
    const stageCoaching = !isShapingRequest && stages?.length > 0
        ? getStageCoaching(activeStageLabel, activeStageQuestion)
        : "";

    const stageInstructions = !isShapingRequest && stages && stages.length > 0
        ? `
        The user is currently in the "${activeStageLabel}" stage.
        ${activeStageQuestion ? `The opening question for this stage is: "${activeStageQuestion}".` : ""}

        YOUR ROLE IN THIS STAGE:
        ${stageCoaching}

        CONVERSATION RULES:
        - One question per response. Never two.
        - Your question must name something specific from what the user just said.
          A question that could apply to any project is a failure.
        - Keep responses short and direct. No bullet points. No summaries.
        - Don't restate the guiding question if they've already answered it — go deeper.
        - Follow the most alive thing in their last message, not the most complete or logical thing.

        When you have enough from this stage for a real, specific summary — not before —
        emit at the END of your response:
        %%BRIEF:{"${activeStageId}":"1–2 sentences capturing what was actually decided or discovered — specific, not vague"}%%
        `
        : !isShapingRequest
        ? `
        The user is still in the idea stage — exploring freely before anything is shaped.
        Your job is to find the spark in what they're saying and help them feel it more clearly.
        Don't structure. Don't plan. Don't offer a list of directions unless they're genuinely lost.
        Ask the one question that names something specific and strange in what they just said.
        Keep it short. Follow their energy, not a process.
        `
        : "";

    const result = streamText({
        model: model,
        system: `
            You are a creative thinking partner inside an app called "Train of Thought".
            Think of yourself as a great editor and collaborator — someone who takes ideas seriously,
            finds what's most alive in them, and asks the question that opens the next door.

            You are not a project manager. You are not a coach. You don't run people through frameworks.
            You have a conversation with them about their actual idea, in its specific texture and strangeness.

            HOW TO BEHAVE:
            - Respond to what's actually in front of you, not a generic version of it.
            - Every question you ask must be earned by something specific the user said.
              If your question could apply to anyone, rewrite it until it couldn't.
            - Short responses are almost always better. Say one true thing, then stop.
            - Never use bullets. Never use headers. Never use productivity language.
            - Don't tell the user what you're about to do. Just do it.
            - Match the register of the idea: playful ideas get playful engagement,
              serious ideas get serious engagement.

            BRIEF BLOCKS:
            You can update the user's live brief using %%BRIEF%% blocks.
            Format: %%BRIEF:{"stage_id":"Summary text"}%%
            - Only emit when you genuinely have enough for something specific and true.
            - Always at the END of your message, never mid-response.
            - Write the summary as a decision or discovery, not a description.
              Bad: "The user wants a warm, intimate tone."
              Good: "The voice is close and slightly unreliable — like someone telling a story they're
                     still figuring out as they go."

            ${briefContext}
            ${shapingInstructions}
            ${stageInstructions}
            ${depthInstruction}
        `,
        messages: await convertToModelMessages(cleanMessages),
    });

    return result.toUIMessageStreamResponse();
}
