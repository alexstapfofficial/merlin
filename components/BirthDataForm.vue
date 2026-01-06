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
import { useProfile } from '~/composables/useProfile';

const name = ref('');
const birthdate = ref({});
const birthtime = ref({});
const coordinates = ref([]);

const pending = ref(false);

const { generateHoroscopeWithLoading } = useProfile();

const submit = async () => {
    const profile = {
        name: name.value,
        birthdate: birthdate.value,
        birthtime: birthtime.value,
        coordinates: coordinates.value
    };

    await generateHoroscopeWithLoading(profile, pending);
};
</script>
