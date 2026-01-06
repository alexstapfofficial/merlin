<template>
  <UCard class="profile-card" :class="{ 'my-profile': isMine }">
    <template #header>
      <div class="card-header">
        <h3 class="profile-name">{{ profile.name }}</h3>
        <UBadge v-if="isMine" color="primary" variant="soft">Mein Profil</UBadge>
      </div>
    </template>

    <div class="profile-details">
      <div class="detail-item">
        <span class="detail-label">Geboren:</span>
        <span class="detail-value">{{ formatBirthDate(profile.birthdate) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Uhrzeit:</span>
        <span class="detail-value">{{ formatBirthTime(profile.birthtime) }} Uhr</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Ort:</span>
        <span class="detail-value">{{ formatCoordinates(profile.coordinates) }}</span>
      </div>
    </div>

    <template #footer>
      <div class="card-actions">
        <UButton
          @click="$emit('calculate', profile)"
          variant="solid"
          color="primary"
          size="sm"
          class="flex-1"
        >
          Horoskop
        </UButton>
        <UButton
          @click="$emit('edit', profile)"
          icon="i-heroicons-pencil-square"
          variant="outline"
          size="sm"
        />
        <UButton
          v-if="!isMine"
          @click="$emit('delete', profile)"
          icon="i-heroicons-trash"
          color="red"
          variant="outline"
          size="sm"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup>
import { useProfile } from '~/composables/useProfile';

const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  isMine: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'delete', 'calculate']);

const { formatBirthDate, formatBirthTime, formatCoordinates } = useProfile();
</script>

<style scoped>
.profile-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.profile-card.my-profile {
  border: 2px solid #667eea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  color: #333;
  font-family: monospace;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
