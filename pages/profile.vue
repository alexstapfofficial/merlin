<template>
  <div class="profile-page">
    <!-- Profile Header with Avatar and Dropdown -->
    <div class="profile-header">
      <div class="profile-dropdown-container">
        <USelect
          v-model="selectedProfileId"
          :options="profileOptionsWithAdd"
          size="xl"
          @change="onProfileChange"
          class="profile-select"
        />
      </div>

      <div v-if="selectedProfile && !showAddProfile" class="profile-info">
        <!-- Avatar -->
        <div class="avatar-container">
          <div class="avatar">
            {{ getInitials(selectedProfile.name) }}
          </div>
        </div>

        <!-- Name -->
        <h1 class="profile-name">{{ selectedProfile.name }}</h1>

        <!-- Zodiac Signs -->
        <div class="zodiac-signs">
          <div class="zodiac-item">
            <span class="zodiac-icon">☉</span>
            <div class="zodiac-info">
              <span class="zodiac-label">Sonne</span>
              <span class="zodiac-value">{{ sunSign }}</span>
            </div>
          </div>

          <div class="zodiac-item">
            <span class="zodiac-icon">⬆</span>
            <div class="zodiac-info">
              <span class="zodiac-label">Aszendent</span>
              <span class="zodiac-value">{{ ascendant }}</span>
            </div>
          </div>

          <div class="zodiac-item">
            <span class="zodiac-icon">☽</span>
            <div class="zodiac-info">
              <span class="zodiac-label">Mond</span>
              <span class="zodiac-value">{{ moonSign }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Profile Form -->
      <div v-if="showAddProfile" class="add-profile-section">
        <h2>Neues Profil erstellen</h2>
        <ProfileForm
          @save="saveNewProfile"
          @cancel="cancelAddProfile"
        />
      </div>
    </div>

    <!-- Tabs for Birth Chart, Planets, Aspects -->
    <div v-if="selectedProfile && birthChart && !showAddProfile" class="content-tabs">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.key"
          @click="selectedTab = index"
          :class="['tab-button', { active: selectedTab === index }]"
        >
          <Icon :name="tab.icon" class="tab-icon" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-panels">
        <!-- Birth Chart Tab -->
        <div v-show="selectedTab === 0" class="tab-content">
          <div class="chart-container">
            <BirthChart />
          </div>
        </div>

        <!-- Planets Tab -->
        <div v-show="selectedTab === 1" class="tab-content">
          <div class="planets-component">
            <Planets />
          </div>
        </div>

        <!-- Aspects Tab -->
        <div v-show="selectedTab === 2" class="tab-content">
          <div class="aspects-component">
            <Aspects />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Lade Horoskop...</p>
    </div>

    <!-- App-Style Bottom Navigation -->
    <nav class="bottom-nav">
      <NuxtLink to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <Icon name="i-heroicons-home" class="nav-icon" />
        <span class="nav-label">Home</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item" :class="{ active: $route.path === '/profile' }">
        <Icon name="i-heroicons-user-circle" class="nav-icon" />
        <span class="nav-label">Profil</span>
      </NuxtLink>

      <NuxtLink to="/horoscopes" class="nav-item" :class="{ active: $route.path === '/horoscopes' }">
        <Icon name="i-heroicons-star" class="nav-icon" />
        <span class="nav-label">Horoskope</span>
      </NuxtLink>

      <NuxtLink to="/wiki" class="nav-item" :class="{ active: $route.path === '/wiki' }">
        <Icon name="i-heroicons-book-open" class="nav-icon" />
        <span class="nav-label">Wiki</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';
import { useBirthDataStore } from '~/stores/birthDataStore';
import { useProfile } from '~/composables/useProfile';
import { useTranslateZodiac } from '~/composables/translateZodiac';
import { useBirthChart } from '~/composables/useBirthChart';

const profilesStore = useProfilesStore();
const birthDataStore = useBirthDataStore();
const { formatBirthDate, formatBirthTime } = useProfile();
const { translateZodiacName } = useTranslateZodiac();
const { calculateBirthChart } = useBirthChart();

const selectedProfileId = ref(null);
const selectedProfile = ref(null);
const birthChart = ref(null);
const loading = ref(false);
const showAddProfile = ref(false);
const selectedTab = ref(0);

const tabs = [
  { key: 'birthchart', label: 'Geburtshoroskop', icon: 'i-heroicons-chart-pie' },
  { key: 'planets', label: 'Planeten', icon: 'i-heroicons-globe-alt' },
  { key: 'aspects', label: 'Aspekte', icon: 'i-heroicons-link' }
];

// Profile options with "Add new" option
const profileOptionsWithAdd = computed(() => {
  const options = [];

  if (profilesStore.myProfile) {
    options.push({
      value: 'my-profile',
      label: `${profilesStore.myProfile.name} (Mein Profil)`
    });
  }

  profilesStore.friendProfiles.forEach(profile => {
    options.push({
      value: profile.id,
      label: profile.name
    });
  });

  options.push({
    value: '__add_new__',
    label: '+ Neues Profil erstellen'
  });

  return options;
});

// Get initials for avatar
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Calculate zodiac signs
const sunSign = computed(() => {
  if (!birthChart.value?.planetaryPositions) return '-';
  const sun = birthChart.value.planetaryPositions.find(p => p.name === 'Sun');
  return sun ? translateZodiacName(sun.zodiacSign) : '-';
});

const moonSign = computed(() => {
  if (!birthChart.value?.planetaryPositions) return '-';
  const moon = birthChart.value.planetaryPositions.find(p => p.name === 'Moon');
  return moon ? translateZodiacName(moon.zodiacSign) : '-';
});

const ascendant = computed(() => {
  if (!birthChart.value?.houses?.Ascendant) return '-';
  const ascDegree = birthChart.value.houses.Ascendant;
  const signs = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
                 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];
  const signIndex = Math.floor(ascDegree / 30);
  return signs[signIndex] || '-';
});

