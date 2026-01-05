<template>
    <div class="flex gap-8 items-center justify-between">
      <label for="birthdate" class="block text-sm font-medium leading-6 text-gray-900">Geburtstag</label>
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-heroicons-calendar-days-20-solid" :label="formattedDate" variant="ghost"/>
        <template #panel="{ close }">
          <DatePicker v-model="birthdate" is-required @close="closeDatePicker(close)" />
        </template>
      </UPopover>
    </div>
  </template>
  
  <script setup>
  import { format } from 'date-fns'
  
  const birthdate = ref(null); // Default to null, updated on date pick
  const emit = defineEmits(['newDate']);
  
  const closeDatePicker = (close) => {
    const dateSplitted = birthdateSplitted.value;
    emit('newDate', dateSplitted);
    close();
  }
  
  const formattedDate = computed(() => {
    // Ensure that birthdate is not null before formatting
    return birthdate.value ? format(new Date(birthdate.value), 'd MMM, yyyy') : 'Select Date';
  })
  
  const birthday = computed(() => {
    return birthdate.value ? new Date(birthdate.value).getDate() : null;
  })
  
  const birthmonth = computed(() => {
    return birthdate.value ? new Date(birthdate.value).getMonth() : null;
  })
  
  const birthyear = computed(() => {
    return birthdate.value ? new Date(birthdate.value).getFullYear() : null;
  })
  
  const birthdateSplitted = computed(() => {
    return {
      birthday: birthday.value,
      birthmonth: birthmonth.value,
      birthyear: birthyear.value,
    }
  })
  </script>
  