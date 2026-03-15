import { generateText } from "ai";
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

    const { messages, depth } = await req.json();

    const depthInstruction =
        depth === 1 ? "Keep stage questions broad and simple." :
        depth === 2 ? "Make stage questions moderately specific." :
        "Make stage questions specific and probing.";

    try {
        const { text } = await generateText({
            model,
            messages: [
                {
                    role: "user",
                    content: `Here is a conversation about a creative idea:

                    ${messages.map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n\n")}

                    Analyse this idea and return a JSON object with:
                    1. "stages": an array of 2-5 custom journey stages specific to this project's domain. Each stage has "id" (snake_case), "label" (short), and "question" (one focused question). Never include "The idea" as a stage.
                    2. "brief": an object with "idea" key containing one sentence summarising the idea.

                    ${depthInstruction}

                    Domain examples for stage inspiration:
                    - Novel/writing: voice_tone, characters, world_setting, structure
                    - App/software: core_experience, users_context, technical_shape, scope  
                    - Music/album: sound_mood, themes_lyrics, format_release
                    - Film/video: genre_tone, characters, visual_language, production
                    - Visual art: medium_form, concept_meaning, series_or_standalone
                    - Business/product: the_why, who_its_for, shape_model

                    Return ONLY the JSON object, no explanation, no markdown, no extra text.`,
                },
            ],
        });

        // Extract JSON even if model adds surrounding text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const result = JSON.parse(jsonMatch[0]);
        return Response.json(result);
    } catch (err) {
        console.error("[shape-idea] error:", err);
        return new Response("Internal server error", { status: 500 });
    }
}