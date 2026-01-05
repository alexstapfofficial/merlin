<template>
    <div class="flex items-center justify-center p-8">
        <form class="max-w-sm border border-gray-300 p-8 space-y-6" @submit.prevent="submit" method="POST">
            <UInput type="text" v-model="name" placeholder="Vor- und Nachame" />
            <BirthdayPicker @new-date="(n) => birthdate = n" />
            <BirthTimeInput @new-time="(n) => birthtime = n" />
            <LocationInput @new-coordinates="(n) => coordinates = n" />
            <UButton type="submit" :disabled="coordinates.length === 0 || !birthdate || !birthtime" variant="solid"
                :loading="pending"
                class="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm font-semibold text-white shadow-inner focus:outline-none w-full">
                Daten analysieren
            </UButton>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBirthDataStore } from '~/stores/birthDataStore';

const name = ref('');
const birthdate = ref({});
const birthtime = ref({});
const coordinates = ref([]);

const pending = ref(false);

const submit = async () => {
    useBirthDataStore().setName(name.value);   
    useBirthDataStore().setBirthdata(birthdate.value, birthtime.value, coordinates.value);
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
