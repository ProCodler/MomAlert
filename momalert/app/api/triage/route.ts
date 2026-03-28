import { TRIAGE_SYSTEM_PROMPT, TWI_SYSTEM_PROMPT_ADDON } from '@/lib/claude';
import { extractRisk } from '@/lib/risk';
import { prisma } from '@/lib/prisma';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ollama.com';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'deepseek-v3.1:671b';

export async function POST(req: Request) {
  const { messages, language, sessionId, model } = await req.json();

  const chosenModel = model || DEFAULT_MODEL;

  const systemPrompt =
    language === 'tw'
      ? TRIAGE_SYSTEM_PROMPT + TWI_SYSTEM_PROMPT_ADDON
      : TRIAGE_SYSTEM_PROMPT;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      try {
        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OLLAMA_API_KEY}`,
          },
          body: JSON.stringify({
            model: chosenModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content,
              })),
            ],
            stream: true,
            options: { temperature: 0.3 },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Ollama Cloud error ${response.status}: ${errText}`);
        }

        const reader = response.body!.getReader();
        const dec = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              const text: string = json?.message?.content ?? '';
              if (text) {
                fullText += text;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'delta', text })}\n\n`,
                  ),
                );
              }
            } catch {
              // skip malformed NDJSON line
            }
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
              model: chosenModel,
            })}\n\n`,
          ),
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message:
                error instanceof Error
                  ? error.message
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
