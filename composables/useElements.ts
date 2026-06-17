export const useElements = () => {
  // Mapping von Sternzeichen zu Elementen (Englisch)
  const ELEMENT_MAP = {
    'Aries': 'fire',
    'Taurus': 'earth',
    'Gemini': 'air',
    'Cancer': 'water',
    'Leo': 'fire',
    'Virgo': 'earth',
    'Libra': 'air',
    'Scorpio': 'water',
    'Sagittarius': 'fire',
    'Capricorn': 'earth',
    'Aquarius': 'air',
    'Pisces': 'water'
  };

  // Deutsche Namen für die Anzeige
  const elementNames = {
    'fire': 'Feuer',
    'earth': 'Erde',
    'air': 'Luft',
    'water': 'Wasser'
  };

  // Gewichtung der Planeten nach astrologischer Bedeutung
  const PLANET_WEIGHTS = {
    'Sun': 4,      // Kernidentität
    'Moon': 4,     // Emotionale Natur
    'Mercury': 2,  // Denken, Kommunikation
    'Venus': 2,    // Liebe, Werte
    'Mars': 2,     // Energie, Durchsetzung
    'Jupiter': 1,  // Expansion, Glück
    'Saturn': 1,   // Struktur, Disziplin
    'Uranus': 0.5, // Innovation
    'Neptune': 0.5,// Spiritualität
    'Pluto': 0.5   // Transformation
  };

  // Berechne die Element-Verteilung basierend auf Geburts- und Transit-Planeten
  const calculateCombinedElementDistribution = (
    birthPlanetaryPositions: any,
    transitPlanetaryPositions: any
  ) => {
    if (
      !birthPlanetaryPositions || !Array.isArray(birthPlanetaryPositions) ||
      !transitPlanetaryPositions || !Array.isArray(transitPlanetaryPositions)
    ) {
      return {
        fire: { points: 0, planets: [] },
        earth: { points: 0, planets: [] },
        air: { points: 0, planets: [] },
        water: { points: 0, planets: [] }
      };
    }

    const distribution = {
      fire: { points: 0, planets: [] as string[] },
      earth: { points: 0, planets: [] as string[] },
      air: { points: 0, planets: [] as string[] },
      water: { points: 0, planets: [] as string[] }
    };

    // 1. Zähle Geburtsplaneten (höheres Gewicht - Grundenergie)
    birthPlanetaryPositions.forEach((planetData: any) => {
      const planetName = planetData.name;
      const sign = planetData.zodiacSign;
      const element = ELEMENT_MAP[sign as keyof typeof ELEMENT_MAP];
      const baseWeight = PLANET_WEIGHTS[planetName as keyof typeof PLANET_WEIGHTS] || 0;
      const weight = baseWeight * 1.5; // Geburtsplaneten haben 1.5x Gewicht

      if (element && distribution[element as keyof typeof distribution]) {
        distribution[element as keyof typeof distribution].points += weight;
        distribution[element as keyof typeof distribution].planets.push(`${planetName} (Natal)`);
      }
    });

    // 2. Zähle Transit-Planeten (Standard-Gewicht - aktuelle Energie)
    transitPlanetaryPositions.forEach((planetData: any) => {
      const planetName = planetData.name;
      const sign = planetData.zodiacSign;
      const element = ELEMENT_MAP[sign as keyof typeof ELEMENT_MAP];
      const weight = PLANET_WEIGHTS[planetName as keyof typeof PLANET_WEIGHTS] || 0;

      if (element && distribution[element as keyof typeof distribution]) {
        distribution[element as keyof typeof distribution].points += weight;
        distribution[element as keyof typeof distribution].planets.push(`${planetName} (Transit)`);
      }
    });

    return distribution;
  };

  // Berechne die Element-Verteilung nur für Transit-Planeten
  const calculateElementDistribution = (transitPlanetaryPositions: any) => {
    if (!transitPlanetaryPositions || !Array.isArray(transitPlanetaryPositions)) {
      return {
        fire: { points: 0, planets: [] },
        earth: { points: 0, planets: [] },
        air: { points: 0, planets: [] },
        water: { points: 0, planets: [] }
      };
    }

    const distribution = {
      fire: { points: 0, planets: [] as string[] },
      earth: { points: 0, planets: [] as string[] },
      air: { points: 0, planets: [] as string[] },
      water: { points: 0, planets: [] as string[] }
    };

    // Zähle die Planeten in jedem Element
    transitPlanetaryPositions.forEach((planetData: any) => {
      const planetName = planetData.name;
      const sign = planetData.zodiacSign;
      const element = ELEMENT_MAP[sign as keyof typeof ELEMENT_MAP];
      const weight = PLANET_WEIGHTS[planetName as keyof typeof PLANET_WEIGHTS] || 0;

      if (element && distribution[element as keyof typeof distribution]) {
        distribution[element as keyof typeof distribution].points += weight;
        distribution[element as keyof typeof distribution].planets.push(planetName);
      }
    });

    return distribution;
  };

  // Berechne Prozentuale Verteilung
  const calculatePercentages = (distribution: any) => {
    const total = Object.values(distribution).reduce((sum: number, val: any) => sum + val.points, 0);

    if (total === 0) {
      return {
        fire: 25,
        earth: 25,
        air: 25,
        water: 25
      };
    }

    return {
      fire: Math.round((distribution.fire.points / total) * 100),
      earth: Math.round((distribution.earth.points / total) * 100),
      air: Math.round((distribution.air.points / total) * 100),
      water: Math.round((distribution.water.points / total) * 100)
    };
  };

  // Finde dominantes und schwächstes Element
  const findDominantAndWeakest = (distribution: any) => {
    const elements = ['fire', 'earth', 'air', 'water'];
    const sorted = elements.sort((a, b) => distribution[b].points - distribution[a].points);

    return {
      dominant: sorted[0],
      weakest: sorted[sorted.length - 1]
    };
  };

  // Berechne Balance Score (0-100, 100 = perfekt ausgewogen)
  const calculateBalanceScore = (percentages: any) => {
    const ideal = 25; // Perfekt ausgewogen = jedes Element 25%
    const deviations = Object.values(percentages).map((p: any) => Math.abs(p - ideal));
    const totalDeviation = deviations.reduce((sum: number, dev: any) => sum + dev, 0);
    const maxDeviation = 75 * 4; // Maximum mögliche Abweichung (100% in einem Element)

    return Math.round(100 - (totalDeviation / maxDeviation) * 100);
  };

  // Generiere Interpretation und Empfehlungen basierend auf Element-Verteilung
  const generateInterpretation = (percentages: any) => {
    const elements: Array<'fire' | 'earth' | 'air' | 'water'> = ['fire', 'earth', 'air', 'water'];
    const sorted = [...elements].sort((a, b) => percentages[b] - percentages[a]);

    const dominant = sorted[0];
    const weakest = sorted[sorted.length - 1];
    const dominantPercentage = percentages[dominant] || 0;
    const weakestPercentage = percentages[weakest] || 0;

    // Element-Beschreibungen
    const elementDescriptions: Record<string, any> = {
      fire: {
        name: 'Feuer',
        qualities: 'Initiative, Leidenschaft, Energie',
        dominant: {
          summary: 'Starke Feuer-Energie prägt diesen Tag',
          strengths: [
            'Hohe Motivation und Tatendrang',
            'Natürliche Führungsqualitäten kommen zum Vorschein',
            'Mut für neue Projekte und Unternehmungen'
          ],
          recommendations: [
            'Nutze die Energie für wichtige Starts und Initiativen',
            'Achte darauf, nicht zu impulsiv zu handeln',
            'Gönn dir Pausen, um nicht auszubrennen'
          ]
        },
        lacking: {
          challenge: 'Wenig Feuer-Energie verfügbar',
          recommendations: [
            'Suche bewusst nach inspirierenden Aktivitäten',
            'Setze dir kleine, motivierende Ziele',
            'Umgib dich mit aktiven, energiegeladenen Menschen'
          ]
        }
      },
      earth: {
        name: 'Erde',
        qualities: 'Stabilität, Praktikabilität, Beständigkeit',
        dominant: {
          summary: 'Starke Erd-Energie bringt Stabilität',
          strengths: [
            'Ausgezeichnete Zeit für praktische Angelegenheiten',
            'Bodenständigkeit und Realitätssinn dominieren',
            'Gute Voraussetzungen für langfristige Planung'
          ],
          recommendations: [
            'Ideal für organisatorische und administrative Aufgaben',
            'Kümmere dich um finanzielle oder materielle Belange',
            'Achte darauf, flexibel zu bleiben und nicht zu starr zu werden'
          ]
        },
        lacking: {
          challenge: 'Wenig Erd-Energie vorhanden',
          recommendations: [
            'Schaffe bewusst Struktur in deinem Tag',
            'Fokussiere dich auf konkrete, greifbare Ergebnisse',
            'Verbringe Zeit in der Natur für Erdung'
          ]
        }
      },
      air: {
        name: 'Luft',
        qualities: 'Kommunikation, Intellekt, Austausch',
        dominant: {
          summary: 'Hohe Luft-Energie fördert den Geist',
          strengths: [
            'Mentale Klarheit und schnelles Denken',
            'Kommunikation und Austausch fallen leicht',
            'Ideenreichtum und kreatives Problemlösen'
          ],
          recommendations: [
            'Perfekt für Gespräche, Meetings und Networking',
            'Nutze die Zeit zum Lernen und Informationsaustausch',
            'Achte darauf, auch auf deine Gefühle zu hören'
          ]
        },
        lacking: {
          challenge: 'Wenig Luft-Energie spürbar',
          recommendations: [
            'Plane Zeit für Austausch und Gespräche ein',
            'Lies, lerne oder beschäftige dich mental',
            'Vermeide es, dich zu isolieren'
          ]
        }
      },
      water: {
        name: 'Wasser',
        qualities: 'Emotion, Intuition, Empathie',
        dominant: {
          summary: 'Intensive Wasser-Energie verstärkt Gefühle',
          strengths: [
            'Tiefe emotionale Verbindungen möglich',
            'Starke Intuition und innere Führung',
            'Empathie und Mitgefühl sind ausgeprägt'
          ],
          recommendations: [
            'Vertraue deiner Intuition bei Entscheidungen',
            'Zeit für emotionale Selbstfürsorge einplanen',
            'Achte auf emotionale Grenzen, um nicht überwältigt zu werden'
          ]
        },
        lacking: {
          challenge: 'Wenig Wasser-Energie verfügbar',
          recommendations: [
            'Nimm dir bewusst Zeit für Gefühle und Reflexion',
            'Meditation oder Zeit am Wasser kann helfen',
            'Höre auf deine emotionalen Bedürfnisse'
          ]
        }
      }
    };

    // Generiere Summary
    let summary = '';
    if (dominantPercentage >= 40) {
      summary = elementDescriptions[dominant].dominant.summary;
    } else if (dominantPercentage >= 35) {
      summary = `Leichte ${elementDescriptions[dominant].name}-Betonung mit ausgeglichener Energie`;
    } else {
      summary = 'Ausgewogene Element-Verteilung für einen harmonischen Tag';
    }

    // Generiere Strengths
    const strengths: string[] = [];
    if (dominantPercentage >= 35) {
      strengths.push(...elementDescriptions[dominant].dominant.strengths);
    }

    // Generiere Recommendations
    const recommendations: string[] = [];
    if (dominantPercentage >= 40) {
      recommendations.push(...elementDescriptions[dominant].dominant.recommendations);
    }
    if (weakestPercentage <= 15 && weakestPercentage > 0) {
      recommendations.push(...elementDescriptions[weakest].lacking.recommendations);
    }

    // Wenn sehr ausgeglichen
    if (dominantPercentage < 35 && dominantPercentage - weakestPercentage < 20) {
      recommendations.push(
        'Nutze die ausgeglichene Energie für vielseitige Aktivitäten',
        'Du bist heute flexibel und kannst verschiedene Aufgaben gut meistern',
        'Achte darauf, dich nicht zu verzetteln'
      );
    }

    return {
      summary,
      dominant: elementDescriptions[dominant].name,
      weakest: elementDescriptions[weakest].name,
      strengths: strengths.length > 0 ? strengths : ['Ausgeglichene Energie in allen Bereichen'],
      recommendations: recommendations.length > 0 ? recommendations : ['Folge deiner Intuition bei der Tagesgestaltung'],
      balance: calculateBalanceScore(percentages)
    };
  };

  // Farben für die Elemente
  const elementColors = {
    fire: '#C97064',
    earth: '#8B7355',
    air: '#A8B5C8',
    water: '#6B9AB8'
  };

  // Icons für die Elemente
  const elementIcons = {
    fire: 'i-heroicons-fire',
    earth: 'i-heroicons-globe-alt',
    air: 'i-heroicons-cloud',
    water: 'i-heroicons-beaker'
  };

  return {
    calculateElementDistribution,
    calculateCombinedElementDistribution,
    calculatePercentages,
    findDominantAndWeakest,
    calculateBalanceScore,
    generateInterpretation,
    elementColors,
    elementIcons,
    elementNames
  };
};
