import swe from "swisseph";

// Horoscope class to calculate planetary positions, houses, aspects, zodiac signs, and planets in houses
class Horoscope {
  constructor(year, month, day, hour, minute, latitude, longitude) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.latitude = latitude;
    this.longitude = longitude;

    // Set the path to Swiss Ephemeris files
    swe.swe_set_ephe_path("./assets/ephe");

    this.planetaryPositions = this.calculatePlanetaryPositions();
    this.houses = this.calculateHouses();
    this.aspects = this.calculateAspects();
    this.assignPlanetsToHouses();
  }

  // Calculate the Julian day
  calculateJulianDay() {
    return swe.swe_julday(
      this.year,
      this.month,
      this.day,
      this.hour + this.minute / 60.0,
      swe.SE_GREG_CAL
    );
  }

  // Map longitude to zodiac sign
  getZodiacSign(longitude) {
    const zodiacSigns = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const index = Math.floor(longitude / 30); // Each sign spans 30 degrees
    return zodiacSigns[index];
  }

  // Calculate planetary positions (longitude, latitude, zodiac sign, and angle)
  calculatePlanetaryPositions() {
    const jd = this.calculateJulianDay();
    const planets = {
      Sun: swe.SE_SUN,
      Moon: swe.SE_MOON,
      Mercury: swe.SE_MERCURY,
      Venus: swe.SE_VENUS,
      Mars: swe.SE_MARS,
      Jupiter: swe.SE_JUPITER,
      Saturn: swe.SE_SATURN,
      Uranus: swe.SE_URANUS,
      Neptune: swe.SE_NEPTUNE,
      Pluto: swe.SE_PLUTO,
    };

    const planetaryPositions = [];
    for (const [name, code] of Object.entries(planets)) {
      const position = swe.swe_calc_ut(jd, code, swe.SEFLG_SWIEPH);
      const longitude = position.longitude;

      planetaryPositions.push({
        name: name,
        longitude: longitude,
        latitude: position.latitude,
        zodiacSign: this.getZodiacSign(longitude), // Assign zodiac sign
        angle: this.calculatePlanetaryAngle(longitude), // Angle is equivalent to the longitude
      });
    }

    return planetaryPositions;
  }

  calculatePlanetaryAngle(longitude) {
    let angle = longitude;

    // Normalize the angle to be within 0-360 degrees
    if (angle < 0) {
      angle += 360;
    } else if (angle >= 360) {
      angle %= 360;
    }

    return angle;
  }

  // Calculate houses
  calculateHouses() {
    const jd = this.calculateJulianDay();
    const houseData = swe.swe_houses(jd, this.latitude, this.longitude, "P");
    const houseCusps = houseData.house;

    const houses = [];
    for (let i = 0; i < houseCusps.length; i++) {
      const cusp = houseCusps[i];
      houses.push({
        houseNumber: i + 1,
        angle: cusp,
        zodiacSign: this.getZodiacSign(cusp), // Assign zodiac sign to house cusp
        planets: [], // To be filled with planets later
      });
    }

    return {
      Ascendant: houseData.ascendant, // Ascendant position
      Midheaven: houseData.mc, // Midheaven position
      Houses: houses, // 12 house cusps
    };
  }

  // Check if a planet is in a house
  isPlanetInHouse(planetLongitude, houseCuspStart, nextHouseCuspStart) {
    if (houseCuspStart < nextHouseCuspStart) {
      return (
        planetLongitude >= houseCuspStart &&
        planetLongitude < nextHouseCuspStart
      );
    } else {
      // Handle houses that cross 360° boundary (e.g., from 11th house to 12th house)
      return (
        (planetLongitude >= houseCuspStart && planetLongitude <= 360) ||
        (planetLongitude >= 0 && planetLongitude < nextHouseCuspStart)
      );
    }
  }

  // Assign planets to houses
  assignPlanetsToHouses() {
    for (const planet of this.planetaryPositions) {
      for (let i = 0; i < this.houses.Houses.length; i++) {
        console.log(this.houses)
        const currentHouse = this.houses.Houses[i];
        const nextHouse = this.houses.Houses[(i + 1) % this.houses.Houses.length]; // Handle 12th to 1st house transition
        const houseCuspStart = currentHouse.angle;
        const nextHouseCuspStart = nextHouse.angle;

        if (
          this.isPlanetInHouse(
            planet.longitude,
            houseCuspStart,
            nextHouseCuspStart
          )
        ) {
          currentHouse.planets.push(planet.name);
        }
      }
    }
  }

  // Calculate aspects between planets
  calculateAspects() {
    const aspects = [];
    const aspectAngles = {
      conjunction: 0,
      sextile: 60,
      square: 90,
      trine: 120,
      opposition: 180,
    };

    // Loop through each pair of planets and calculate the aspects
    for (let i = 0; i < this.planetaryPositions.length; i++) {
      for (let j = i + 1; j < this.planetaryPositions.length; j++) {
        const planet1 = this.planetaryPositions[i];
        const planet2 = this.planetaryPositions[j];

        const angle = Math.abs(planet1.longitude - planet2.longitude);
        const normalizedAngle = angle > 180 ? 360 - angle : angle; // Normalize angle

        for (const [aspect, degree] of Object.entries(aspectAngles)) {
          if (Math.abs(normalizedAngle - degree) <= 8) {
            // Allow an 8° orb for aspects
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
  }

  // Display the horoscope data
  displayHoroscope() {
    console.log(
      "Planetary Positions with Zodiac Signs and Angles:",
      this.planetaryPositions
    );
    console.log("Houses with Zodiac Signs and Planets:", this.houses);
    console.log("Aspects:", this.aspects);
  }
}



export{ Horoscope }