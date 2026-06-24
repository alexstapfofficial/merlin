<template>
  <UModal v-model="isOpen" :ui="{ width: 'max-w-2xl' }">
    <UCard>
      <template #header>
        <div class="modal-header">
          <h2 class="modal-title">{{ friend ? 'Partner bearbeiten' : 'Neuer Partner' }}</h2>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            @click="close"
          />
        </div>
      </template>

      <ProfileForm
        :profile="friend"
        :title="friend ? 'Partner bearbeiten' : 'Neuer Partner'"
        @save="handleSave"
        @cancel="close"
      />
    </UCard>
  </UModal>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  friend: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleSave = (data) => {
  emit('save', data);
  close();
};

const close = () => {
  isOpen.value = false;
};
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F1D20;
  margin: 0;
}
</style>
