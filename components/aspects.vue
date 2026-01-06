<template>
    <div class="table-container">
      <table class="aspect-matrix  font-astronomicon border-collapse border border-none" id="aspect-matrix">
        <thead>
          <tr>
            <th
              v-for="(planet, index) in planets"
              :key="'header-' + index"
              class="border border-gray-900 bg-gray-900 text-white text-center "
            >
              {{ planet.symbol }}
            </th>
            <th class="border border-gray-900 bg-gray-900 text-white"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(planetRow, rowIndex) in planets" :key="'row-' + rowIndex"> 
            <!-- Aspektzellen -->
            <td
            v-for="(aspectCol, colIndex) in planets"
            :key="'cell-' + rowIndex + '-' + colIndex"
            class="border-gray-900  text-center"
            :class="{
                'border': rowIndex < colIndex,
                'border-none bg-transparent': rowIndex > colIndex,
                'bg-transparent': rowIndex === colIndex,

            }"
            >
            <span v-if="rowIndex < colIndex">
                {{ console.log(rowIndex, colIndex) }}
                {{ getAspectSymbol(planetRow.name, planets[colIndex].name) }}
            </span>
            </td>

            <!-- Erste Spalte (Planetenname) -->
            <th class="border border-gray-900 bg-gray-900 text-white text-center">
              {{ planetRow.symbol }}
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
<script setup>
import { useBirthDataStore } from "~/stores/birthDataStore";

const birthDataStore = useBirthDataStore();
const { horoscope } = storeToRefs(birthDataStore);

const aspects = horoscope.value?.aspects || [];

// Planetenliste
const planets = [
  { name: "Sun", symbol: "Q" },
  { name: "Moon", symbol: "R" },
  { name: "Mercury", symbol: "S" },
  { name: "Venus", symbol: "T" },
  { name: "Mars", symbol: "U" },
  { name: "Jupiter", symbol: "V" },
  { name: "Saturn", symbol: "W" },
  { name: "Uranus", symbol: "X" },
  { name: "Neptune", symbol: "Y" },
  { name: "Pluto", symbol: "Z" },
  { name: "Chiron", symbol: "q" },
  { name: "NNode", symbol: "N" },
  { name: "Lilith", symbol: "l" },
];

// Hilfsfunktion: Aspekt-Symbol
const getAspectSymbol = (planet1, planet2) => {
    const aspect = aspects.find(a => a.planets.includes(planet1) && a.planets.includes(planet2));
console.log(aspect);
  if (aspect) {
    switch (aspect.aspect) {
      case "conjunction":
        return "!";
      case "opposition":
        return `"`;
      case "trine":
        return "$";
      case "square":
        return "#";
      case "sextile":
        return "%";
      default:
        return "";
    }
  }
};

const { downloadAsPng } = useDownloadImage();

const downloadAspectMatrixAsPng=()=>{
  downloadAsPng(document.getElementById('aspect-matrix'), 'aspect-matrix');
};
</script>

<style scoped>
.aspect-matrix th,
.aspect-matrix td {
  font: 700 1rem 'Astronomicon'; 
  aspect-ratio: 1;
  width: 1.5rem;
  height: 1.5rem;
}

.table-container {
  aspect-ratio: 1;
}
</style>