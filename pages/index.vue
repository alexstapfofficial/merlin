<template>
  <div class="profiles-page">
    <h1 class="page-title">Astrologie Profile</h1>

    <!-- My Profile Section -->
    <section class="profile-section">
      <div class="section-header">
        <h2>Mein Profil</h2>
        <UButton
          v-if="!profilesStore.myProfile && !showMyProfileForm"
          @click="showMyProfileForm = true"
          icon="i-heroicons-plus"
          size="sm"
        >
          Profil erstellen
        </UButton>
      </div>

      <!-- My Profile Card -->
      <div v-if="profilesStore.myProfile" class="profiles-grid">
        <ProfileCard
          :profile="profilesStore.myProfile"
          :is-mine="true"
          @edit="editProfile"
          @delete="deleteProfile"
          @calculate="calculateHoroscope"
        />
      </div>

      <!-- My Profile Form -->
      <div v-if="showMyProfileForm" class="profile-form-container">
        <ProfileForm
          :profile="editingProfile"
          :title="editingProfile ? 'Mein Profil bearbeiten' : 'Mein Profil erstellen'"
          @save="saveMyProfile"
          @cancel="cancelForm"
        />
      </div>
    </section>

    <!-- Friends Profiles Section -->
    <section class="profile-section">
      <div class="section-header">
        <h2>Freunde & Familie ({{ profilesStore.friendProfiles.length }})</h2>
        <UButton
          v-if="!showFriendForm"
          @click="showFriendForm = true"
          icon="i-heroicons-plus"
          size="sm"
        >
          Person hinzufügen
        </UButton>
      </div>

      <!-- Friend Profile Form -->
      <div v-if="showFriendForm" class="profile-form-container">
        <ProfileForm
          :profile="editingProfile"
          :title="editingProfile ? 'Profil bearbeiten' : 'Neue Person hinzufügen'"
          @save="saveFriendProfile"
          @cancel="cancelForm"
        />
      </div>

      <!-- Friends Grid -->
      <div v-if="profilesStore.friendProfiles.length > 0" class="profiles-grid">
        <ProfileCard
          v-for="profile in profilesStore.friendProfiles"
          :key="profile.id"
          :profile="profile"
          :is-mine="false"
          @edit="editProfile"
          @delete="deleteProfile"
          @calculate="calculateHoroscope"
        />
      </div>

      <div v-else-if="!showFriendForm" class="empty-state">
        <p>Noch keine Profile hinzugefügt.</p>
        <p class="text-sm text-gray-500">Füge Profile von Freunden oder Familie hinzu, um Synastrien zu berechnen.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';
import { useProfile } from '~/composables/useProfile';

const profilesStore = useProfilesStore();
const { generateHoroscopeWithLoading } = useProfile();

const showMyProfileForm = ref(false);
const showFriendForm = ref(false);
const editingProfile = ref(null);
const pending = ref(false);

// Load profiles from localStorage on mount
onMounted(() => {
  profilesStore.loadFromLocalStorage();
});

const saveMyProfile = (profileData) => {
  if (editingProfile.value) {
    profilesStore.updateProfile('my-profile', profileData);
  } else {
    profilesStore.setMyProfile(profileData);
  }
  showMyProfileForm.value = false;
  editingProfile.value = null;
};

const saveFriendProfile = (profileData) => {
  if (editingProfile.value) {
    profilesStore.updateProfile(editingProfile.value.id, profileData);
  } else {
    profilesStore.addFriendProfile(profileData);
  }
  showFriendForm.value = false;
  editingProfile.value = null;
};

const editProfile = (profile) => {
  editingProfile.value = profile;
  if (profile.id === 'my-profile') {
    showMyProfileForm.value = true;
  } else {
    showFriendForm.value = true;
  }
};

const deleteProfile = (profile) => {
  if (confirm(`Möchtest du das Profil "${profile.name}" wirklich löschen?`)) {
    profilesStore.deleteProfile(profile.id);
  }
};

const cancelForm = () => {
  showMyProfileForm.value = false;
  showFriendForm.value = false;
  editingProfile.value = null;
};

const calculateHoroscope = async (profile) => {
  await generateHoroscopeWithLoading(profile, pending);
};
</script>

<style scoped>
.profiles-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0e0e0;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.profile-form-container {
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 12px;
  border: 2px dashed #d0d0d0;
}

.empty-state p {
  color: #666;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .profiles-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
