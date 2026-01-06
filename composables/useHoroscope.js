import CircularHoroscope from "circular-natal-horoscope-js";

/**
 * Composable for horoscope calculations
 * @returns {Object} Horoscope calculation functions
 */
export const useHoroscope = () => {
  const { Origin, Horoscope: CircularHoroscopeClass } = CircularHoroscope;

  /**
   * Map longitude to zodiac sign
   */
  const getZodiacSign = (longitude) => {
    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo",
      "Virgo", "Libra", "Scorpio", "Sagittarius",
      "Capricorn", "Aquarius", "Pisces"
    ];
    const normalizedLongitude = longitude % 360;
    const index = Math.floor(normalizedLongitude / 30);
    return zodiacSigns[index];
  };

  /**
   * Normalize angle to 0-360 degrees
   */
  const normalizeAngle = (angle) => {
    if (angle < 0) {
      return angle + 360;
    }
    return angle % 360;
  };

  /**
   * Calculate planetary positions
   */
  const calculatePlanetaryPositions = (circularHoroscope) => {
    const planetMapping = {
      sun: "Sun",
      moon: "Moon",
      mercury: "Mercury",
      venus: "Venus",
      mars: "Mars",
      jupiter: "Jupiter",
      saturn: "Saturn",
      uranus: "Uranus",
      neptune: "Neptune",
      pluto: "Pluto",
      chiron: "Chiron",
    };

    const pointMapping = {
      northnode: "NNode",
      lilith: "Lilith",
    };

    const planetaryPositions = [];

    // Add planets and Chiron from CelestialBodies
    for (const [key, name] of Object.entries(planetMapping)) {
      const planet = circularHoroscope.CelestialBodies[key];
      if (planet && planet.ChartPosition) {
        const longitude = planet.ChartPosition.Ecliptic.DecimalDegrees;

        planetaryPositions.push({
          name: name,
          longitude: longitude,
          latitude: 0,
          zodiacSign: getZodiacSign(longitude),
          angle: normalizeAngle(longitude),
        });
      }
    }

    // Add celestial points (North Node, Lilith)
    for (const [key, name] of Object.entries(pointMapping)) {
      const point = circularHoroscope.CelestialPoints[key];
      if (point && point.ChartPosition) {
        const longitude = point.ChartPosition.Ecliptic.DecimalDegrees;

        planetaryPositions.push({
          name: name,
          longitude: longitude,
          latitude: 0,
          zodiacSign: getZodiacSign(longitude),
          angle: normalizeAngle(longitude),
        });
      }
    }

    return planetaryPositions;
  };

  /**
   * Calculate houses
   */
  const calculateHouses = (circularHoroscope) => {
    const houses = [];

    const ascendant = circularHoroscope.Ascendant?.ChartPosition?.Ecliptic?.DecimalDegrees || 0;
    const midheaven = circularHoroscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees || 0;

    for (let i = 1; i <= 12; i++) {
      const house = circularHoroscope.Houses[i];
      let cusp;

      if (house && house.ChartPosition && house.ChartPosition.StartPosition) {
        cusp = house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
      } else if (i === 1) {
        cusp = ascendant;
      } else if (i === 12 && houses.length === 11) {
        cusp = (houses[0].angle - 30 + 360) % 360;
      } else {
        continue;
      }

      houses.push({
        houseNumber: i,
        angle: cusp,
        zodiacSign: getZodiacSign(cusp),
        planets: [],
      });
    }

    return {
      Ascendant: ascendant,
      Midheaven: midheaven,
      Houses: houses,
    };
  };

  /**
   * Check if a planet is in a house
   */
  const isPlanetInHouse = (planetLongitude, houseCuspStart, nextHouseCuspStart) => {
    if (houseCuspStart < nextHouseCuspStart) {
      return (
        planetLongitude >= houseCuspStart &&
        planetLongitude < nextHouseCuspStart
      );
    } else {
      return (
        (planetLongitude >= houseCuspStart && planetLongitude <= 360) ||
        (planetLongitude >= 0 && planetLongitude < nextHouseCuspStart)
      );
    }
  };

  /**
   * Assign planets to houses
   */
  const assignPlanetsToHouses = (planetaryPositions, houses) => {
    for (const planet of planetaryPositions) {
      for (let i = 0; i < houses.Houses.length; i++) {
        const currentHouse = houses.Houses[i];
        const nextHouse = houses.Houses[(i + 1) % houses.Houses.length];
        const houseCuspStart = normalizeAngle(currentHouse.angle);
        const nextHouseCuspStart = normalizeAngle(nextHouse.angle);

        if (
          isPlanetInHouse(
            planet.longitude,
            houseCuspStart,
            nextHouseCuspStart
          )
        ) {
          currentHouse.planets.push({
            name: planet.name,
            sign: getZodiacSign(planet.angle),
            degree: planet.angle
          });
          break;
        }
      }
    }
  };

  /**
   * Calculate aspects between planets
   */
  const calculateAspects = (planetaryPositions) => {
    const aspects = [];
    const aspectAngles = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180,
    };

    for (let i = 0; i < planetaryPositions.length; i++) {
      for (let j = i + 1; j < planetaryPositions.length; j++) {
        const planet1 = planetaryPositions[i];
        const planet2 = planetaryPositions[j];

        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle;

        for (const [aspect, degree] of Object.entries(aspectAngles)) {
          if (Math.abs(normalizedAngle - degree) <= 8) {
            aspects.push({
              planets: [planet1.name, planet2.name],
              aspect: aspect,
              exactAngle: normalizedAngle,
            });
          }
        }
      }
    }

    return aspects;
  };

  /**
   * Calculate complete horoscope
   */
  const calculateHoroscope = (year, month, day, hour, minute, latitude, longitude) => {
    const origin = new Origin({
      year: year,
      month: month - 1, // 0-indexed months
      date: day,
      hour: hour,
      minute: minute,
      latitude: latitude,
      longitude: longitude,
    });

    const circularHoroscope = new CircularHoroscopeClass({
      origin: origin,
      houseSystem: "placidus",
      zodiac: "tropical",
      aspectPoints: ['bodies', 'points', 'angles'],
      aspectWithPoints: ['bodies', 'points', 'angles'],
      aspectTypes: ["major", "minor"],
      language: 'en'
    });

    const planetaryPositions = calculatePlanetaryPositions(circularHoroscope);
    const houses = calculateHouses(circularHoroscope);
    const aspects = calculateAspects(planetaryPositions);

    assignPlanetsToHouses(planetaryPositions, houses);

    return {
      year,
      month,
      day,
      hour,
      minute,
      latitude,
      longitude,
      planetaryPositions,
      houses,
      aspects,
    };
  };

  return {
    calculateHoroscope,
    getZodiacSign,
    normalizeAngle,
  };
};
