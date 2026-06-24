import {
  PROMPT_VERSION, MODEL, formatChartForPrompt, generateInterpretation, hashInput,
} from '../utils/astrology';

// ─── Gemeinsamer Stil für alle Kapitel der ausführlichen Deutung ────────────
// Wird jedem Kapitel-Fokus vorangestellt. Sorgt für Spannung & Konsistenz.
const CHAPTER_STYLE = `Du schreibst EIN Kapitel einer umfangreichen, psychologisch fundierten Geburtshoroskop-Deutung. Schreibe lebendig, konkret und fesselnd – so, dass die Person unbedingt weiterlesen möchte.

Regeln für dieses Kapitel:
- Schreibe KEINE Überschrift. Beginne direkt mit dem Fließtext.
- Du-Form; warme, klare, psychologisch erklärende Sprache – bildhaft, aber verständlich und geerdet, nicht orakelhaft.
- Erkläre nachvollziehbar: Übersetze jede Konstellation Schritt für Schritt in ihre seelische Bedeutung (Symbol → inneres Muster/Bedürfnis → wie es sich konkret zeigt), damit die Person versteht, WARUM das zu ihr gehört.
- Baue mindestens eine konkrete Alltagsszene oder ein anschauliches Bild ein, in dem sich die Person wiedererkennt.
- Hebe genau einen **Kernsatz** als fettgedruckte Essenz hervor – als eigene, kurze Zeile (nur dieser eine Satz, fett).
- Schließe das Kapitel mit genau einer einladenden Reflexionsfrage in *kursiv* ab, als eigene Zeile, eingeleitet mit „Zum Nachspüren: ".
- Bleibe strikt beim Thema dieses Kapitels; wiederhole keine allgemeinen astrologischen Erklärungen.
- Nutze **Fettung** sonst nur sparsam für Schlüsselbegriffe (Planet in Zeichen/Haus).
- Beziehe dich ausschließlich auf die übergebenen Chart-Daten, erfinde keine Positionen.
- Umfang: ca. 350–550 Wörter.`;

// Die einzelnen Kapitel der ausführlichen Deutung (jeweils ein eigener Call,
// einzeln gecacht → progressives Aufdecken im Frontend, kein Token-Deckel).
const CHAPTERS = {
  himmelsbild: {
    maxTokens: 1400,
    focus: `Thema: „Dein Himmelsbild" – der einladende Auftakt zur gesamten Deutung. Beschreibe das Gesamtgefühl und die Grundstimmung des Charts und den roten Faden, der sich durchzieht. Gehe NOCH NICHT auf einzelne Planeten im Detail ein – das folgt in späteren Kapiteln. Wecke Neugier auf die Reise durch das Horoskop.`,
  },
  temperament: {
    maxTokens: 1400,
    focus: `Thema: „Dein Temperament" – die Element- und Qualitäten-Balance. Deute die Verteilung von Feuer/Erde/Luft/Wasser und von kardinal/fix/beweglich als dein seelisches Grundtemperament: Welche Energie ist im Überfluss da, welche fehlt oder ist selten, und wie fühlt sich diese Mischung im Alltag an (Tempo, Bedürfnisse, Umgang mit Veränderung)?`,
  },
  wesenskern: {
    maxTokens: 1400,
    focus: `Thema: „Wesenskern – Sonne, Mond & Aszendent". Verwebe die Big Three zu einem lebendigen Porträt: Sonne (bewusster Wille & Identität), Mond (Gefühlswelt & Bedürfnisse) und Aszendent (Auftreten & Lebensausrichtung). Zeige ihr Zusammenspiel – wo sie sich stützen, wo sie in Spannung stehen.`,
  },
  persoenliche_planeten: {
    maxTokens: 1500,
    focus: `Thema: „Denken, Lieben & Wollen – Merkur, Venus & Mars". Deute Merkur (Denken & Kommunikation), Venus (Liebe, Werte, Nähe) und Mars (Antrieb, Wille, Begehren) jeweils nach Zeichen und Haus. Wie zeigt sich das ganz konkret in Sprache, Zuneigung und Durchsetzung?`,
  },
  wachstum_struktur: {
    maxTokens: 1400,
    focus: `Thema: „Wachstum & Struktur – Jupiter & Saturn". Jupiter (wo du dich weitest, Sinn, Vertrauen und Glück findest) und Saturn (wo du Reife, Verantwortung und tragfähige Strukturen entwickelst – oft über anfängliche Hürden hinweg) nach Zeichen und Haus.`,
  },
  tiefe_stroemungen: {
    maxTokens: 1400,
    focus: `Thema: „Tiefere Strömungen – Uranus, Neptun & Pluto". Die langsamen, transpersonalen Kräfte: Uranus (Freiheit & Erneuerung), Neptun (Sehnsucht, Intuition, Auflösung) und Pluto (Wandlung & seelische Tiefe). Konzentriere dich auf ihre Häuser – dort werden sie ganz persönlich spürbar.`,
  },
  mondknoten_chiron: {
    maxTokens: 1500,
    focus: `Thema: „Lebensaufgabe & Heilung – Mondknoten & Chiron". Deute den Mondknoten als deine seelische Lebensaufgabe (wohin du wachsen darfst, ausgehend von vertrautem Terrain) und Chiron als die verletzliche Stelle, die zur Quelle deiner Heilkraft und Empathie wird. Verbinde beide zu einem Bild von Wachstum durch Verletzlichkeit.`,
  },
  berufung: {
    maxTokens: 1500,
    focus: `Thema: „Berufung & Wurzeln". Deute die MC/IC-Achse (MC/Himmelsmitte = öffentliche Berufung & Bestimmung; IC = innere Wurzeln & Herkunft) sowie den Chart-Herrscher (Herrscher des Aszendenten) als heimlichen Regisseur deines Lebenswegs. Was ruft dich nach außen, was nährt dich von innen, und wie spielt der Chart-Herrscher hinein?`,
  },
  aspekte: {
    maxTokens: 1500,
    focus: `Thema: „Dein inneres Kräftespiel – die Aspekte". Übersetze die markantesten Aspekte in seelische Themen: Wo fließt Energie mühelos (Trigone/Sextile = Talente)? Wo entsteht produktive Reibung, die zum Wachsen drängt (Quadrate/Oppositionen)? Wo verschmelzen Kräfte (Konjunktionen)? Webe sie zu einem stimmigen Bild, keine bloße Liste.`,
  },
  lebensbereiche: {
    maxTokens: 1900,
    focus: `Thema: „Deine Lebensbereiche". Ausnahme zur Formatregel: Gliedere dieses Kapitel mit GENAU drei \`###\`-Unterüberschriften (keine \`##\`-Hauptüberschrift):
### Liebe & Beziehung
(Venus, Mars, Mond, 5. & 7. Haus) – wie du liebst, was du in Nähe suchst, wohin du in Beziehungen wächst.
### Beruf & Berufung
(MC, Sonne, Saturn, 6. & 10. Haus) – wo deine Talente hinwollen, wie du wirken möchtest.
### Geld & Werte
(2. Haus, Venus, Jupiter) – dein Verhältnis zu Sicherheit, Besitz und dem, was dir wirklich wertvoll ist.
Schreibe je Unterabschnitt konkret und alltagsnah. Einen einzigen **Kernsatz** und die abschließende Reflexionsfrage setzt du für das gesamte Kapitel ans Ende.`,
  },
  entwicklungsweg: {
    maxTokens: 1500,
    focus: `Thema: „Dein Entwicklungsweg" – die große Synthese und der Abschluss der Deutung. Fasse zusammen: deine zentralen Stärken, deine wiederkehrenden Lernaufgaben und der konstruktive Weg, beides zu integrieren – die große Einladung dieses Lebens. Beende das Kapitel mit zwei bis drei besonders ermutigenden, bestärkenden Sätzen.`,
  },
};

