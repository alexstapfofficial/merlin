export interface LifeArea {
  key: string;
  name: string;
  icon: string;
  score: number;
}

// Zuordnung von Lebensbereichen zu astrologischen Häusern
const LIFE_AREA_HOUSES: Record<string, number[]> = {
  love: [5, 7], // 5. Haus (Romantik, Freude) + 7. Haus (Partnerschaft)
  career: [6, 10], // 6. Haus (Arbeit) + 10. Haus (Karriere, Berufung)
  money: [2, 8], // 2. Haus (Finanzen, Besitz) + 8. Haus (gemeinsame Ressourcen)
  health: [1, 6], // 1. Haus (Körper, Vitalität) + 6. Haus (Gesundheit, Alltag)
  communication: [3, 9], // 3. Haus (Kommunikation) + 9. Haus (Weisheit, Lehren)
  creativity: [5, 11], // 5. Haus (Kreativität) + 11. Haus (Visionen, Innovationen)
};

// Planetengewichtung (gleich wie in useDailyVibe)
const planetWeights = {
  Sun: 3,
  Moon: 3,
  Mars: 3,
  Mercury: 2,
  Venus: 2,
  Jupiter: 1,
  Saturn: 1,
  Uranus: 1,
  Neptune: 1,
  Pluto: 1,
} as const;

export const useLifeAreas = () => {
  /**
   * Berechnet den Score für einen Lebensbereich basierend auf Transiten
   */
  const calculateLifeAreaScore = (
    houses: number[],
    transits: any[],
    birthChartHouses: any
  ): number => {
    let score = 50; // Neutral-Start
    let positiveImpact = 0;
    let negativeImpact = 0;

    // 1. Bewerte Transite, die die relevanten Häuser betreffen
    transits.forEach((transit) => {
      const { aspect, orb, transitPlanet, natalPlanet } = transit;

      // Finde heraus, in welchem Haus der Natal-Planet steht
      const natalPlanetHouse = findHouseForPlanet(
        natalPlanet,
        birthChartHouses
      );

      // Nur Transite berücksichtigen, die die relevanten Häuser betreffen
      if (!houses.includes(natalPlanetHouse)) return;

      // Aspekt-Impact
      let aspectImpact = 0;
      switch (aspect) {
        case "trine":
          aspectImpact = 12;
          break;
        case "sextile":
          aspectImpact = 7;
          break;
        case "conjunction":
          aspectImpact = 4;
          break;
        case "square":
          aspectImpact = -10;
          break;
        case "opposition":
          aspectImpact = -8;
          break;
      }

      // Orb-Gewichtung
      const maxOrb = 8;
      const orbWeight = Math.max(0, 1 - orb / maxOrb);

      // Planetengewichtung
      const transitWeight =
        planetWeights[transitPlanet as keyof typeof planetWeights] || 1;
      const natalWeight =
        planetWeights[natalPlanet as keyof typeof planetWeights] || 1;
      const combinedWeight = (transitWeight + natalWeight) / 2;

      // Gewichteter Impact
      const weightedImpact =
        aspectImpact * orbWeight * (combinedWeight / 2);

      if (weightedImpact > 0) {
        positiveImpact += weightedImpact;
      } else {
        negativeImpact += weightedImpact;
      }
    });

    // 2. Bewerte Planeten in den relevanten Häusern (Natal-Chart)
    if (birthChartHouses?.Houses) {
      birthChartHouses.Houses.forEach((house: any) => {
        if (!houses.includes(house.houseNumber)) return;

        if (house.planets && house.planets.length > 0) {
          house.planets.forEach((planet: any) => {
            const weight =
              planetWeights[planet.name as keyof typeof planetWeights] || 1;
            // Planeten im relevanten Haus = leicht positive Grundenergie
            positiveImpact += weight * 2;
          });
        }
      });
    }

    // Kombiniere Impacts
    const totalImpact = positiveImpact + negativeImpact;
    const impactMultiplier = 1.2; // Etwas schwächer als Daily Vibe
    score += totalImpact * impactMultiplier;

    // Auf 0-100 begrenzen
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  /**
   * Hilfsfunktion: Finde das Haus eines Planeten
   */
  const findHouseForPlanet = (planetName: string, houses: any): number => {
    if (!houses || !houses.Houses) return 1;

    for (const house of houses.Houses) {
      if (
        house.planets &&
        house.planets.some((p: any) => p.name === planetName)
      ) {
        return house.houseNumber;
      }
    }

    return 1; // Fallback
  };

  /**
   * Berechnet alle Lebensbereiche
   */
  const calculateLifeAreas = (
    transits: any[],
    birthChartHouses: any
  ): LifeArea[] => {
    return [
      {
        key: "love",
        name: "Liebe & Beziehungen",
        icon: "i-heroicons-heart",
        score: calculateLifeAreaScore(
          LIFE_AREA_HOUSES.love || [],
          transits,
          birthChartHouses
        ),
      },
      {
        key: "career",
        name: "Beruf & Karriere",
        icon: "i-heroicons-briefcase",
        score: calculateLifeAreaScore(
          LIFE_AREA_HOUSES.career || [],
          transits,
          birthChartHouses
        ),
      },
      {
        key: "money",
        name: "Finanzen",
        icon: "i-heroicons-banknotes",
        score: calculateLifeAreaScore(
          LIFE_AREA_HOUSES.money || [],
          transits,
          birthChartHouses
        ),
      },
      {
        key: "health",
        name: "Gesundheit",
        icon: "i-heroicons-sparkles",
        score: calculateLifeAreaScore(
          LIFE_AREA_HOUSES.health || [],
          transits,
          birthChartHouses
        ),
      },
      {
        key: "communication",
        name: "Kommunikation",
        icon: "i-heroicons-chat-bubble-left-right",
        score: calculateLifeAreaScore(
          LIFE_AREA_HOUSES.communication || [],
          transits,
          birthChartHouses
        ),
      },
      {
        key: "creativity",
        name: "Kreativität",
        icon: "i-heroicons-light-bulb",
        score: calculateLifeAreaScore(
          LIFE_AREA_HOUSES.creativity || [],
          transits,
          birthChartHouses
        ),
      },
    ];
  };

  /**
   * Berechnet den Daily Vibe Score als Durchschnitt aller Lebensbereiche
   */
  const calculateDailyVibeFromLifeAreas = (lifeAreas: LifeArea[]): number => {
    if (!lifeAreas || lifeAreas.length === 0) return 50;

    const totalScore = lifeAreas.reduce((sum, area) => sum + area.score, 0);
    const averageScore = totalScore / lifeAreas.length;

    return Math.round(averageScore);
  };

  return {
    calculateLifeAreas,
    calculateDailyVibeFromLifeAreas,
  };
};
