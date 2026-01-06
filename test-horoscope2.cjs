const { Origin, Horoscope } = require("circular-natal-horoscope-js");

// Test data
const origin = new Origin({
  year: 1990,
  month: 0, // January
  date: 15,
  hour: 14,
  minute: 30,
  latitude: 50.1109,
  longitude: 8.6821
});

console.log("Creating Horoscope from Origin...");
const horoscope = new Horoscope({
  origin: origin,
  houseSystem: "placidus",
  zodiac: "tropical",
  aspectPoints: ['bodies', 'points', 'angles'],
  aspectWithPoints: ['bodies', 'points', 'angles'],
  aspectTypes: ["major", "minor"],
  language: 'en'
});

console.log("\nHoroscope CelestialBodies:");
if (horoscope.CelestialBodies) {
  console.log(Object.keys(horoscope.CelestialBodies));
  if (horoscope.CelestialBodies.sun) {
    console.log("\nSun:");
    console.log(JSON.stringify(horoscope.CelestialBodies.sun, null, 2));
  }
}

console.log("\nHoroscope Houses:");
if (horoscope.Houses) {
  console.log(Object.keys(horoscope.Houses));
  if (horoscope.Houses[1]) {
    console.log("\nHouse 1:");
    console.log(JSON.stringify(horoscope.Houses[1], null, 2));
  }
}

console.log("\nAscendant:");
if (horoscope.Ascendant) {
  console.log(JSON.stringify(horoscope.Ascendant, null, 2));
}

console.log("\nMidheaven:");
if (horoscope.Midheaven) {
  console.log(JSON.stringify(horoscope.Midheaven, null, 2));
}