const SECTIONS = {
  // Kompakte Kern-Deutung (Heute/Himmel-Screen).
  core: {
    maxTokens: 1500,
    prompt: `Hier ist das Geburtshoroskop. Schreibe eine zusammenhängende, persönliche Kern-Deutung.
Struktur (jeweils mit \`##\`-Überschrift):
1. Wesenskern – verbinde Sonne, Mond und Aszendent (die Big Three) zu einem Gesamtbild.
2. Innere Kräfte – die zwei bis drei prägendsten Planeten-/Häuser-Schwerpunkte.
3. Spannungsfelder & Talente – die markantesten Aspekte und was sie bedeuten.
Verweb die Aussagen zu einem stimmigen Ganzen statt einer Aufzählung. Ca. 300–400 Wörter.`,
  },
};

// Kapitel-Sektionen registrieren (Schlüssel = Kapitel-Key, mit Stil-Präfix).
for (const [key, cfg] of Object.entries(CHAPTERS)) {
  SECTIONS[key] = { maxTokens: cfg.maxTokens, prompt: `${CHAPTER_STYLE}\n\n${cfg.focus}` };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { profileId, chart } = body || {};
  const section = body?.section || 'core';

  if (!profileId || !chart) {
    throw createError({ statusCode: 400, statusMessage: 'profileId und chart sind erforderlich' });
  }
  if (!SECTIONS[section]) {
    throw createError({ statusCode: 400, statusMessage: `Unbekannte section: ${section}` });
  }

  const prisma = usePrisma();
  const inputHash = hashInput(chart);

  // 1) DB-Cache prüfen (pro Profil + Sektion + Prompt-Version)
  const existing = await prisma.chartReading.findUnique({
    where: { profileId_section_promptVersion: { profileId, section, promptVersion: PROMPT_VERSION } },
  });
  if (existing && existing.inputHash === inputHash) {
    return { markdown: existing.markdown, cached: true };
  }

  // 2) Generieren (System-Prompt wird per prompt-caching geteilt)
  const cfg = SECTIONS[section];
  const userText = `${cfg.prompt}\n\n<chart>\n${formatChartForPrompt(chart)}\n</chart>`;
  let markdown;
  try {
    ({ markdown } = await generateInterpretation(userText, { maxTokens: cfg.maxTokens }));
  } catch (err) {
    console.error('interpret-chart: Anthropic error', err?.status, err?.message);
    throw createError({ statusCode: 502, statusMessage: 'Deutung konnte nicht erzeugt werden' });
  }

  // 3) Speichern (upsert: bei geänderten Geburtsdaten wird die Deutung ersetzt)
  await prisma.chartReading.upsert({
    where: { profileId_section_promptVersion: { profileId, section, promptVersion: PROMPT_VERSION } },
    create: { profileId, section, markdown, inputHash, model: MODEL, promptVersion: PROMPT_VERSION },
    update: { markdown, inputHash, model: MODEL, createdAt: new Date() },
  });

  return { markdown, cached: false };
});
