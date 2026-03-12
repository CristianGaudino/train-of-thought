import { generateText, Output } from "ai";
import { ideaSchema } from "@/lib/schemas";
import { model } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
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