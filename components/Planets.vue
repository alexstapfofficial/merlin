<template>
  <div class="table-container">
    <div class="flex justify-center items-center">
      <table class="astro-table p-8" id="astro-table">
        <tbody class="bg-transparent text-gray-800 font-justcosmic border border-black">
          <template v-for="(row, index) in finalRows" :key="index">
            <tr>
              <!-- Zeichen: Wird nur beim ersten Vorkommen eines Zeichens angezeigt -->
              <td v-if="row.firstInSign" :rowspan="row.signRowspan">
                {{ translateZodiacName(row.sign) }}
                <span class="font-astronomicon">{{getZodiacSymbol(row.sign)}}</span>
              </td>
              <!-- Planetenname -->
              <td class="bg-white font-mono text-xs">
                {{ translatePlanetName(row.planet) }}
                <span class="font-astronomicon">{{getPlanetSymbol(row.planet)}}</span>
              </td>
              <!-- Haus: Wird nur beim ersten Vorkommen eines Hauses in einem Block angezeigt -->
              <td v-if="row.firstInHouse" :rowspan="row.houseRowspan">
                {{ row.house }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBirthDataStore } from '~/stores/birthDataStore';
import { storeToRefs } from 'pinia';

const birthDataStore = useBirthDataStore();
const { birthdate, birthtime, coordinates, horoscope } = storeToRefs(birthDataStore);


// Erstelle das birthChart aus den Horoskop-Daten
const birthChart = computed(() => {
  const chart = [];
  if (horoscope.value?.houses) {
    horoscope.value.houses.Houses.forEach((house) => {
      house.planets.forEach((planet) => {
        chart.push({
          planet: planet.name,
          sign: planet.sign,
          house: house.houseNumber,
          degree: planet.degree,
        });
      });
    });
  }
  return chart;
});

import { useTranslateZodiac } from '~/composables/translateZodiac';
const { getZodiacSymbol, getPlanetSymbol, translatePlanetName, translateZodiacName } = useTranslateZodiac();

const getCustomZodiacOrder = (ascendant) => {
  const allSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const ascendantIndex = allSigns.indexOf(ascendant);
  if (ascendantIndex === -1) return allSigns; // Fallback, falls Aszendent nicht gefunden wird

  // Verschiebe den Aszendenten und die folgenden Zeichen an den Anfang
  return [
    ...allSigns.slice(ascendantIndex), // Zeichen ab dem Aszendenten
    ...allSigns.slice(0, ascendantIndex), // Zeichen vor dem Aszendenten
  ];
};

const finalRows = computed(() => {
  if (!horoscope.value || !horoscope.value.houses) {
    return [];
  }
  // Dynamisch sortiertes Zodiac-Order basierend auf dem Aszendenten
  const customZodiacOrder = getCustomZodiacOrder(horoscope.value?.houses.Houses[0].zodiacSign || "Aries");

  const sorted = [...birthChart.value].sort((a, b) => {
    // Konvertiere Hauswerte in Zahlen
    const houseA = parseInt(a.house, 10);
    const houseB = parseInt(b.house, 10);

    // Flag, ob es sich um das 12. Haus handelt
    const isA12 = houseA === 12;
    const isB12 = houseB === 12;

    // Wenn nur einer der beiden im 12. Haus ist, soll dieser immer später kommen
    if (isA12 !== isB12) {
      return isA12 ? 1 : -1;
    }

    // Beide sind entweder 12 oder nicht 12 – dann nach dem Zodiac Order (basierend auf dem Aszendenten)
    const signOrderA = customZodiacOrder.indexOf(a.sign);
    const signOrderB = customZodiacOrder.indexOf(b.sign);
    if (signOrderA !== signOrderB) {
      return signOrderA - signOrderB;
    }

    // Wenn das Zeichen gleich ist und beide entweder 12 oder nicht 12 sind, sortiere nach Hausnummer
    return houseA - houseB;
  });





  // (Hier die bereits vorhandene Logik für rowspan etc. beibehalten)
  const result = sorted.map((row, i, arr) => {
    const firstInSign = i === 0 || row.sign !== arr[i - 1].sign;
    const firstInHouse = i === 0 || row.house !== arr[i - 1].house;
    return {
      ...row,
      firstInSign,
      firstInHouse,
      signRowspan: 0,
      houseRowspan: 0,
    };
  });

  result.forEach((row, i, arr) => {
    if (row.firstInSign) {
      let count = 1;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j].sign === row.sign) count++;
        else break;
      }
      row.signRowspan = count;
    }
  });

  result.forEach((row, i, arr) => {
    if (row.firstInHouse) {
      let count = 1;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j].house === row.house) count++;
        else break;
      }
      row.houseRowspan = count;
    }
  });

  return result;
});

const { downloadAsPng } = useDownloadImage();
const { downloadAsMarkdown } = useDownloadMarkdown();

const downloadPlanetTableAsPng=()=>{
  downloadAsPng(document.getElementById('astro-table'), 'planet-table');
};






</script>

<style scoped>
.table-container {
  max-width: 100%;
}


.astro-table th,
.astro-table td {
  padding: 8px;
  text-align: center;
}

.astro-table th {
  background-color: #FFF9F1;
}

/* Zellen mit rowspan erhalten eine sichtbare Border */
.astro-table td[rowspan] {
  border: 1px solid #000;
  vertical-align: middle;
}

/* Andere td-Zellen haben keine Border */
.astro-table td:not([rowspan]) {
  border: none;
}
</style>
