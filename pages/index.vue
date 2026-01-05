<template>
  <div class="flex gap-8 p-8">
  <UCard v-for="profile in profiles" :key="profile.name" class="mb-4 max-w-72">
    <template #header>
      <h1 class="text-3xl font-justcosmic">{{ profile.name }}</h1>
    </template>

    <h2 class='text-lg font-mono' v-if="profile.birthdate">Geboren am {{ profile.birthdate.birthday }}.{{ profile.birthdate.birthmonth }}.{{ profile.birthdate.birthyear }}</h2>
    <h2 class='text-lg font-mono' v-if="profile.birthtime">um {{ profile.birthtime.birthhour }}:{{ profile.birthtime.birthminute }} Uhr</h2>
    <h2 class='text-lg font-mono' v-if="profile.coordinates">in {{ profile.coordinates[0] }}, {{ profile.coordinates[1] }}</h2>

    <template #footer>
      <UButton @click="generateHoroscope(profile)" variant="solid" class="w-full" :loading="pending">
        Daten analysieren
      </UButton>
    </template>
  </UCard>
  </div>

  <BirthDataForm/>
</template>

<script setup>
  const profiles = ref([{name: 'Alexander Stapf', birthdate: {birthday: 27, birthmonth: 11, birthyear: 1995}, birthtime: {birthhour: 13, birthminute: 36}, coordinates: [9.16, 49.80]},
                        {name: 'Christina Schorcht', birthdate: {birthday: 10, birthmonth: 1, birthyear: 1996}, birthtime: {birthhour: 7, birthminute: 5}, coordinates: [9.16, 49.80]}]);

const pending = ref(false);

const generateHoroscope = async (profile) => {
  useBirthDataStore().setName(profile.name);   
  useBirthDataStore().setBirthdata(profile.birthdate, profile.birthtime, profile.coordinates);
  try {
      pending.value = true;
      await useBirthDataStore().fetchHoroscope();
  } catch (error) {
      console.error('Error fetching horoscope:', error);
      pending.value = false;
  } finally {
      pending.value = false;
  }

  await navigateTo('/personality');
};

</script>