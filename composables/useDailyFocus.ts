// Interfaces
export interface Transit {
  planet: string;
  natalPlanet?: string;
  house: number;
  aspect: string;
  orb: number;
}

export interface NatalHouseSpitzen {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  sign: string;
  degree: number;
}

export interface DailyFocus {
  topHouse: number;
  label: string;
  icon: string;
  intensity: number;
  reasoning: string;
  actionCall: string;
}

// Konfiguration für Gewichtungen (leicht anpassbar)
const WEIGHTS = {
  // Planeten-Basiswerte
  planets: {
    Sun: 10,
    Moon: 10,
    Mars: 10,
    Mercury: 7,
    Venus: 7,
    Jupiter: 3,
    Saturn: 3,
    Uranus: 3,
    Neptune: 3,
    Pluto: 3,
  } as Record<string, number>,

  // Trigger-Event Bonus
  triggerBonus: 50,
  triggerOrbThreshold: 1.0,

  // Stellium-Schwellwert und Multiplikator
  stelliumThreshold: 3,
  stelliumMultiplier: 2.0,

  // Angular Houses Bonus (AC, DC, IC, MC = Häuser 1, 4, 7, 10)
  angularHouses: [1, 4, 7, 10],
  angularBonus: 1.5,
} as const;

// Haus-Labels (Deutsch)
const HOUSE_LABELS: Record<number, string> = {
  1: 'Persönlichkeit & Selbstausdruck',
  2: 'Finanzen & Werte',
  3: 'Kommunikation & Lernen',
  4: 'Familie & Zuhause',
  5: 'Kreativität & Freude',
  6: 'Gesundheit & Alltag',
  7: 'Beziehungen & Partnerschaft',
  8: 'Transformation & Intimität',
  9: 'Expansion & Weisheit',
  10: 'Karriere & Öffentlichkeit',
  11: 'Freundschaft & Visionen',
  12: 'Spiritualität & Rückzug',
};

// Haus-Icons (Heroicons)
const HOUSE_ICONS: Record<number, string> = {
  1: 'i-heroicons-user-circle',
  2: 'i-heroicons-banknotes',
  3: 'i-heroicons-chat-bubble-left-right',
  4: 'i-heroicons-home',
  5: 'i-heroicons-sparkles',
  6: 'i-heroicons-heart-pulse',
  7: 'i-heroicons-heart',
  8: 'i-heroicons-arrow-path',
  9: 'i-heroicons-globe-alt',
  10: 'i-heroicons-briefcase',
  11: 'i-heroicons-user-group',
  12: 'i-heroicons-moon',
};

// Action Calls pro Haus
const ACTION_CALLS: Record<number, string> = {
  1: 'Zeige der Welt, wer du wirklich bist!',
  2: 'Prüfe deine Ressourcen und investiere weise.',
  3: 'Teile deine Gedanken und lerne Neues.',
  4: 'Kümmere dich um dein Zuhause und deine Wurzeln.',
  5: 'Lass deiner Kreativität freien Lauf!',
  6: 'Achte auf deine Gesundheit und Routinen.',
  7: 'Pflege deine Beziehungen und suche den Dialog.',
  8: 'Wage tiefgreifende Veränderungen.',
  9: 'Erweitere deinen Horizont und deine Perspektive.',
  10: 'Setze berufliche Ziele um und zeige dich.',
  11: 'Vernetze dich und arbeite an deinen Visionen.',
  12: 'Ziehe dich zurück und reflektiere.',
};

// Angular House Cusps (wichtige Achsen)
const ANGULAR_CUSPS: Record<string, number> = {
  AC: 1,   // Aszendent
  IC: 4,   // Imum Coeli
  DC: 7,   // Deszendent
  MC: 10,  // Medium Coeli
};

