<template>
  <div>
      <ProfileForm
        :profile="profileData"
        :title="isEditing ? 'Dein Profil bearbeiten' : 'Dein Profil erstellen'"
        @save="saveProfile"
        @cancel="goBack"
      />
  </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';

definePageMeta({
  layout: 'blank'
});

const router = useRouter();
const profilesStore = useProfilesStore();

// Load profile on mount
onMounted(async () => {
  await profilesStore.fetchProfiles();
});

// Check if we're editing an existing profile
const isEditing = computed(() => !!profilesStore.profile);
const profileData = computed(() => profilesStore.profile || null);

const saveProfile = async (formData) => {
  if (isEditing.value) {
    await profilesStore.updateProfile(formData);
  } else {
    await profilesStore.setProfile(formData);
  }
  router.push('/');
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: #F5ECDC;
  padding-bottom: 100px;
}

.page-header {
  max-width: 800px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button :deep(.UButton) {
  color: #1F1D20 !important;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1F1D20;
  letter-spacing: -1px;
}

@media (max-width: 768px) {
  .edit-profile-page {
    padding: 1rem;
    padding-bottom: 100px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-container {
    padding: 1.5rem;
  }
}
</style>
