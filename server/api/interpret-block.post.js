import {
  PROMPT_VERSION, MODEL, generateInterpretation,
} from '../utils/astrology';

// Per-element building blocks (planet placements / aspects). Keyed by a stable
// `key` so the same placement is interpreted ONCE and reused across all users.
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { key, label } = body || {};

  if (!key || !label) {
    throw createError({ statusCode: 400, statusMessage: 'key und label sind erforderlich' });
  }

  const prisma = usePrisma();

  // 1) Nutzerübergreifender Cache
  const existing = await prisma.interpretationBlock.findUnique({
    where: { key_promptVersion: { key, promptVersion: PROMPT_VERSION } },
  });
  if (existing) {
    return { markdown: existing.markdown, cached: true };
  }

  // 2) Generieren – kurz & konkret, keine Überschrift
  const userText = `Deute prägnant und alltagsnah (3–5 Sätze, kein Markdown-Heading, du-Form): ${label}.`;
  let markdown;
  try {
    ({ markdown } = await generateInterpretation(userText, { maxTokens: 500 }));
  } catch (err) {
    console.error('interpret-block: Anthropic error', err?.status, err?.message);
    throw createError({ statusCode: 502, statusMessage: 'Deutung konnte nicht erzeugt werden' });
  }

  // 3) Speichern (idempotent gegen Race: bestehenden Eintrag tolerieren)
  await prisma.interpretationBlock.upsert({
    where: { key_promptVersion: { key, promptVersion: PROMPT_VERSION } },
    create: { key, markdown, model: MODEL, promptVersion: PROMPT_VERSION },
    update: {},
  });

  return { markdown, cached: false };
});
