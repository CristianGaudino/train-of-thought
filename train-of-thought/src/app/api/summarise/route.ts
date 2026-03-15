import { generateText, Output } from "ai";
import { ideaSchema } from "@/lib/schemas";
import { model } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    // return new Response("Internal server error", { status: 500 });
    const ip = req.headers.get("x-forwarded-for") ?? "dev";
    const { limited } = rateLimit(ip);
    if (limited) {
        return new Response("Too many requests", { status: 429 });
    }
    const { messages } = await req.json();

    const fullConversation = messages
        .map((m: any) => `${m.role}: ${m.text ?? ""}`)
        .join("\n");

    const { output } = await generateText({
        model,
        output: Output.object({ schema: ideaSchema }),
        prompt: `
            Extract a structured idea object from this conversation.
            Only include information clearly implied.
            Do not hallucinate missing fields.
            Leave optional fields absent if there is not enough information.

            Conversation:
            ${fullConversation}
        `,
    });

    return Response.json(output);
}