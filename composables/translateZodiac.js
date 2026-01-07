export const useTranslateZodiac = () => {
  const getZodiacSymbol = (sign) => {
    switch (sign) {
      case "Aries":
        return "A";
      case "Taurus":
        return "B";
      case "Gemini":
        return "C";
      case "Cancer":
        return "D";
      case "Leo":
        return "E";
      case "Virgo":
        return "F";
      case "Libra":
        return "G";
      case "Scorpio":
        return "H";
      case "Sagittarius":
        return "I";
      case "Capricorn":
        return "J";
      case "Aquarius":
        return "K";
      case "Pisces":
        return "L";
    }
  };

  const getPlanetSymbol = (planet) => {
    switch (planet) {
      case "Moon":
        return "R";
      case "Mercury":
        return "S";
      case "Venus":
        return "T";
      case "Sun":
        return "Q";
      case "Mars":
        return "U";
      case "Jupiter":
        return "V";
      case "Saturn":
        return "W";
      case "Uranus":
        return "X";
      case "Neptune":
        return "Y";
      case "Pluto":
        return "Z";
      case "Chiron":
        return "q"; // Chiron Symbol
      case "NNode":
        return "N"; // North Node Symbol
      case "Lilith":
        return "l"; // Lilith Symbol
    }
  };

  const translatePlanetName = (planet) => {
    const translations = {
      "Moon": "Mond",
      "Mercury": "Merkur",
      "Venus": "Venus",
      "Sun": "Sonne",
      "Mars": "Mars",
      "Jupiter": "Jupiter",
      "Saturn": "Saturn",
      "Uranus": "Uranus",
      "Neptune": "Neptun",
      "Pluto": "Pluto",
      "Chiron": "Chiron",
      "NNode": "Mondknoten",
      "Lilith": "Lilith"
    };
    return translations[planet] || planet;
  };

  const translateZodiacName = (zodiac) => {
    const translations = {
      "Aries": "Widder",
      "Taurus": "Stier",
      "Gemini": "Zwillinge",
      "Cancer": "Krebs",
      "Leo": "Löwe",
      "Virgo": "Jungfrau",
      "Libra": "Waage",
      "Scorpio": "Skorpion",
      "Sagittarius": "Schütze",
      "Capricorn": "Steinbock",
      "Aquarius": "Wassermann",
      "Pisces": "Fische"
    };
    return translations[zodiac] || zodiac;
  };

  return {
    getZodiacSymbol,
    getPlanetSymbol,
    translateZodiacName,
    translatePlanetName,
  };
};
