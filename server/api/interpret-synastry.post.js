import Anthropic from '@anthropic-ai/sdk';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return {
      error: 'ANTHROPIC_API_KEY ist nicht konfiguriert',
    };
  }

  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  try {
    const systemPrompt = `Du bist ein erfahrener Beziehungsastrologe, spezialisiert auf Synastrie-Analysen (Partnerhoroskope).

Schreibe eine einfühlsame, aber ehrliche Interpretation der Partnerschaftskompatibilität im Markdown-Format.

Beachte dabei:
- Beginne mit einer Zusammenfassung der Gesamtkompatibilität basierend auf der Punktzahl
- Erkläre die wichtigsten harmonischen Aspekte und was sie für die Beziehung bedeuten
- Besprich auch herausfordernde Aspekte konstruktiv - sie sind Wachstumschancen
- Gliedere nach Kategorien: Emotionale Verbindung, Romantik, Kommunikation, Stabilität, Wachstum
- Gib konkrete Tipps, wie das Paar seine Stärken nutzen und Herausforderungen meistern kann
- Sei ausgewogen - auch niedrige Scores können mit Arbeit funktionieren
- Verwende eine positive, ermutigende Sprache
- Schreibe auf Deutsch
- Verwende Markdown-Formatierung (## für Überschriften, **fett** für Betonung, etc.)
- Halte es prägnant aber aussagekräftig`;

    const aspectsList = body.aspects && Array.isArray(body.aspects)
      ? body.aspects
          .map(
            (aspect) =>
              `${aspect.person1Planet} (${aspect.person1PlanetSign}) ${getAspectNameDE(aspect.aspect)} ${aspect.person2Planet} (${aspect.person2PlanetSign}) - Orbis: ${aspect.orb.toFixed(2)}° - Score: ${aspect.score > 0 ? '+' : ''}${aspect.score} - Kategorie: ${getCategoryNameDE(aspect.category)}`
          )
          .join('\n')
      : 'Keine Aspekte verfügbar';

    const categoryInfo = body.compatibilityScore?.categories
      ? Object.entries(body.compatibilityScore.categories)
          .map(([cat, data]) => `${getCategoryNameDE(cat)}: ${Math.round(data.percentage)}% (${data.count} Aspekte)`)
          .join('\n')
      : '';

    const userPrompt = `Hier ist die Synastrie-Analyse für das Paar:

**Gesamtkompatibilität: ${body.compatibilityScore?.total || 0}/100 Punkte**

**Kategorie-Scores:**
${categoryInfo}

**Aspekt-Statistik:**
- Insgesamt: ${body.compatibilityScore?.aspectCount || 0} Aspekte
- Harmonisch: ${body.compatibilityScore?.positiveAspects || 0} Aspekte
- Herausfordernd: ${body.compatibilityScore?.challengingAspects || 0} Aspekte

**Alle Aspekte (sortiert nach Wichtigkeit):**
${aspectsList}

Bitte erstelle eine umfassende, einfühlsame Synastrie-Interpretation im Markdown-Format.
Fokussiere dich auf die praktische Bedeutung für die Beziehung und gib konkrete Ratschläge.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const interpretation = message.content[0].text;

    return { interpretation };
  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      error: error.message || 'Fehler beim Interpretieren der Synastrie',
    };
  }
});

// Helper functions
function getAspectNameDE(aspect) {
  const aspectNames = {
    conjunction: 'Konjunktion mit',
    sextile: 'Sextil zu',
    square: 'Quadrat zu',
    trine: 'Trigon zu',
    opposition: 'Opposition zu'
  };
  return aspectNames[aspect] || aspect;
}

function getCategoryNameDE(category) {
  const categoryNames = {
    emotional: 'Emotionale Verbindung',
    romance: 'Romantik',
    communication: 'Kommunikation',
    stability: 'Stabilität',
    growth: 'Wachstum',
    other: 'Sonstiges'
  };
  return categoryNames[category] || category;
}
