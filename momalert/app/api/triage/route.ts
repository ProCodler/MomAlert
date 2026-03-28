import { Ollama } from 'ollama';
import { TRIAGE_SYSTEM_PROMPT, TWI_SYSTEM_PROMPT_ADDON } from '@/lib/claude';
import { extractRisk } from '@/lib/risk';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { messages, language, sessionId, model } = await req.json();

  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const ollamaModel = model || process.env.OLLAMA_MODEL || 'mistral:7b';

  const systemPrompt =
    language === 'tw'
      ? TRIAGE_SYSTEM_PROMPT + TWI_SYSTEM_PROMPT_ADDON
      : TRIAGE_SYSTEM_PROMPT;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      try {
        const ollama = new Ollama({ host: ollamaHost });

        const ollamaStream = await ollama.chat({
          model: ollamaModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ],
          stream: true,
          options: {
            temperature: 0.3,  // lower = more consistent, safer medical responses
            num_predict: 512,
          },
        });

        for await (const chunk of ollamaStream) {
          const text = chunk.message.content;
          if (text) {
            fullText += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'delta', text })}\n\n`,
              ),
            );
          }
        }

        const risk = extractRisk(fullText);

        const sessionCode = sessionId || `session-${Date.now()}`;
        const dbSession = await prisma.session.upsert({
          where: { sessionCode },
          create: {
            sessionCode,
            messages: JSON.stringify(messages),
            riskLevel: risk.level,
            flagged: risk.requiresEscalation,
            language: language || 'en',
          },
          update: {
            messages: JSON.stringify(messages),
            riskLevel: risk.level,
            flagged: risk.requiresEscalation,
            updatedAt: new Date(),
          },
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              risk,
              sessionId: dbSession.sessionCode,
              model: ollamaModel,
            })}\n\n`,
          ),
        );
      } catch (error) {
        const isConnRefused =
          error instanceof Error && error.message.includes('ECONNREFUSED');
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: isConnRefused
                ? 'Cannot reach Ollama. Run: ollama serve'
                : 'Something went wrong. Please try again.',
            })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