export const useDailyFocus = () => {
  /**
   * Berechnet den Planeten-Basiswert
   */
  const getPlanetWeight = (planet: string): number => {
    return WEIGHTS.planets[planet] || 1;
  };

  /**
   * Berechnet den Orb-Faktor (je kleiner der Orb, desto höher der Faktor)
   */
  const getOrbFactor = (orb: number): number => {
    return 1 / (orb + 0.5);
  };

  /**
   * Prüft, ob ein Transit über eine Angular Cusp läuft
   */
  const isAngularCuspTransit = (
    transit: Transit,
    houseSpitzen: NatalHouseSpitzen[]
  ): { isAngular: boolean; cusp?: string } => {
    // Prüfe die vier wichtigen Achsen
    for (const [cuspName, houseNumber] of Object.entries(ANGULAR_CUSPS)) {
      const cusp = houseSpitzen.find(h => h.number === houseNumber);
      if (!cusp) continue;

      // Wenn der Transit in diesem Haus ist und der Orb sehr klein ist
      if (
        transit.house === houseNumber &&
        transit.orb < WEIGHTS.triggerOrbThreshold
      ) {
        return { isAngular: true, cusp: cuspName };
      }
    }

    return { isAngular: false };
  };

  /**
   * Berechnet das Scoring für alle Häuser
   */
  const calculateHouseScores = (
    transits: Transit[],
    houseSpitzen: NatalHouseSpitzen[]
  ): Map<number, { score: number; reasons: string[] }> => {
    const houseScores = new Map<number, { score: number; reasons: string[] }>();

    // Initialisiere alle Häuser mit Score 0
    for (let i = 1; i <= 12; i++) {
      houseScores.set(i, { score: 0, reasons: [] });
    }

    // Zähle Planeten pro Haus für Stellium-Bonus
    const planetCountPerHouse = new Map<number, number>();
    transits.forEach(transit => {
      const count = planetCountPerHouse.get(transit.house) || 0;
      planetCountPerHouse.set(transit.house, count + 1);
    });

    // Berechne Scores für jeden Transit
    transits.forEach(transit => {
      const houseData = houseScores.get(transit.house)!;

      // Basis-Punkte
      let score = getPlanetWeight(transit.planet);

      // Orb-Faktor
      const orbFactor = getOrbFactor(transit.orb);
      score *= orbFactor;

      // Angular House Bonus
      if (WEIGHTS.angularHouses.includes(transit.house)) {
        score *= WEIGHTS.angularBonus;
        houseData.reasons.push(`${transit.planet} in Angular House ${transit.house}`);
      }

      // Trigger-Event Bonus (über Hausspitze)
      const angularCheck = isAngularCuspTransit(transit, houseSpitzen);
      if (angularCheck.isAngular) {
        score += WEIGHTS.triggerBonus;
        houseData.reasons.push(
          `${transit.planet} ${transit.aspect} ${angularCheck.cusp} (${transit.orb.toFixed(1)}°)`
        );
      } else {
        houseData.reasons.push(
          `${transit.planet} ${transit.aspect} ${transit.natalPlanet || 'House'} (${transit.orb.toFixed(1)}°)`
        );
      }

      houseData.score += score;
    });

    // Stellium-Bonus anwenden
    planetCountPerHouse.forEach((count, house) => {
      if (count >= WEIGHTS.stelliumThreshold) {
        const houseData = houseScores.get(house)!;
        houseData.score *= WEIGHTS.stelliumMultiplier;
        houseData.reasons.push(`Stellium: ${count} Planeten im Haus ${house}`);
      }
    });

    return houseScores;
  };

  /**
   * Berechnet die Intensität (0-100) basierend auf dem Verhältnis zum Gesamtscore
   */
  const calculateIntensity = (
    topScore: number,
    allScores: Map<number, { score: number; reasons: string[] }>
  ): number => {
    const totalScore = Array.from(allScores.values()).reduce(
      (sum, house) => sum + house.score,
      0
    );

    if (totalScore === 0) return 0;

    const intensity = (topScore / totalScore) * 100;
    return Math.min(100, Math.round(intensity));
  };

  /**
   * Hauptfunktion: Berechnet den Daily Focus
   */
  const calculateDailyFocus = (
    transits: Transit[],
    houseSpitzen: NatalHouseSpitzen[]
  ): DailyFocus => {
    if (!transits || transits.length === 0) {
      return {
        topHouse: 1,
        label: HOUSE_LABELS[1] || '',
        icon: HOUSE_ICONS[1] || '',
        intensity: 0,
        reasoning: 'Keine Transit-Daten vorhanden',
        actionCall: ACTION_CALLS[1] || '',
      };
    }

    // Berechne alle Haus-Scores
    const houseScores = calculateHouseScores(transits, houseSpitzen);

    // Finde das Haus mit dem höchsten Score
    let topHouse = 1;
    let topScore = 0;
    let topReasons: string[] = [];

    houseScores.forEach((data, house) => {
      if (data.score > topScore) {
        topScore = data.score;
        topHouse = house;
        topReasons = data.reasons;
      }
    });

    // Berechne Intensität
    const intensity = calculateIntensity(topScore, houseScores);

    // Erstelle Reasoning-String
    const reasoning = topReasons.length > 0
      ? topReasons.slice(0, 3).join('; ') // Max 3 Gründe
      : `Haus ${topHouse} hat die höchste Aktivität`;

    return {
      topHouse,
      label: HOUSE_LABELS[topHouse] || '',
      icon: HOUSE_ICONS[topHouse] || '',
      intensity,
      reasoning,
      actionCall: ACTION_CALLS[topHouse] || '',
    };
  };

  return {
    calculateDailyFocus,
    // Exportiere Konfiguration für einfache Anpassung
    config: WEIGHTS,
  };
};
