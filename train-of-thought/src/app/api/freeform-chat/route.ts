import { convertToModelMessages, streamText } from "ai";
import { model } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";


export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(req: Request) {
    // return new Response("Internal server error", { status: 500 });

    const ip = req.headers.get("x-forwarded-for") ?? "dev";
    const { limited } = rateLimit(ip);
    if (limited) {
        return new Response("Too many requests", { status: 429 });
    }
    const { messages, depth, cards } = await req.json();
    console.log("cards received:", cards);
    console.log("depth received:", depth);

    const depthInstruction = `
        DEPTH LEVEL: ${depth}
        1 = light, casual exploration — short responses, loose and generative
        2 = structured thinking — moderate detail, some organisation
        3 = deep exploration — thorough, examines angles, surfaces tensions
        Adjust your response length and complexity accordingly.
    `;

    const cardsContext =
        cards && cards.length > 0
            ? `
        LOCKED-IN CONCEPTS:
        The user has already decided the following. Treat them as established facts.
        Do not re-question them. Reference them naturally when relevant.

        ${cards.map((c: any) => `- ${c.title ? `${c.title}: ` : ""}${c.content}`).join("\n")}
        `
            : "";

    const result = streamText({
        model: model,
        system: `
            You are a creative thinking partner inside an app called "Train of Thought".
            Your job is to help the user find and develop ideas through open, generative conversation.

            The user is here because they want inspiration — they may not know what they're looking for yet.
            Your role is to help them discover it, not to hand them a finished answer.

            HOW TO BEHAVE:
            - Keep responses short and focused. One idea at a time.
            - Ask one good question rather than listing ten possibilities.
            - Be curious, not prescriptive. Follow the user's energy.
            - Offer directions, not solutions. Let the user choose what resonates.
            - Avoid bullet-point dumps. Prefer natural, conversational prose.
            - Never use corporate or productivity language.
            - Do not jump into planning, structure or execution unless explicitly asked.

            FLOW:
            - Start by understanding what kind of inspiration they're after — a domain, a feeling, a constraint.
            - Offer a small number of distinct, specific directions (3 at most).
            - Once the user gravitates toward something, go deeper on that thread only.
            - Gradually help them sharpen the idea through questions and gentle reflection.

            ${cardsContext}
            ${depthInstruction}
        `,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}