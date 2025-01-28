// app/api/chat/route.ts
import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  apiKey: string;
  model: string;
}

const CHUNK_SIZE = 3; // افزایش سایز chunk برای عملکرد بهتر
const STREAM_DELAY = 10; // کاهش تاخیر

function getHfClient(apiKey: string) {
  return new HfInference(apiKey);
}

export async function POST(req: Request) {
  try {
    const { messages, apiKey, model } = await req.json() as ChatRequest;

    if (!apiKey || !model) {
      return NextResponse.json(
        { error: 'API key and model are required' },
        { status: 400 }
      );
    }

    const hf = getHfClient(apiKey);
    const prompt = messages
      .slice(-3)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const response = await hf.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
        do_sample: true,
      },
    });

    const text = response.generated_text;
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < text.length; i += CHUNK_SIZE) {
            const chunk = text.slice(i, i + CHUNK_SIZE);
            controller.enqueue(encoder.encode(chunk));
            await new Promise(resolve => setTimeout(resolve, STREAM_DELAY));
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 30;