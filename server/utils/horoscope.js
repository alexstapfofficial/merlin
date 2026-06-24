import CircularHoroscope from "circular-natal-horoscope-js";
const { Origin, Horoscope: CircularHoroscopeClass } = CircularHoroscope;

// Server-side horoscope calculation utilities
export const calculateHoroscope = (year, month, day, hour, minute, latitude, longitude) => {
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

const normalizeAngle = (angle) => {
  if (angle < 0) {
    return angle + 360;
  }
  return angle % 360;
};

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

const calculateHouses = (circularHoroscope) => {
  const houses = [];

  // Hole die Hauptachsen direkt von der Bibliothek
  const ascendant = circularHoroscope.Ascendant?.ChartPosition?.Ecliptic?.DecimalDegrees || 0;
  const midheaven = circularHoroscope.Midheaven?.ChartPosition?.Ecliptic?.DecimalDegrees || 0;

  // Die Bibliothek liefert Häuser als Array mit Index 0-11 (nicht 1-12!)
  // Houses[0] = Haus 1, Houses[1] = Haus 2, ..., Houses[11] = Haus 12
  for (let i = 0; i < 12; i++) {
    const house = circularHoroscope.Houses[i];
    const houseNumber = i + 1; // Hausnummer 1-12
    let cusp;

    if (house && house.ChartPosition && house.ChartPosition.StartPosition) {
      // Verwende die StartPosition der Bibliothek (Placidus-System)
      // Die Bibliothek liefert bereits korrekte Werte inkl. Aszendent für Haus 1
      cusp = house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
    } else {
      console.warn(`Haus ${houseNumber} konnte nicht von der Bibliothek geladen werden`);
      continue;
    }

    houses.push({
      houseNumber: houseNumber,
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
