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
    const systemPrompt = `Du bist ein erfahrener Astrologe, spezialisiert auf Transit-Deutungen.

Schreibe eine prägnante und hilfreiche Interpretation der aktuellen Transite im Markdown-Format.
Wähle einen mystischen und nicht fachlichen Spachstil, das Horoskop soll jeder verstehen können.

Beachte dabei:
- Beginne mit einer kurzen Zusammenfassung der wichtigsten Transite des Tages
- Erkläre jeden Transit in einer verständlichen Sprache
- Beschreibe die praktischen Auswirkungen auf das tägliche Leben
- Gib konkrete Empfehlungen, wie man die Energien nutzen kann
- Weise auf mögliche Herausforderungen hin
- Unterscheide zwischen harmonischen (Sextil, Trigon) und spannungsreichen (Quadrat, Opposition) Aspekten
- Bei Konjunktionen: erkläre die Verschmelzung der Energien
- Halte dich kurz und prägnant - pro Transit maximal 2-3 Sätze
- Schreibe auf Deutsch
- Verwende Markdown-Formatierung (## für Überschriften, **fett** für Betonung, etc.)`;

    const transitsList = body.transits && Array.isArray(body.transits)
      ? body.transits
          .map(
            (transit) =>
              `Transit ${transit.transitPlanet} (in ${transit.transitPlanetSign}) bildet ${getAspectNameDE(transit.aspect)} zu Natal ${transit.natalPlanet} (in ${transit.natalPlanetSign}) - Orbis: ${transit.orb.toFixed(2)}°`
          )
          .join('\n')
      : 'Keine Transite verfügbar';

    const userPrompt = `Hier sind die aktuellen Transite für ${body.date}:

${transitsList}

Bitte erstelle eine astrologische Interpretation dieser Transite im Markdown-Format.
Fokussiere dich auf die praktische Bedeutung für den Alltag.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3072,
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
      error: error.message || 'Fehler beim Interpretieren der Transite',
    };
  }
});

// Helper function to get German aspect names
function getAspectNameDE(aspect) {
  const aspectNames = {
    conjunction: 'eine Konjunktion',
    sextile: 'ein Sextil',
    square: 'ein Quadrat',
    trine: 'ein Trigon',
    opposition: 'eine Opposition'
  };
  return aspectNames[aspect] || aspect;
}
