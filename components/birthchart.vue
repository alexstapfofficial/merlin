<template>
  <div class="flex">
    <div id="paper" class="font-astronomicon" />
  </div>
</template>

<script setup>
import { Universe } from "../astrochart2/src/index"
import { useBirthDataStore } from "~/stores/birthDataStore";

const birthDataStore = useBirthDataStore();
const { horoscope } = storeToRefs(birthDataStore);


onMounted(() => {
  const chart = new Universe('paper').radix().setData(chartData.value)
})


const chartData = computed(() => {
  return {
    points: planetaryPositions.value,
    cusps: houses.value,
    midheaven: horoscope.value.houses.Midheaven
  }
});

const planetaryPositions = computed(() => {
  return horoscope.value.planetaryPositions.map((planet) => ({
    name: planet.name,
    angle: planet.angle
  }))
});

const houses = computed(() => {
  return horoscope.value.houses.Houses.map((house) => ({
    angle: house.angle
  }))
});

const { downloadAsPng } = useDownloadImage();

const downloadBirthChartAsPng=()=>{
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