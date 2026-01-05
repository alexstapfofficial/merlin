import axios from 'axios';

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Eingabedaten aus der Anfrage
  
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Das JSON-Template für die astrologische Analyse
  const horoscopeTemplate = {
    overview: {
      summary: "",
      dominant_sign: "",
      dominant_planet: "",
    },
    houses: [],
    planets: [],
    aspects: [],
    recommendations: [],
  };

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Du bist ein erfahrener Astrologe. Schreibe eine detaillierte und strukturierte astrologische Analyse in JSON-Format. Halte dich an das folgende Schema:

            ${JSON.stringify(horoscopeTemplate, null, 2)}

            Beachte dabei:
            - Jede Interpretation zu einem Haus und zu einem Planeten soll genau 700 Zeichen (inklusive Leerzeichen) umfassen.
            - Schreibe die Analyse auf Deutsch.
            - Fülle jedes Feld mit klaren und präzisen Interpretationen aus.
            `,
          },
          {
            role: 'user',
            content: `Hier sind die astrologischen Daten:
            Geburtstag: ${body.birthdate}
            Geburtszeit: ${body.birthtime}
            Geburtsort: ${body.birthlocation}

            Aszendent: ${body.ascendant}
            Medium Coeli: ${body.mediumcoeli}

            Planeten und ihre Position:
            ${body.planets
              .map(
                (planet) =>
                  `${planet.planet} steht im Zeichen ${planet.sign} im ${planet.house}.Haus auf ${planet.degree} Grad.`
              )
              .join('\n')}

            Hausspitzen und ihre Zeichen:
            ${body.houses
              .map(
                (house) =>
                  `${house.houseNumber}.Hausspitze steht im Zeichen ${house.zodiacSign} auf ${house.angle} Grad.`
              )
              .join('\n')}

            Aspekte zwischen den Planeten:
            ${body.aspects
              .map(
                (aspect) =>
                  `${aspect.planets[0]} formt eine ${aspect.aspect} mit ${aspect.planets[1]} mit einem Orbis von ${aspect.degree} Grad.`
              )
              .join('\n')}
            `,
          },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // JSON-Antwort von OpenAI
    const generatedHoroscope = JSON.parse(response.data.choices[0].message.content);

    // Rückgabe des generierten Horoskops
    return { horoscope: generatedHoroscope };
  } catch (error) {
    return {
      error: error.response?.data || error.message,
    };
  }
});
