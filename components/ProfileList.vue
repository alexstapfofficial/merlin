<template>
  <div class="profile-list">
    <!-- My Profile Card -->
    <div v-if="myProfile" class="profile-card-wrapper">
      <ProfileCard
        :profile="myProfile"
        :is-mine="true"
        @edit="$emit('edit', myProfile)"
        @delete="$emit('delete', myProfile)"
        @calculate="$emit('calculate', myProfile)"
      />
    </div>

    <!-- Create Profile Button if no profile exists -->
    <div v-else class="empty-state">
      <p>Du hast noch kein Profil erstellt</p>
      <UButton
        @click="$emit('create')"
        icon="i-heroicons-plus"
        size="lg"
        class="mt-4"
      >
        Profil erstellen
      </UButton>
    </div>
  </div>
</template>

<script setup>
defineProps({
  myProfile: {
    type: Object,
    default: null
  }
});

defineEmits(['edit', 'delete', 'calculate', 'create']);
</script>

<style scoped>
.profile-list {
  width: 100%;
}

.profile-card-wrapper {
  max-width: 400px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(31, 29, 32, 0.03);
  border-radius: 12px;
  border: 2px dashed #7B7369;
}

.empty-state p {
  color: #1F1D20;
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.empty-state :deep(.UButton) {
  background: #1F1D20 !important;
  color: #F5ECDC !important;
  border: none !important;
  font-weight: 600;
  transition: all 0.2s;
}

.empty-state :deep(.UButton:hover) {
  background: #4D4845 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .profile-card-wrapper {
    max-width: 100%;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
