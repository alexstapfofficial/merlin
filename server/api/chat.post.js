import Anthropic from '@anthropic-ai/sdk';

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Eingabedaten aus der Anfrage

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
    const systemPrompt = `Du bist ein erfahrener Astrologe. Schreibe eine detaillierte und strukturierte astrologische Analyse im Markdown-Format.

Beachte dabei:
- Gliedere die Analyse in übersichtliche Abschnitte mit Überschriften
- Beginne mit einer Zusammenfassung (Overview)
- Analysiere dann die wichtigsten Planeten und ihre Positionen
- Beschreibe die Bedeutung der Häuser
- Erkläre die wichtigsten Aspekte zwischen den Planeten
- Schließe mit Empfehlungen ab
- Jede Interpretation soll detailliert und verständlich sein
- Schreibe die Analyse auf Deutsch
- Verwende Markdown-Formatierung (## für Überschriften, **fett** für Betonung, etc.)`;

    const userPrompt = `Hier sind die astrologischen Daten:

Geburtstag: ${body.birthdate}
Geburtszeit: ${body.birthtime}
Geburtsort: ${body.birthlocation}

Aszendent: ${body.ascendant || 'Nicht verfügbar'}
Medium Coeli: ${body.mediumcoeli || 'Nicht verfügbar'}

Planeten und ihre Position:
${body.planets && Array.isArray(body.planets)
  ? body.planets
      .map(
        (planet) =>
          `${planet.name} steht im Zeichen ${planet.zodiacSign} auf ${planet.angle.toFixed(2)} Grad.`
      )
      .join('\n')
  : 'Keine Planetendaten verfügbar'}

Hausspitzen und ihre Zeichen:
${body.houses && Array.isArray(body.houses)
  ? body.houses
      .map(
        (house) =>
          `${house.houseNumber}.Hausspitze steht im Zeichen ${house.zodiacSign} auf ${house.angle.toFixed(2)} Grad.`
      )
      .join('\n')
  : 'Keine Häuserdaten verfügbar'}

Aspekte zwischen den Planeten:
${body.aspects && Array.isArray(body.aspects)
  ? body.aspects
      .map(
        (aspect) =>
          `${aspect.planets[0]} formt eine ${aspect.aspect} mit ${aspect.planets[1]} mit einem Orbis von ${aspect.exactAngle.toFixed(2)} Grad.`
      )
      .join('\n')
  : 'Keine Aspektdaten verfügbar'}

Bitte erstelle eine umfassende astrologische Analyse dieser Daten im Markdown-Format.`;

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

    // Extrahiere den Text aus der Claude-Antwort
    const generatedHoroscope = message.content[0].text;

    // Rückgabe des generierten Horoskops
    return { horoscope: generatedHoroscope };
  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      error: error.message || 'Fehler beim Generieren des Horoskops',
    };
  }
});
