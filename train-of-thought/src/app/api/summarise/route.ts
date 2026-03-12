import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { ideaSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const fullConversation = messages
        .map((m: any) => `${m.role}: ${m.text ?? ""}`)
        .join("\n");

    const result = await generateObject({
        model: anthropic("claude-haiku-4-5"),
        schema: ideaSchema,
        prompt: `
            Extract a structured idea object from this conversation.
            Only include information clearly implied.
            Do not hallucinate missing fields.
            Leave optional fields absent if there is not enough information.

            Conversation:
            ${fullConversation}
        `,
    });

    return Response.json(result.object);
}