const onProfileChange = () => {
  if (selectedProfileId.value === '__add_new__') {
    showAddProfile.value = true;
    selectedProfile.value = null;
    birthChart.value = null;
    return;
  }

  showAddProfile.value = false;

  if (selectedProfileId.value === 'my-profile') {
    selectedProfile.value = profilesStore.myProfile;
  } else {
    selectedProfile.value = profilesStore.friendProfiles.find(
      p => p.id === selectedProfileId.value
    );
  }

  if (selectedProfile.value) {
    loadBirthChart();
  }
};

const loadBirthChart = async () => {
  if (!selectedProfile.value) return;

  loading.value = true;

  try {
    const chart = await calculateBirthChart(selectedProfile.value);
    birthChart.value = chart;

    // Update birthDataStore so Planets and Aspects components can access the data
    birthDataStore.name = selectedProfile.value.name;
    birthDataStore.birthdate = selectedProfile.value.birthdate;
    birthDataStore.birthtime = selectedProfile.value.birthtime;
    birthDataStore.coordinates = selectedProfile.value.coordinates;
    birthDataStore.horoscope = chart;
  } catch (err) {
    console.error('Fehler beim Laden des Geburtshoroskops:', err);
  } finally {
    loading.value = false;
  }
};

const saveNewProfile = (profileData) => {
  profilesStore.addFriendProfile(profileData);
  showAddProfile.value = false;

  // Select the newly created profile
  const newProfile = profilesStore.friendProfiles[profilesStore.friendProfiles.length - 1];
  selectedProfileId.value = newProfile.id;
  selectedProfile.value = newProfile;
  loadBirthChart();
};

const cancelAddProfile = () => {
  showAddProfile.value = false;
  // Reselect the previous profile if available
  if (profilesStore.myProfile) {
    selectedProfileId.value = 'my-profile';
    selectedProfile.value = profilesStore.myProfile;
  }
};

