export const useDailyVibe = () => {
  // Zuordnung von Sternzeichen zu Elementen
  const signElements = {
    Aries: 'fire',
    Taurus: 'earth',
    Gemini: 'air',
    Cancer: 'water',
    Leo: 'fire',
    Virgo: 'earth',
    Libra: 'air',
    Scorpio: 'water',
    Sagittarius: 'fire',
    Capricorn: 'earth',
    Aquarius: 'air',
    Pisces: 'water'
  } as const;

  // Zuordnung von Sternzeichen zu Modalitäten (Kardinalitäten)
  const signModalities = {
    Aries: 'cardinal',
    Taurus: 'fixed',
    Gemini: 'mutable',
    Cancer: 'cardinal',
    Leo: 'fixed',
    Virgo: 'mutable',
    Libra: 'cardinal',
    Scorpio: 'fixed',
    Sagittarius: 'mutable',
    Capricorn: 'cardinal',
    Aquarius: 'fixed',
    Pisces: 'mutable'
  } as const;

  // Planetengewichtungen
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
    Pluto: 1
  } as const;

  /**
   * Gibt den semantischen Status basierend auf dem Score zurück
   */
  const getVibeStatus = (score: number): {
    status: string;
    description: string;
  } => {
    if (score >= 85) {
      return {
        status: 'Hohe Ausrichtung',
        description: 'Flow, Leichtigkeit, Rückenwind'
      };
    } else if (score >= 65) {
      return {
        status: 'Positive Dynamik',
        description: 'Gute Unterstützung, konstruktiv'
      };
    } else if (score >= 35) {
      return {
        status: 'Ausgeglichene Energie',
        description: 'Neutrale Alltagslage, gemischte Einflüsse'
      };
    } else if (score >= 15) {
      return {
        status: 'Konstruktive Spannung',
        description: 'Reibung, die zu Handlungen zwingt, Disziplin nötig'
      };
    } else {
      return {
        status: 'Wachstumsherausforderung',
        description: 'Starke Widerstände, Transformationsdruck, maximale Reibung'
      };
    }
  };

  /**
   * Berechnet den Daily Vibe Score als 'Cosmic Alignment Index' (0-100%)
   * Startet bei 50% (Neutral)
   */
  const calculateDailyVibeScore = (transits: any[]): number => {
    if (!transits || transits.length === 0) return 50; // Neutral wenn keine Transite

    // Start bei 50% (Neutral)
    let score = 50;
    let positiveImpact = 0;
    let negativeImpact = 0;
    let totalWeight = 0;

    transits.forEach(transit => {
      const { aspect, orb, transitPlanet, natalPlanet } = transit;

      // Impact-Werte basierend auf Aspekt-Typ (stärker gewichtet)
      let aspectImpact = 0;
      switch (aspect) {
        case 'trine':
          aspectImpact = 12; // Stark harmonisch
          break;
        case 'sextile':
          aspectImpact = 7; // Harmonisch
          break;
        case 'conjunction':
          aspectImpact = 4; // Neutral bis leicht positiv (Fokus/Energie)
          break;
        case 'square':
          aspectImpact = -10; // Spannungsaspekt
          break;
        case 'opposition':
          aspectImpact = -8; // Polarität/Spannung
          break;
      }

      // Orb-Gewichtung: Je exakter der Aspekt, desto stärker die Wirkung
      // Orb 0° = 100%, Orb 1° = 87.5%, Orb 2° = 75%, Orb 3° = 62.5%
      const maxOrb = 8;
      const orbWeight = Math.max(0, 1 - (orb / maxOrb));

      // Planetengewichtung (persönliche Planeten haben deutlich mehr Einfluss)
      const transitWeight = planetWeights[transitPlanet as keyof typeof planetWeights] || 1;
      const natalWeight = planetWeights[natalPlanet as keyof typeof planetWeights] || 1;
      const combinedWeight = (transitWeight + natalWeight) / 2;

      // Gewichteter Impact (ohne zusätzliche Division, um stärkere Effekte zu erzielen)
      const weightedImpact = aspectImpact * orbWeight * (combinedWeight / 2);

      if (weightedImpact > 0) {
        positiveImpact += weightedImpact;
      } else {
        negativeImpact += weightedImpact;
      }

      totalWeight += combinedWeight * orbWeight;
    });

    // Kombiniere positive und negative Einflüsse
    const totalImpact = positiveImpact + negativeImpact;

    // Verstärke den Impact basierend auf der Anzahl und Gewichtung der Transite
    const impactMultiplier = 1.5; // Verstärkungsfaktor
    score += totalImpact * impactMultiplier;

    // Auf 0-100 begrenzen (niemals < 0 oder > 100)
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  /**
   * Berechnet die Element-Verteilung mit Void/Excess Alerts
   */
  const calculateElementDistribution = (planetaryPositions: any[]): {
    distribution: Record<string, number>;
    voidAlerts: string[];
    excessAlerts: string[];
  } => {
    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
    let totalWeight = 0;

    planetaryPositions.forEach(planet => {
      const { name, zodiacSign } = planet;

      const weight = planetWeights[name as keyof typeof planetWeights] || 0;
      const element = signElements[zodiacSign as keyof typeof signElements];

      if (element && weight > 0) {
        elementCounts[element] += weight;
        totalWeight += weight;
      }
    });

    // Prozentuale Verteilung berechnen
    const distribution: Record<string, number> = {};
    if (totalWeight > 0) {
      Object.keys(elementCounts).forEach(element => {
        distribution[element] = Math.round((elementCounts[element as keyof typeof elementCounts] / totalWeight) * 100);
      });
    } else {
      // Gleichverteilung wenn keine Daten
      distribution.fire = 25;
      distribution.earth = 25;
      distribution.air = 25;
      distribution.water = 25;
    }

    // Void Alerts (0%)
    const voidAlerts: string[] = [];
    const voidMessages = {
      fire: 'Initiative und Antrieb',
      earth: 'Erdung und Stabilität',
      air: 'Geistige Stimulation',
      water: 'Emotionale Tiefe'
    };

    // Excess Alerts (>70%)
    const excessAlerts: string[] = [];
    const excessMessages = {
      fire: 'Überaktivität und Burnout',
      earth: 'Starrheit und Festhalten',
      air: 'Überreizung und Zerstreuung',
      water: 'Emotionale Überflutung'
    };

    Object.entries(distribution).forEach(([element, percentage]) => {
      if (percentage === 0) {
        voidAlerts.push(voidMessages[element as keyof typeof voidMessages]);
      } else if (percentage > 70) {
        excessAlerts.push(excessMessages[element as keyof typeof excessMessages]);
      }
    });

    return {
      distribution,
      voidAlerts,
      excessAlerts
    };
  };

  /**
   * Berechnet die Modalitäts-Verteilung mit Void/Excess Alerts
   */
  const calculateModalityDistribution = (planetaryPositions: any[]): {
    distribution: Record<string, number>;
    voidAlerts: string[];
    excessAlerts: string[];
  } => {
    const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
    let totalWeight = 0;

    planetaryPositions.forEach(planet => {
      const { name, zodiacSign } = planet;

      const weight = planetWeights[name as keyof typeof planetWeights] || 0;
      const modality = signModalities[zodiacSign as keyof typeof signModalities];

      if (modality && weight > 0) {
        modalityCounts[modality] += weight;
        totalWeight += weight;
      }
    });

    // Prozentuale Verteilung berechnen
    const distribution: Record<string, number> = {};
    if (totalWeight > 0) {
      Object.keys(modalityCounts).forEach(modality => {
        distribution[modality] = Math.round((modalityCounts[modality as keyof typeof modalityCounts] / totalWeight) * 100);
      });
    } else {
      // Gleichverteilung wenn keine Daten
      distribution.cardinal = 33;
      distribution.fixed = 33;
      distribution.mutable = 34;
    }

    // Void Alerts (0%)
    const voidAlerts: string[] = [];
    const voidMessages = {
      cardinal: 'Initiative und Durchsetzung',
      fixed: 'Beständigkeit und Ausdauer',
      mutable: 'Anpassungsfähigkeit'
    };

    // Excess Alerts (>70%)
    const excessAlerts: string[] = [];
    const excessMessages = {
      cardinal: 'Ungeduld und Rastlosigkeit',
      fixed: 'Sturheit und Stillstand',
      mutable: 'Unbeständigkeit und Zerstreuung'
    };

    Object.entries(distribution).forEach(([modality, percentage]) => {
      if (percentage === 0) {
        voidAlerts.push(voidMessages[modality as keyof typeof voidMessages]);
      } else if (percentage > 70) {
        excessAlerts.push(excessMessages[modality as keyof typeof excessMessages]);
      }
    });

    return {
      distribution,
      voidAlerts,
      excessAlerts
    };
  };

  /**
   * Identifiziert das Haus mit der höchsten Aktivität
   */
  const calculateFocusOfTheDay = (
    planetaryPositions: any[],
    transits: any[],
    houses: any
  ): number => {
    const houseActivity: Record<number, number> = {};

    // Initialisiere alle Häuser mit 0
    for (let i = 1; i <= 12; i++) {
      houseActivity[i] = 0;
    }

    // 1. Zähle Planeten pro Haus (gewichtet)
    if (houses?.Houses) {
      houses.Houses.forEach((house: any) => {
        const houseNumber = house.houseNumber;
        if (house.planets && house.planets.length > 0) {
          house.planets.forEach((planet: any) => {
            const weight = planetWeights[planet.name as keyof typeof planetWeights] || 1;
            if (houseActivity[houseNumber] !== undefined) {
              houseActivity[houseNumber] += weight * 5; // Planeten im Haus = hohe Aktivität
            }
          });
        }
      });
    }

    // 2. Bewerte Aspekte, die Hausplaneten betreffen
    transits.forEach(transit => {
      const { natalPlanet, aspect, orb } = transit;

      // Finde das Haus des Natal-Planeten
      if (houses?.Houses) {
        houses.Houses.forEach((house: any) => {
          if (house.planets && house.planets.some((p: any) => p.name === natalPlanet)) {
            const houseNumber = house.houseNumber;

            // Aspekt-Stärke basierend auf Orb
            const maxOrb = 8;
            const orbFactor = Math.max(0, (maxOrb - orb) / maxOrb);

            // Aspekt-Wichtigkeit
            let aspectImportance = 0;
            switch (aspect) {
              case 'conjunction':
                aspectImportance = 3;
                break;
              case 'opposition':
              case 'square':
                aspectImportance = 2;
                break;
              case 'trine':
              case 'sextile':
                aspectImportance = 1.5;
                break;
            }

            if (houseActivity[houseNumber] !== undefined) {
              houseActivity[houseNumber] += aspectImportance * orbFactor * 3;
            }
          }
        });
      }
    });

    // Finde das Haus mit der höchsten Aktivität
    let maxActivity = 0;
    let focusHouse = 1;

    Object.entries(houseActivity).forEach(([house, activity]) => {
      if (activity > maxActivity) {
        maxActivity = activity;
        focusHouse = parseInt(house);
      }
    });

    return focusHouse;
  };

  /**
   * Hauptfunktion: Berechnet alle Daily Vibe Metriken als vibeResult
   * Berücksichtigt sowohl Transit- als auch Natal-Horoskop
   */
  const calculateDailyVibe = (transitData: {
    transits: any[];
    transitPlanetaryPositions: any[];
    natalPlanetaryPositions: any[];
    houses: any;
  }) => {
    const { transits, transitPlanetaryPositions, natalPlanetaryPositions, houses } = transitData;

    // Berechne den Vibe Score aus den Transiten
    const vibeScore = calculateDailyVibeScore(transits);
    const vibeStatus = getVibeStatus(vibeScore);

    // Transit-Energie (aktuelle kosmische Einflüsse)
    const transitElementData = calculateElementDistribution(transitPlanetaryPositions);
    const transitModalityData = calculateModalityDistribution(transitPlanetaryPositions);

    // Natal-Energie (Geburtshoroskop als Grundlage)
    const natalElementData = calculateElementDistribution(natalPlanetaryPositions);
    const natalModalityData = calculateModalityDistribution(natalPlanetaryPositions);

    // Kombiniere Natal und Transit: Alerts basierend auf der Interaktion
    // Void Alert: Wenn im Natal fehlt UND im Transit auch nicht kompensiert wird
    const combinedElementVoidAlerts: string[] = [];
    const combinedElementExcessAlerts: string[] = [];

    Object.keys(natalElementData.distribution).forEach(element => {
      const natalPercent = natalElementData.distribution[element] || 0;
      const transitPercent = transitElementData.distribution[element] || 0;

      // Void: Natal fehlt (0%) und Transit bringt wenig (<30%)
      if (natalPercent === 0 && transitPercent < 30) {
        const voidMessages: Record<string, string> = {
          fire: 'Initiative und Antrieb',
          earth: 'Erdung und Stabilität',
          air: 'Geistige Stimulation',
          water: 'Emotionale Tiefe'
        };
        const message = voidMessages[element];
        if (message) combinedElementVoidAlerts.push(message);
      }

      // Excess: Natal hoch (>50%) UND Transit verstärkt weiter (>50%)
      if (natalPercent > 50 && transitPercent > 50) {
        const excessMessages: Record<string, string> = {
          fire: 'Überaktivität und Burnout',
          earth: 'Starrheit und Festhalten',
          air: 'Überreizung und Zerstreuung',
          water: 'Emotionale Überflutung'
        };
        const message = excessMessages[element];
        if (message) combinedElementExcessAlerts.push(message);
      }
    });

    // Gleiches für Modalitäten
    const combinedModalityVoidAlerts: string[] = [];
    const combinedModalityExcessAlerts: string[] = [];

    Object.keys(natalModalityData.distribution).forEach(modality => {
      const natalPercent = natalModalityData.distribution[modality] || 0;
      const transitPercent = transitModalityData.distribution[modality] || 0;

      if (natalPercent === 0 && transitPercent < 30) {
        const voidMessages: Record<string, string> = {
          cardinal: 'Initiative und Durchsetzung',
          fixed: 'Beständigkeit und Ausdauer',
          mutable: 'Anpassungsfähigkeit'
        };
        const message = voidMessages[modality];
        if (message) combinedModalityVoidAlerts.push(message);
      }

      if (natalPercent > 50 && transitPercent > 50) {
        const excessMessages: Record<string, string> = {
          cardinal: 'Ungeduld und Rastlosigkeit',
          fixed: 'Sturheit und Stillstand',
          mutable: 'Unbeständigkeit und Zerstreuung'
        };
        const message = excessMessages[modality];
        if (message) combinedModalityExcessAlerts.push(message);
      }
    });

    return {
      vibeScore,
      vibeStatus,
      elementDistribution: transitElementData.distribution,
      elementVoidAlerts: combinedElementVoidAlerts,
      elementExcessAlerts: combinedElementExcessAlerts,
      modalityDistribution: transitModalityData.distribution,
      modalityVoidAlerts: combinedModalityVoidAlerts,
      modalityExcessAlerts: combinedModalityExcessAlerts,
      focusHouse: calculateFocusOfTheDay(transitPlanetaryPositions, transits, houses)
    };
  };

  return {
    calculateDailyVibe,
    calculateDailyVibeScore,
    getVibeStatus,
    calculateElementDistribution,
    calculateModalityDistribution,
    calculateFocusOfTheDay
  };
};
