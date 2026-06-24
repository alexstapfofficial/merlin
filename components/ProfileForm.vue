<template>
  <div class="profile-form">
    <h3 class="form-title">{{ title }}</h3>

    <div class="form-content">
      <div class="form-field full-width">
        <label class="field-label">Name</label>
        <UInput
          v-model="formData.name"
          placeholder="Vollständiger Name"
          size="lg"
          class="custom-input"
          :ui="{
            base: 'w-full',
            color: {
              white: {
                outline: 'bg-beige-100 border-beige-900 focus:border-beige-950 focus:ring-beige-950'
              }
            }
          }"
        />
      </div>

      <div class="form-row">
        <div class="form-field">
          <label class="field-label">Geburtstag</label>
          <BirthdayPicker @new-date="(n) => formData.birthdate = n" :initialDate="formData.birthdate" />
        </div>

        <div class="form-field">
          <label class="field-label">Geburtszeit</label>
          <BirthTimeInput @new-time="(n) => formData.birthtime = n" :initialTime="formData.birthtime" />
        </div>
      </div>

      <div class="form-field full-width">
        <LocationInput @new-coordinates="(n) => formData.coordinates = n" :initialCoordinates="formData.coordinates" />
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        @click="emit('cancel')"
        class="cancel-button"
      >
        Abbrechen
      </button>
      <button
        type="button"
        @click="save"
        :disabled="!isValid"
        class="save-button"
      >
        {{ profile ? 'Speichern' : 'Erstellen' }}
      </button>
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

// Initialize form with existing profile data if editing
const formData = ref({
  name: props.profile?.name || '',
  birthdate: props.profile?.birthdate || {},
  birthtime: props.profile?.birthtime || {},
  coordinates: props.profile?.coordinates || []
});

// Watch for profile changes and update form data
watch(() => props.profile, (newProfile) => {
  if (newProfile) {
    formData.value = {
      name: newProfile.name || '',
      birthdate: newProfile.birthdate || {},
      birthtime: newProfile.birthtime || {},
      coordinates: newProfile.coordinates || []
    };
  }
}, { immediate: true });

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
  justify-content: center;
  background: #D7C9B2;
  height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F1D20;
  margin: 0 0 2rem 0;
  text-align: center;
  letter-spacing: -0.5px;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  width: 100%;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1F1D20;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-form .custom-input,
.profile-form .custom-input input {
  background: #F5ECDC;
  color: #1F1D20;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.profile-form .custom-input:focus,
.profile-form .custom-input input:focus {
  border-color: #1F1D20;
  box-shadow: 0 0 0 3px rgba(31, 29, 32, 0.1);
  outline: none;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #4D4845;
}

.form-actions button {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.save-button {
  background: #1F1D20;
  color: #F5ECDC;
}

.save-button:hover:not(:disabled) {
  background: #4D4845;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.save-button:disabled {
  background: #7B7369;
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-button {
  background: transparent;
  border: 2px solid #4D4845;
  color: #1F1D20;
}

.cancel-button:hover {
  background: rgba(31, 29, 32, 0.05);
  border-color: #1F1D20;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .profile-form {
    padding: 1.5rem;
    max-width: 100%;
  }

  .form-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-row {
    gap: 0.75rem;
  }

  .form-actions {
    gap: 0.75rem;
  }

  .form-actions button {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .profile-form {
    padding: 1rem;
  }

  .form-content {
    gap: 1.25rem;
  }

  .form-actions {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .cancel-button {
    order: 2;
  }

  .save-button {
    order: 1;
  }
}
</style>
