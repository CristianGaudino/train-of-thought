import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { ideaSchema } from '@/lib/schemas';

export const runtime = "nodejs";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const fullConversation = messages
        .map((m: any) =>
            `${m.role}: ${
                m.parts?.map((p: any) =>
                    p.type === "text" ? p.text : ""
                ).join("")
            }`
        )
        .join("\n");

    const result = await generateObject({
        model: google("gemma-3-27b-it"),
        schema: ideaSchema,
        prompt: `
            Extract a structured idea object from this conversation.

            Only include information clearly implied.
            Do not hallucinate missing fields.

            Conversation:
            ${fullConversation}
        `
    });

    return Response.json(result.object);
}