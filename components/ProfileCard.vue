<template>
  <div class="profile-card" :class="{ 'my-profile': isMine }">
    <UAccordion
      :items="[{
        label: profile.name,
        slot: 'content',
        defaultOpen: false
      }]"
      :ui="{
        wrapper: 'w-full',
        item: {
          base: 'border-none',
        },
        default: {
          class: 'bg-transparent'
        }
      }"
    >
      <template #default="{ item, open }">
        <div class="card-header">
          <h3 class="profile-name font-justcosmic text-gray-700">{{ profile.name }}</h3>
        </div>
      </template>

      <template #content>
        <div class="profile-details">
          <div class="detail-item">
            <span class="detail-label">Geboren</span>
            <span class="detail-value">{{ formatBirthDate(profile.birthdate) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Uhrzeit</span>
            <span class="detail-value">{{ formatBirthTime(profile.birthtime) }} Uhr</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Ort</span>
            <span class="detail-value">{{ formatCoordinates(profile.coordinates) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <UButton
            @click="emit('edit', profile)"
            icon="i-heroicons-pencil-square"
            variant="outline"
            size="sm"
            class="action-button icon-button"
            :ui="{
              variant: {
                outline: 'border-2 border-beige-900 text-beige-950 hover:bg-beige-200'
              }
            }"
          />
          <UButton
            @click="emit('delete', profile)"
            icon="i-heroicons-trash"
            variant="outline"
            size="sm"
            class="action-button icon-button delete-button"
          />
        </div>
      </template>
    </UAccordion>
  </div>
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

const emit = defineEmits(['edit', 'delete', 'calculate']);

const { formatBirthDate, formatBirthTime, formatCoordinates } = useProfile();
</script>

<style scoped>
.profile-card {
  background: #F5ECDC;
  transition: all 0.3s;
}

.profile-card:hover {
  transform: translateY(-4px);
}

.profile-card.my-profile {
  background: linear-gradient(135deg, #F5ECDC 0%, #EBD9BE 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #4D4845;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.my-badge {
  background: #1F1D20;
  color: #F5ECDC;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.75px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(31, 29, 32, 0.03);
}

.detail-label {
  font-weight: 600;
  color: #7B7369;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #1F1D20;
  font-weight: 500;
  font-size: 0.875rem;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-button {
  transition: all 0.2s;
}

.primary-button {
  flex: 1;
  background: #1F1D20 !important;
  color: #F5ECDC !important;
  font-weight: 600;
}

.primary-button:hover {
  background: #4D4845 !important;
  transform: translateY(-1px);
}


.icon-button:hover {
  border-color: #1F1D20 !important;
  background: rgba(31, 29, 32, 0.05) !important;
}

.delete-button {
  border-color: #dc2626 !important;
  color: #dc2626 !important;
}

.delete-button:hover {
  background: #dc2626 !important;
  color: #F5ECDC !important;
}

@media (max-width: 768px) {
  .profile-card {
    padding: 0.5rem;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-item {
    padding: 0.625rem;
  }
}
</style>
