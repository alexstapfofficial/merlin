<template>
  <div class="birthday-picker">
    <UInput
      v-model="dateInput"
      type="date"
      class="birthday-input"
      size="lg"
      :ui="{
        base: 'text-center',
        color: {
          white: {
            outline: 'bg-beige-100 border-beige-900 focus:border-beige-950 focus:ring-beige-950'
          }
        }
      }"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  initialDate: {
    type: Object,
    default: null
  }
});

const dateInput = ref('');
const error = ref('');
const emit = defineEmits(['newDate']);

// Initialize with existing date if provided (convert to YYYY-MM-DD format for type="date")
onMounted(() => {
  if (props.initialDate && props.initialDate.birthday && props.initialDate.birthmonth !== undefined && props.initialDate.birthyear) {
    const day = String(props.initialDate.birthday).padStart(2, '0');
    const month = String(props.initialDate.birthmonth + 1).padStart(2, '0'); // +1 because stored as 0-based
    const year = props.initialDate.birthyear;
    dateInput.value = `${year}-${month}-${day}`; // YYYY-MM-DD format for type="date"
  }
});

// Watch for date changes and emit the parsed data
watch(dateInput, (newValue) => {
  if (!newValue) {
    error.value = '';
    return;
  }

  // Date input format is YYYY-MM-DD
  const [year, month, day] = newValue.split('-').map(num => parseInt(num, 10));

  // Validate
  if (!year || !month || !day) {
    error.value = 'Ungültiges Datum';
    return;
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    error.value = 'Jahr muss zwischen 1900 und heute liegen';
    return;
  }

  // Check if date exists
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    error.value = 'Ungültiges Datum';
    return;
  }

  error.value = '';

  // Emit the date data
  emit('newDate', {
    birthday: day,
    birthmonth: month - 1, // JavaScript Monate sind 0-basiert
    birthyear: year
  });
});
</script>

<style scoped>
.birthday-picker {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.birthday-picker .birthday-input,
.birthday-picker .birthday-input input {
  background: #F5ECDC;
  color: #1F1D20;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
}

.birthday-picker .birthday-input:focus,
.birthday-picker .birthday-input input:focus {
  border-color: #1F1D20;
  box-shadow: 0 0 0 3px rgba(31, 29, 32, 0.1);
  outline: none;
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}
</style>
  