const getAspectSymbol = (aspect) => {
  const symbols = {
    conjunction: '☌',
    sextile: '⚹',
    square: '□',
    trine: '△',
    opposition: '☍'
  };
  return symbols[aspect] || aspect;
};

// Load profiles and auto-select on mount
onMounted(() => {
  profilesStore.loadFromLocalStorage();

  if (profilesStore.myProfile) {
    selectedProfileId.value = 'my-profile';
    selectedProfile.value = profilesStore.myProfile;
    loadBirthChart();
  }
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F5F5DC;
  padding-bottom: 80px;
}

.profile-header {
  background: #FFFEF7;
  border-radius: 0 0 20px 20px;
  padding: 1.5rem 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.profile-dropdown-container {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.profile-info {
  text-align: center;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #F5F5DC;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border: 2px solid #333;
}

.profile-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.zodiac-signs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.zodiac-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border-radius: 8px;
  min-width: 120px;
  flex: 1;
  max-width: 140px;
}

.zodiac-icon {
  font-size: 1.5rem;
  color: #F5F5DC;
}

.zodiac-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.zodiac-label {
  font-size: 0.65rem;
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.zodiac-value {
  font-size: 0.95rem;
  color: #F5F5DC;
  font-weight: 600;
}

.add-profile-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #FFFEF7;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.add-profile-section h2 {
  margin-top: 0;
  color: #1a1a1a;
}

.content-tabs {
  max-width: 100%;
  margin: 1rem;
  background: #FFFEF7;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.tab-navigation {
  display: flex;
  border-bottom: 2px solid #333;
  background: #1a1a1a;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: #999;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background: rgba(245, 245, 220, 0.1);
  color: #F5F5DC;
}

.tab-button.active {
  background: rgba(245, 245, 220, 0.15);
  color: #F5F5DC;
  border-bottom-color: #F5F5DC;
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-panels {
  padding: 1rem;
}

.tab-content {
  padding: 0.5rem 0;
}

.tab-content h2 {
  margin-top: 0;
  color: #1a1a1a;
  font-size: 1.25rem;
}

.chart-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.planets-table,
.aspects-table {
  overflow-x: auto;
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

.planet-name,
.aspect-planet {
  font-weight: 600;
  color: #333;
}

.planet-sign {
  color: #667eea;
  font-weight: 500;
}

.aspect-symbol {
  font-size: 1.5rem;
  text-align: center;
  color: #764ba2;
}

tr.aspect-conjunction { background-color: #fff3e0; }
tr.aspect-sextile { background-color: #e8f5e9; }
tr.aspect-square { background-color: #ffebee; }
tr.aspect-trine { background-color: #e3f2fd; }
tr.aspect-opposition { background-color: #fce4ec; }

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #1a1a1a;
  font-size: 1rem;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-top: 2px solid #333;
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: #999;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  min-width: 70px;
}

.nav-item.active {
  color: #F5F5DC;
}

.nav-item:hover {
  color: #F5F5DC;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .profile-page {
    padding-bottom: 70px;
  }

  .profile-header {
    padding: 1rem 0.75rem 1.5rem;
    border-radius: 0 0 16px 16px;
  }

  .avatar {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }

  .profile-name {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .zodiac-signs {
    gap: 0.5rem;
    padding: 0 0.5rem;
  }

  .zodiac-item {
    min-width: 100px;
    max-width: 120px;
    padding: 0.625rem 0.75rem;
  }

  .zodiac-icon {
    font-size: 1.25rem;
  }

  .zodiac-value {
    font-size: 0.875rem;
  }

  .content-tabs {
    margin: 0.75rem;
    border-radius: 8px;
  }

  .tab-button {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  .tab-icon {
    font-size: 1rem;
  }

  .tab-panels {
    padding: 0.75rem;
  }

  .nav-icon {
    font-size: 1.35rem;
  }

  .nav-label {
    font-size: 0.65rem;
  }
}
</style>
