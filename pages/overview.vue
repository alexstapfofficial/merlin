<template>
    <UButton @click="downloadBirthChartAsPng" variant="solid" class="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner focus:outline-none w-full">
            Download Birth Chart
    </UButton>

    <div class="flex items-center justify-center p-8">
        <div class="a4-page relative" id="page">
                <div class="absolute">
                    <h1 class="text-3xl font-justcosmic">{{name}}</h1>
                    <div class="flex justify-between">
                        <h2 class="text-xs font-mono">{{ birthDataStore.getBirthDatetime}}</h2>
                    </div>
                    <div>
                        <h2 class="text-xs font-mono">{{ `${coordinates[0]}°` }}</h2>
                        <h2 class="text-xs font-mono">{{ `${coordinates[1]}°` }}</h2>
                    </div>
                </div>
                <div class="relative">
                    <BirthChart class="w-full h-auto px-16 pt-8"/>
                    <img class="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2" :src="zodiacImagePath"/>
                </div>
                <div class="flex items-start justify-between">
                    <Planets />
                    <Aspects />
                </div>
           
        </div>
    </div>
</template>

<script setup>
import LocaleSwitcher from '~/components/localeSwitcher.vue';
import { useBirthDataStore } from '~/stores/birthDataStore';

const birthDataStore = useBirthDataStore();
const { name, coordinates, horoscope } = storeToRefs(birthDataStore);

const ascendant = computed(()=>{
    if(horoscope.value.houses) return horoscope.value.houses.Houses[0].zodiacSign
})

const zodiacImagePath = computed(()=>{
    return '../img/zodiac/' + ascendant.value + '.svg'
  })

const { downloadAsPng } = useDownloadImage();

const downloadBirthChartAsPng=()=>{
  downloadAsPng(document.getElementById('page'), 'birth-chart');
};
</script>

<style scoped>
.a4-page {
    width: 210mm;
    /* DIN A4 Breite */
    height: 297mm;
    /* DIN A4 Höhe */
    padding: 10mm;
    /* Ränder */
    box-sizing: border-box;
    border: 1px solid #ccc;
    /* Optionale Rahmen zur Visualisierung */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: white;
}


.content {
    flex: 1;
    text-align: justify;
    font-size: 14px;
    line-height: 1.5;
}
</style>