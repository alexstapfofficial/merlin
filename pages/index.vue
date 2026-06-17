<template>
  <div class="profile-page">
    <!-- Profile Header with Avatar and Dropdown -->
    <div class="profile-header">
      <!-- Settings Icon -->
      <button type="button" class="settings-button" @click="goToEditProfile" aria-label="Einstellungen">
        <UIcon name="i-heroicons-cog-6-tooth" class="settings-icon" />
      </button>

      <div v-if="selectedProfile" class="profile-info">
        <!-- Name -->
        <h1 class="profile-name font-justcosmic leading-2.5 text-brown-dark">{{ selectedProfile.name }}</h1>


        <!-- Zodiac Signs -->
        <div class="zodiac-signs">
          <div><span class="font-astronomicon p-2">Q</span>{{ sunSign }}</div>
          <div><span class="font-astronomicon p-2">R</span>{{ moonSign }}</div>
          <div><span class="font-astronomicon p-2">`</span>{{ ascendant }}</div>
        </div>
      </div>

    </div>

    <!-- Tabs for Birth Chart, Planets, Aspects -->
    <div v-show="selectedProfile && birthChart" class="content-tabs">
      <UTabs v-model="selectedTab" :items="tabs" class="profile-tabs" :ui="{
        list: {
          base: 'flex gap-2',
          background: '',
          rounded: '',
          padding: '',
          marker: {
            background: ''
          }
        },
        default: {
          variant: 'pill'
        },
        indicator: {
          background: ''
        },
        tab: {
          base: 'rounded-full px-4 py-2 font-medium transition-all',
          active: 'bg-black text-white',
          inactive: 'bg-transparent text-black hover:bg-gray-100'
        }
      }">
        <template #birthchart>
          <div class="tab-content">
            <div class="chart-container">
              <BirthChart />
            </div>
          </div>
        </template>
        <template #planets>
          <div class="tab-content">
            <div class="planets-component">
              <Planets />
            </div>
          </div>
        </template>
        <template #aspects>
          <div class="tab-content">
            <div class="aspects-component">
              <Aspects />
            </div>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Lade Horoskop...</p>
    </div>

    <!-- Zodiac Cards Grid -->
    <div class="zodiac-cards-section">
      <ZodiacCard :zodiac-sign="sunSignEnglish" label="Sonne" :zodiac-name="sunSign" />
      <ZodiacCard :zodiac-sign="moonSignEnglish" label="Mond" :zodiac-name="moonSign" />
      <ZodiacCard :zodiac-sign="ascendantEnglish" label="Aszendent" :zodiac-name="ascendant" />
    </div>

  </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';
import { useBirthDataStore } from '~/stores/birthDataStore';
import { useProfile } from '~/composables/useProfile';
import { useTranslateZodiac } from '~/composables/translateZodiac';
import { useBirthChart } from '~/composables/useBirthChart';

const router = useRouter();
const profilesStore = useProfilesStore();
const birthDataStore = useBirthDataStore();
const { formatBirthDate, formatBirthTime } = useProfile();
const { translateZodiacName } = useTranslateZodiac();
const { calculateBirthChart } = useBirthChart();

const selectedProfile = ref(null);
const birthChart = ref(null);
const loading = ref(false);
const selectedTab = ref('birthchart');

const tabs = [
  {
    value: 'birthchart',
    label: 'Natal',
    slot: 'birthchart'
  },
  {
    value: 'planets',
    label: 'Planeten',
    slot: 'planets'
  },
  {
    value: 'aspects',
    label: 'Aspekte',
    slot: 'aspects'
  }
];


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
const sunSignEnglish = computed(() => {
  if (!birthChart.value?.planetaryPositions) return '';
  const sun = birthChart.value.planetaryPositions.find(p => p.name === 'Sun');
  return sun?.zodiacSign || '';
});

const sunSign = computed(() => {
  if (!birthChart.value?.planetaryPositions) return '-';
  const sun = birthChart.value.planetaryPositions.find(p => p.name === 'Sun');
  return sun ? translateZodiacName(sun.zodiacSign) : '-';
});

const moonSignEnglish = computed(() => {
  if (!birthChart.value?.planetaryPositions) return '';
  const moon = birthChart.value.planetaryPositions.find(p => p.name === 'Moon');
  return moon?.zodiacSign || '';
});

const moonSign = computed(() => {
  if (!birthChart.value?.planetaryPositions) return '-';
  const moon = birthChart.value.planetaryPositions.find(p => p.name === 'Moon');
  return moon ? translateZodiacName(moon.zodiacSign) : '-';
});

const ascendantEnglish = computed(() => {
  if (!birthChart.value?.houses?.Ascendant) return '';
  const ascDegree = birthChart.value.houses.Ascendant;
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = Math.floor(ascDegree / 30);
  return signs[signIndex] || '';
});

const ascendant = computed(() => {
  if (!birthChart.value?.houses?.Ascendant) return '-';
  const ascDegree = birthChart.value.houses.Ascendant;
  const signs = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
    'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];
  const signIndex = Math.floor(ascDegree / 30);
  return signs[signIndex] || '-';
});


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

const goToEditProfile = () => {
  router.push('/profile/edit');
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

// Load profile and redirect if no profile exists
onMounted(async () => {
  await profilesStore.fetchProfiles();

  if (profilesStore.profile) {
    selectedProfile.value = profilesStore.profile;
    loadBirthChart();
  } else {
    // Redirect to profile creation if no profile exists
    router.push('/profile/edit');
  }
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #F5ECDC;
  padding-bottom: 80px;
}

.profile-header {
  position: relative;
  background: #D7C9B2;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #4D4845;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-button:hover {
  background: rgba(31, 29, 32, 0.1);
  transform: scale(1.1);
}

.settings-icon {
  font-size: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
}

.profile-dropdown-container {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.profile-avatar {
  width: 100px !important;
  height: 100px !important;
  font-size: 2.5rem !important;
  background: #1F1D20 !important;
  color: #F5ECDC !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid #4D4845;
}

.profile-name {
  font-size: 2.25rem;
  font-weight: 700;
  padding: 1rem;
}

.zodiac-signs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.edit-button-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.edit-button-container :deep(.UButton) {
  background: transparent !important;
  color: #1F1D20 !important;
  border: 2px solid #1F1D20 !important;
  font-weight: 600;
  transition: all 0.2s;
}

.edit-button-container :deep(.UButton:hover) {
  background: #1F1D20 !important;
  color: #F5ECDC !important;
}

.zodiac-cards-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  margin: 2rem 0;
  padding: 0.5rem;
}

.zodiac-cards-section :deep(.zodiac-card) {
  width: 100%;
  max-width: none;
}

.zodiac-card-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}

.zodiac-icon {
  font-size: 1.5rem;
  color: #F5ECDC;
}

.zodiac-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.zodiac-label {
  font-size: 0.65rem;
  color: #7B7369;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.zodiac-value {
  font-size: 0.95rem;
  color: #F5ECDC;
  font-weight: 600;
}

.add-profile-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #D7C9B2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.add-profile-section h2 {
  margin-top: 0;
  color: #1F1D20;
}

.content-tabs {
  max-width: 100%;
  margin: 1rem;
  background: transparent;
  overflow: hidden;
}

.profile-tabs :deep([role="tablist"]) {
  border-radius: 9999px !important;
  background: rgba(215, 201, 178, 0.3) !important;
  padding: 0.25rem !important;
  width: fit-content !important;
  margin: 0 auto !important;
}

.profile-tabs :deep(button[role="tab"]) {
  border-radius: 9999px !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500;
  transition: all 0.2s;
  background: transparent !important;
  color: #1F1D20 !important;
  border: none !important;
}

.profile-tabs :deep(button[role="tab"][aria-selected="true"]),
.profile-tabs :deep(button[role="tab"][data-state="active"]) {
  background: #1F1D20 !important;
  color: #F5ECDC !important;
}

.profile-tabs :deep(button[role="tab"]:hover:not([aria-selected="true"])) {
  background: rgba(31, 29, 32, 0.1) !important;
}

.tab-content h2 {
  margin-top: 0;
  color: #1F1D20;
  font-size: 1.25rem;
}

.chart-container {
  display: flex;
  justify-content: center;
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

tr.aspect-conjunction {
  background-color: #fff3e0;
}

tr.aspect-sextile {
  background-color: #e8f5e9;
}

tr.aspect-square {
  background-color: #ffebee;
}

tr.aspect-trine {
  background-color: #e3f2fd;
}

tr.aspect-opposition {
  background-color: #fce4ec;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #1F1D20;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .profile-page {
    padding-bottom: 70px;
  }

  .profile-avatar {
    width: 80px !important;
    height: 80px !important;
    font-size: 2rem !important;
  }

  .zodiac-cards-section {
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .zodiac-signs {
    gap: 0.5rem;
    padding: 0 0.5rem;
  }

  .zodiac-card-content {
    padding: 0.625rem 0.75rem;
  }

  .zodiac-icon {
    font-size: 1.25rem;
  }

  .zodiac-value {
    font-size: 0.875rem;
  }

  .tab-content {
    padding: 0.75rem;
  }
}
</style>
