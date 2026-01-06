const { Origin } = require("circular-natal-horoscope-js");

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

console.log("Origin created successfully!");
console.log("\nAvailable CelestialBodies:");
if (origin.CelestialBodies) {
  console.log(Object.keys(origin.CelestialBodies));
  console.log("\nSun position:");
  console.log(JSON.stringify(origin.CelestialBodies.sun, null, 2));
}

console.log("\nAvailable Houses:");
if (origin.Houses) {
  console.log(Object.keys(origin.Houses));
}

console.log("\nAscendant:");
if (origin.Ascendant) {
  console.log(JSON.stringify(origin.Ascendant, null, 2));
}

console.log("\nMidheaven:");
if (origin.Midheaven) {
  console.log(JSON.stringify(origin.Midheaven, null, 2));
}
