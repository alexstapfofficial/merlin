import { useI18n } from "vue-i18n";

export const useTranslateZodiac = () => {
    const { t: $t } = useI18n();
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
    switch (planet) {
      case "Moon":
        return $t("planets.moon");
      case "Mercury":
        return $t("planets.mercury");
      case "Venus":
        return $t("planets.venus");
      case "Sun":
        return $t("planets.sun");
      case "Mars":
        return $t("planets.mars");
      case "Jupiter":
        return $t("planets.jupiter");
      case "Saturn":
        return $t("planets.saturn");
      case "Uranus":
        return $t("planets.uranus");
      case "Neptune":
        return $t("planets.neptune");
      case "Pluto":
        return $t("planets.pluto");
      case "Chiron":
        return $t("planets.chiron");
      case "NNode":
        return $t("planets.nnode");
      case "Lilith":
        return $t("planets.lilith");
    }
  };

  const translateZodiacName = (zodiac) => {
    switch (zodiac) {
      case "Aries":
        return $t("zodiacs.aries");
      case "Taurus":
        return $t("zodiacs.taurus");
      case "Gemini":
        return $t("zodiacs.gemini");
      case "Cancer":
        return $t("zodiacs.cancer");
      case "Leo":
        return $t("zodiacs.leo");
      case "Virgo":
        return $t("zodiacs.virgo");
      case "Libra":
        return $t("zodiacs.libra");
      case "Scorpio":
        return $t("zodiacs.scorpio");
      case "Sagittarius":
        return $t("zodiacs.sagittarius");
      case "Capricorn":
        return $t("zodiacs.capricorn");
      case "Aquarius":
        return $t("zodiacs.aquarius");
      case "Pisces":
        return $t("zodiacs.pisces");
    }
  };

  return {
    getZodiacSymbol,
    getPlanetSymbol,
    translateZodiacName,
    translatePlanetName,
  };
};
