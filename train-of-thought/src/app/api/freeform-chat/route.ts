// app/api/generate-idea/route.ts
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// IMPORTANT! Set the runtime to 'edge' for low latency responses
export const runtime = 'edge'; 

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        // model: google('models/gemini-2.5-flash'),
        model: google('gemma-3-27b-it'),
        system: `You are an expert brainstorming assistant. You will help the user explore and refine their ideas through thoughtful questions and suggestions. Be creative, supportive, and engaging.`,
        messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}