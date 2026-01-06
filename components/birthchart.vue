<template>
  <div class="flex">
    <div id="paper" class="font-astronomicon" />
  </div>
</template>

<script setup>
import { useBirthDataStore } from "~/stores/birthDataStore";
import { useBirthChart } from "~/composables/useBirthChart";

const birthDataStore = useBirthDataStore();
const { horoscope } = storeToRefs(birthDataStore);

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
#paper {
  font: 12px 'Astronomicon';
  width: 100%;
  height: 100%;
}
</style>