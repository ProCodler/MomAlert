import { Ollama } from 'ollama';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    });
    const { models } = await ollama.list();
    return NextResponse.json({
      models: models.map((m) => ({ name: m.name, size: m.size })),
      default: process.env.OLLAMA_MODEL || 'mistral:7b',
    });
  } catch {
    return NextResponse.json(
      { error: 'Ollama not reachable. Run: ollama serve', models: [], default: null },
      { status: 503 },
    );
  }
}
