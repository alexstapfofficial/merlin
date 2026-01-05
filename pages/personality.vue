<template>
    <UButton @click="downloadBirthChartAsPng" variant="solid" class="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner focus:outline-none w-full">
            Download Birth Chart
    </UButton>

    <div class="flex items-center justify-center p-8">
        <div class="a4-page relative" id="page">
            <div class="flex items-center justify-between w-full">
                <div class="p-4 w-full">
                    <h1 class="text-3xl font-justcosmic text-center w-full">Dein kosmischer Dreiklang</h1>
                    <h1 class="text-xl font-mono text-center w-full">Kern, Gefühl & Maske</h1>
                </div>
            </div>
            <div class="flex p-12 flex-col justify-between ">
                <div class="border border-gray-300 w-full">
                    <div class="border-b border-gray-300 h-32 p-4">
                        <h2 class="font-justcosmic text-xl">Sonnenzeichen - Dein innerer Kern</h2>
                        <p class="text-xs font-mono pt-2">Das Sonnenzeichen beschreibt den grundlegenden Wesenskern – deine bewussten Ziele, deine Vitalität und das Bild, das du von dir selbst entwirfst. Es zeigt, wohin deine Lebensenergie strömt und welche Qualitäten dich langfristig ausmachen. </p>
                    </div>
                    <div class="flex">
                        <div class="flex flex-col items-center justify-around border-r border-gray-300 p-4 w-36 h-36">
                            <h2 class="text-2xl font-justcosmic">Sonne</h2>
                            <img :src="zodiacSignImagePath(sun)" class="w-8 py-2" alt="Zodiac Sign">
                            <p class="text-sm font-mono pt-2">{{ translateZodiacName(sun) }}</p>
                        </div>
                        <div class="w-full p-4 flex flex-col items-center justify-center">
                            <p class="text-base font-mono pt-2">{{ getSunText }}</p>
                        </div>
                    </div>
                </div>
                <div class="border border-t-0 border-gray-300 w-full">
                    <div class="border-b border-gray-300 h-32 p-4">
                        <h2 class="font-justcosmic text-xl">Mondzeichen - Dein inneres Empfinden</h2>
                        <p class="text-xs font-mono pt-2">Das Mondzeichen repräsentiert deine Gefühlswelt, intime Bedürfnisse und instinktiven Reaktionen. Es zeigt, was dich emotional nährt – also worauf du zurückgreifst, wenn Verstand und Wille pausieren </p>
                    </div>
                    <div class="flex">
                        <div class="flex flex-col items-center justify-around border-r border-gray-300 p-4 w-36 h-36">
                            <h2 class="text-2xl font-justcosmic">Mond</h2>
                            <img :src="zodiacSignImagePath(moon)" class="w-8 py-2" alt="Zodiac Sign">
                            <p class="text-sm font-mono pt-2">{{ translateZodiacName(moon) }}</p>
                        </div>
                        <div class="w-full p-4 flex flex-col items-center justify-center">
                            <p class="text-base font-mono pt-2">{{ getMoonText }}</p>
                        </div>
                    </div>
                </div>
                <div class="border border-t-0 border-gray-300 w-full">
                    <div class="border-b border-gray-300 h-32 p-4">
                        <h2 class="font-justcosmic text-xl">Aszendent - Deine erste Erscheinung</h2>
                        <p class="text-xs font-mono pt-2">Das Mondzeichen repräsentiert deine Gefühlswelt, intime Bedürfnisse und instinktiven Reaktionen. Es zeigt, was dich emotional nährt – also worauf du zurückgreifst, wenn Verstand und Wille pausieren </p>
                    </div>
                    <div class="flex">
                        <div class="flex flex-col items-center justify-around border-r border-gray-300 p-4 w-36 h-36 ">
                            <h2 class="text-2xl font-justcosmic">Aszendent</h2>
                            <img :src="zodiacSignImagePath(ascendant)" class="w-8 py-2" alt="Zodiac Sign">
                            <p class="text-sm font-mono pt-2">{{ translateZodiacName(ascendant) }}</p>
                            </div>
                        <div class="w-full p-4 flex flex-col items-center justify-center">
                            <p class="text-base font-mono pt-2">{{ getAscendantText }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useBirthDataStore } from '~/stores/birthDataStore';
import { useTranslateZodiac } from '~/composables/translateZodiac';
const { getZodiacSymbol, getPlanetSymbol, translatePlanetName, translateZodiacName } = useTranslateZodiac();

const birthDataStore = useBirthDataStore();
const { horoscope } = storeToRefs(birthDataStore);

const ascendant = computed(()=>{
    if(horoscope.value.houses) return horoscope.value.houses.Houses[0].zodiacSign
})

const moon = computed(()=>{
    if(horoscope.value.planetaryPositions){
        console.log(horoscope.value.planetaryPositions)
        // Find the Moon's zodiac sign in the planetary positions
        return horoscope.value.planetaryPositions.find(planet => planet.name === 'Moon').zodiacSign
    } 

})

const sun = computed(()=>{
    if(horoscope.value.planetaryPositions){
        console.log(horoscope.value.planetaryPositions)
        // Find the Moon's zodiac sign in the planetary positions
        return horoscope.value.planetaryPositions.find(planet => planet.name === 'Sun').zodiacSign
    } 

})


const zodiacSignImagePath = (SignName) =>{
    console.log(horoscope.value)
    return '../img/ZodiacSigns/' + SignName + '.png'
}

import personality from '@/public/personality.json'
import { tr } from 'date-fns/locale';

const sunTexts = personality.Sonne;
const moonTexts = personality.Mond;
const ascendantTexts = personality.Aszendent;  

const getSunText = computed(() => {
    return sunTexts.find(text => text.name == translateZodiacName(sun.value)).deutung || 'Keine Beschreibung verfügbar';
});

const getMoonText = computed(() => {
    return moonTexts.find(text => text.name == translateZodiacName(moon.value)).deutung || 'Keine Beschreibung verfügbar';
});

const getAscendantText = computed(() => {
    return ascendantTexts.find(text => text.name == translateZodiacName(ascendant.value)).deutung || 'Keine Beschreibung verfügbar';
});

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
    background-color: white;
}


.content {
    flex: 1;
    text-align: justify;
    font-size: 14px;
    line-height: 1.5;
}
</style>