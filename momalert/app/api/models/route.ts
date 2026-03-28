import { NextResponse } from 'next/server';

const CLOUD_MODELS = [
  { name: 'deepseek-v3.1:671b', label: 'DeepSeek V3.1 671B (Best)' },
  { name: 'gemma3:27b', label: 'Gemma 3 27B (Fast)' },
  { name: 'mistral-large-3:675b', label: 'Mistral Large 3 675B' },
];

export async function GET() {
  const defaultModel = process.env.OLLAMA_MODEL || 'deepseek-v3.1:671b';
  return NextResponse.json({
    models: CLOUD_MODELS,
    default: defaultModel,
  });
}
