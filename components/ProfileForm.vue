<template>
  <div class="profile-form">
    <h3 class="form-title">{{ title }}</h3>

    <div class="form-content">
      <UInput
        v-model="formData.name"
        placeholder="Name"
        size="lg"
        class="mb-4"
      />

      <div class="form-section">
        <label class="form-label">Geburtsdatum</label>
        <BirthdayPicker @new-date="(n) => formData.birthdate = n" :initialDate="formData.birthdate" class="mb-4" />
      </div>

      <div class="form-section">
        <label class="form-label">Geburtszeit</label>
        <BirthTimeInput @new-time="(n) => formData.birthtime = n" :initialTime="formData.birthtime" class="mb-4" />
      </div>

      <div class="form-section">
        <label class="form-label">Geburtsort</label>
        <LocationInput @new-coordinates="(n) => formData.coordinates = n" :initialCoordinates="formData.coordinates" />
      </div>
    </div>

    <div class="form-actions">
      <UButton
        @click="save"
        :disabled="!isValid"
        size="lg"
        class="flex-1"
      >
        {{ profile ? 'Speichern' : 'Erstellen' }}
      </UButton>
      <UButton
        @click="$emit('cancel')"
        variant="outline"
        size="lg"
      >
        Abbrechen
      </UButton>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  profile: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: 'Profil erstellen'
  }
});

const emit = defineEmits(['save', 'cancel']);

const formData = ref({
  name: '',
  birthdate: {},
  birthtime: {},
  coordinates: []
});

// Initialize form with existing profile data if editing
watchEffect(() => {
  if (props.profile) {
    formData.value = {
      name: props.profile.name || '',
      birthdate: props.profile.birthdate || {},
      birthtime: props.profile.birthtime || {},
      coordinates: props.profile.coordinates || []
    };
  }
});

const isValid = computed(() => {
  return formData.value.name &&
         formData.value.birthdate && Object.keys(formData.value.birthdate).length > 0 &&
         formData.value.birthtime && Object.keys(formData.value.birthtime).length > 0 &&
         formData.value.coordinates && formData.value.coordinates.length > 0;
});

const save = () => {
  if (isValid.value) {
    emit('save', formData.value);
  }
};
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
