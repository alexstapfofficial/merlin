<template>
  <div class="chart-wrapper">
    <div id="paper" class="font-astronomicon" />
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup>
import { useBirthDataStore } from "~/stores/birthDataStore";
import { useBirthChart } from "~/composables/useBirthChart";

const birthDataStore = useBirthDataStore();
const { horoscope } = storeToRefs(birthDataStore);

// Debug logging
watch(horoscope, (newVal) => {
  console.log('BirthChart: horoscope changed', {
    hasValue: !!newVal,
    hasPlanets: !!newVal?.planetaryPositions,
    hasHouses: !!newVal?.houses,
    hasHousesArray: !!newVal?.houses?.Houses,
    structure: newVal ? Object.keys(newVal) : []
  });
}, { immediate: true, deep: true });

// Use the birth chart composable
const { createReactiveChart } = useBirthChart();
const { error } = createReactiveChart('paper', horoscope);

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    console.error('Chart error:', newError);
  }
});

const { downloadAsPng } = useDownloadImage();

const downloadBirthChartAsPng = () => {
  downloadAsPng(document.getElementById('paper'), 'birth-chart');
};
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#paper {
  font: 12px 'Astronomicon';
  width: 600px;
  height: 600px;
  max-width: 100%;
}

.error-message {
  color: #dc2626;
  padding: 1rem;
  background: #fee;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>