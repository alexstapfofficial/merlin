<template>
    <div class="table-container">
      <div class="table">
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
    </div>
  </template>
<script setup>
import { useBirthDataStore } from "~/stores/birthDataStore";

const birthDataStore = useBirthDataStore();
const { horoscope } = storeToRefs(birthDataStore);

const aspects = computed(() => horoscope.value?.aspects || []);

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
  { name: "NNode", symbol: "g" },
  { name: "Lilith", symbol: "z" },
];

// Hilfsfunktion: Aspekt-Symbol
const getAspectSymbol = (planet1, planet2) => {
    const aspect = aspects.value.find(a => a.planets.includes(planet1) && a.planets.includes(planet2));
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
  return "";
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

.table {
  aspect-ratio: 1;
  display: inline-block;
}

.table-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 0;
}

@media (max-width: 768px) {
  .table-container {
    padding: 0;
    margin: 0;
    align-items: flex-start;
  }

  .table {
    display: inline-block;
    aspect-ratio: auto;
  }

  .aspect-matrix th,
  .aspect-matrix td {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.875rem;
  }
}
</style>