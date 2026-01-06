import * as CircularHoroscope from "circular-natal-horoscope-js";
const { Origin } = CircularHoroscope;

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

console.log("Origin structure:");
console.log(JSON.stringify(origin, null, 2));

// Check what properties are available
console.log("\nAvailable properties:");
console.log(Object.keys(origin));
