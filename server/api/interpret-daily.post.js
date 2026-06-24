import {
  PROMPT_VERSION, MODEL, generateInterpretation, hashInput,
} from '../utils/astrology';

// ─── Tageshoroskop nach Lebensbereichen ─────────────────────────────────────
// Persönliche Deutung für GENAU diesen Tag, aufgeteilt in feste Lebensbereiche.
// Jeder Bereich wird als „harmonisch", „herausfordernd" oder „ausgeglichen"
// eingestuft (das Frontend färbt danach). Gecacht pro Profil + Datum über die
// bestehende ChartReading-Tabelle (section = "daily:YYYY-MM-DD").

// Feste Bereiche + Titel (serverseitig vergeben → stabile UI, Reihenfolge fix).
const AREAS = [
  { key: 'liebe',         title: 'Liebe & Beziehung' },
  { key: 'beruf',         title: 'Beruf & Finanzen' },
  { key: 'energie',       title: 'Energie & Körper' },
  { key: 'gefuehle',      title: 'Gefühle & Inneres' },
  { key: 'kommunikation', title: 'Kommunikation & Kontakte' },
];
const AREA_KEYS = AREAS.map((a) => a.key);
const TONES = ['harmonisch', 'herausfordernd', 'ausgeglichen'];

const DAILY_INSTRUCTION = `Du schreibst das persönliche TAGESHOROSKOP für diesen einen Tag – aufgeteilt in Lebensbereiche. Grundlage sind die heutigen Transite zum Geburtshoroskop dieser Person sowie der aktuelle Himmel.

Gib AUSSCHLIESSLICH gültiges JSON zurück – keinen Text davor oder danach, kein Markdown-Codeblock. Exakt diese Struktur:
{
  "intro": "<ein Satz zur Gesamtstimmung des Tages>",
  "areas": [
    { "key": "liebe", "tone": "harmonisch|herausfordernd|ausgeglichen", "text": "<2–3 Sätze>" },
    { "key": "beruf", "tone": "...", "text": "..." },
    { "key": "energie", "tone": "...", "text": "..." },
    { "key": "gefuehle", "tone": "...", "text": "..." },
    { "key": "kommunikation", "tone": "...", "text": "..." }
  ]
}

Fülle GENAU diese fünf Bereiche in dieser Reihenfolge: liebe, beruf, energie, gefuehle, kommunikation.

Ton pro Bereich:
- "harmonisch": die heutigen Konstellationen wirken hier überwiegend unterstützend/fließend (Trigon, Sextil, günstige Konjunktion).
- "herausfordernd": überwiegend Spannung/Reibung (Quadrat, Opposition, fordernde Konjunktion).
- "ausgeglichen": kein klarer Transit prägt diesen Bereich heute – ein ruhiger, neutraler Tag.

text pro Bereich: Du-Form, warm, konkret und alltagsnah, ausschließlich auf HEUTE bezogen. Leite die Aussage nachvollziehbar aus den übergebenen Transiten ab; erfinde keine Konstellationen. Kein Markdown im Text.`;

const formatDailyData = (dateLabel, transits, sky) => {
  const lines = [`Datum: ${dateLabel}`];

  if (sky) {
    lines.push('\nDer Himmel heute:');
    if (sky.phase) lines.push(`- Mondphase: ${sky.phase}`);
    if (sky.moon) lines.push(`- ${sky.moon}`);
    if (sky.sun) lines.push(`- ${sky.sun}`);
  }

  if (Array.isArray(transits) && transits.length) {
    lines.push('\nHeutige Transite zum Geburtshoroskop (stärkste zuerst):');
    for (const t of transits) lines.push(`- ${t}`);
  } else {
    lines.push('\nHeute gibt es keine markanten exakten Transite.');
  }

  return lines.join('\n');
};

// Modell-Text robust in JSON parsen (Codefences / Begleittext tolerieren).
const parseAreas = (text) => {
  let t = (text || '').trim();
  if (t.startsWith('```')) t = t.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  const obj = JSON.parse(t);

  const byKey = new Map((obj.areas || []).map((a) => [a.key, a]));
  const areas = AREAS.map(({ key, title }) => {
    const a = byKey.get(key) || {};
    const tone = TONES.includes(a.tone) ? a.tone : 'ausgeglichen';
    return { key, title, tone, text: String(a.text || '').trim() };
  });
  return { intro: String(obj.intro || '').trim(), areas };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { profileId, date } = body || {};
  const transits = Array.isArray(body?.transits) ? body.transits : [];
  const sky = body?.sky || null;

  if (!profileId || !date) {
    throw createError({ statusCode: 400, statusMessage: 'profileId und date sind erforderlich' });
  }

  const section = `daily:${date}`;
  const prisma = usePrisma();
  const inputHash = hashInput({ transits, sky, areas: AREA_KEYS });

  // 1) DB-Cache prüfen (pro Profil + Tag + Prompt-Version). Alte Einträge in
  //    altem Format (kein gültiges JSON) werden ignoriert → neu erzeugt.
  const existing = await prisma.chartReading.findUnique({
    where: { profileId_section_promptVersion: { profileId, section, promptVersion: PROMPT_VERSION } },
  });
  if (existing && existing.inputHash === inputHash) {
    try {
      return { ...parseAreas(existing.markdown), cached: true };
    } catch { /* veraltetes Format → unten neu generieren */ }
  }

  // 2) Generieren (System-Prompt wird per prompt-caching geteilt)
  const userText = `${DAILY_INSTRUCTION}\n\n<heute>\n${formatDailyData(date, transits, sky)}\n</heute>`;
  let raw;
  try {
    ({ markdown: raw } = await generateInterpretation(userText, { maxTokens: 1200 }));
  } catch (err) {
    console.error('interpret-daily: Anthropic error', err?.status, err?.message);
    throw createError({ statusCode: 502, statusMessage: 'Tageshoroskop konnte nicht erzeugt werden' });
  }

  let parsed;
  try {
    parsed = parseAreas(raw);
  } catch (err) {
    console.error('interpret-daily: JSON parse failed', err?.message);
    throw createError({ statusCode: 502, statusMessage: 'Tageshoroskop konnte nicht erzeugt werden' });
  }

  // 3) Speichern (JSON im markdown-Feld; upsert ersetzt veraltete Einträge)
  const stored = JSON.stringify(parsed);
  await prisma.chartReading.upsert({
    where: { profileId_section_promptVersion: { profileId, section, promptVersion: PROMPT_VERSION } },
    create: { profileId, section, markdown: stored, inputHash, model: MODEL, promptVersion: PROMPT_VERSION },
    update: { markdown: stored, inputHash, model: MODEL, createdAt: new Date() },
  });

  return { ...parsed, cached: false };
});
