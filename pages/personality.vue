<template>
    <div>
        <UButton @click="generateHoroscope" :disabled="pending">Horoskop generieren</UButton>
        <p v-if="error" style="color: red;">{{ error }}</p>
        <p v-if="horoscopeText">{{ horoscopeText }}</p>
    </div>
</template>

<script setup>
import { useBirthDataStore } from '~/stores/birthDataStore';
import { useTranslateZodiac } from '~/composables/translateZodiac';
const { getZodiacSymbol, getPlanetSymbol, translatePlanetName, translateZodiacName } = useTranslateZodiac();

const birthDataStore = useBirthDataStore()
const { name, birthdate, birthtime, coordinates, horoscope } = storeToRefs(birthDataStore);

//CHATGPT-Test
const horoscopeText = ref('');
const pending = ref(false);
const error = ref('');

const generateHoroscope = async () => {
  pending.value = true;
  error.value = '';
  horoscopeText.value = '';

  try {
    // Validate that horoscope data is available
    if (!horoscope.value || !horoscope.value.planetaryPositions || !horoscope.value.houses) {
      error.value = 'Bitte berechnen Sie zuerst das Horoskop, bevor Sie eine Analyse erstellen.';
      pending.value = false;
      return;
    }

    // Validate birth data
    if (!birthdate.value || !birthtime.value || !coordinates.value) {
      error.value = 'Geburtsdaten sind nicht vollständig.';
      pending.value = false;
      return;
    }

    // Format the birthdate and birthtime as readable strings
    const birthdateStr = `${birthdate.value.birthday}.${birthdate.value.birthmonth}.${birthdate.value.birthyear}`;
    const birthtimeStr = `${String(birthtime.value.birthhour).padStart(2, '0')}:${String(birthtime.value.birthminute).padStart(2, '0')} Uhr`;
    const locationStr = `Koordinaten: ${coordinates.value[1]}, ${coordinates.value[0]}`;

    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        birthdate: birthdateStr,
        birthtime: birthtimeStr,
        birthlocation: locationStr,
        planets: horoscope.value.planetaryPositions,
        aspects: horoscope.value.aspects,
        houses: horoscope.value.houses.Houses,
        ascendant: horoscope.value.houses.Houses[0]?.zodiacSign,
        mediumcoeli: horoscope.value.houses.Houses[9]?.zodiacSign
      },
    });
    horoscopeText.value = response.horoscope;
  } catch (err) {
    console.error('Fehler beim Generieren des Horoskops:', err);
    error.value = 'Fehler beim Generieren des Horoskops. Bitte versuchen Sie es erneut.';
  } finally {
    pending.value = false;
  }
};

</script>