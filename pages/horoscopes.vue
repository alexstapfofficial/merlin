<template>
  <div class="transits-page">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="selectedProfile" class="transits-content">
      <div v-if="loading" class="loading">
        Transite werden berechnet...
      </div>

      <div v-else-if="transits && transits.length > 0" class="transits-list font-justcosmic text-brown-dark">
        <h2>{{ formattedDate }}</h2>

        <!-- Life Areas -->
        <LifeAreas
          v-if="transitData"
          :transits="transitData.transits"
          :birth-chart="transitData.birthChart"
          :transit-chart="transitData.transitChart"
        />

        <!-- Elements Donut -->
        <ElementsDonut
          v-if="transitData"
          :birth-chart="transitData.birthChart"
          :transit-chart="transitData.transitChart"
        />

        <!-- Daily Focus -->
        <DailyFocusCard
          v-if="transitData"
          :transits="transitData.transits"
          :birth-chart="transitData.birthChart"
        />

        <div class="transit-info">
          <p>{{ transits.length }} aktive Transit-Aspekte</p>
        </div>

        <!-- Grouped Transits by Aspect -->
        <TransitAspectGroups :transits="transits" />
      </div>

      <div v-else-if="!loading && transits" class="no-transits">
        <p>Keine signifikanten Transite für den {{ formattedDate }} gefunden.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';
import { useTransits } from '~/composables/useTransits';
import { useProfile } from '~/composables/useProfile';
import { useBirthDataStore } from '~/stores/birthDataStore';

const profilesStore = useProfilesStore();
const birthDataStore = useBirthDataStore();
const { calculateTransits } = useTransits();
const { formatBirthDate, formatBirthTime } = useProfile();

const transits = ref(null);
const transitData = ref(null);
const loading = ref(false);
const error = ref('');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const interpretation = ref('');
const interpretationLoading = ref(false);
const selectedProfile = ref(null);

const formattedDate = computed(() => {
  const date = new Date(selectedDate.value);
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const loadTransits = async () => {
  if (!selectedProfile.value) {
    error.value = 'Kein Profil gefunden.';
    return;
  }

  loading.value = true;
  error.value = '';
  interpretation.value = '';

  try {
    const transitDate = new Date(selectedDate.value);
    const result = await calculateTransits({
      birthdate: selectedProfile.value.birthdate,
      birthtime: selectedProfile.value.birthtime,
      coordinates: selectedProfile.value.coordinates
    }, transitDate);

    transits.value = result.transits;
    transitData.value = result;
  } catch (err) {
    console.error('Fehler beim Laden der Transite:', err);
    error.value = 'Fehler beim Berechnen der Transite. Bitte versuchen Sie es erneut.';
  } finally {
    loading.value = false;
  }
};

const interpretTransits = async () => {
  if (!transits.value || transits.value.length === 0) {
    return;
  }

  interpretationLoading.value = true;

  try {
    const response = await $fetch('/api/interpret-transits', {
      method: 'POST',
      body: {
        transits: transits.value,
        date: formattedDate.value
      }
    });

    interpretation.value = response.interpretation;
  } catch (err) {
    console.error('Fehler beim Interpretieren der Transite:', err);
    error.value = 'Fehler beim Interpretieren der Transite. Bitte versuchen Sie es erneut.';
  } finally {
    interpretationLoading.value = false;
  }
};

const renderMarkdown = (markdown) => {
  if (!markdown) return '';

  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

// Load profile and transits on mount
onMounted(async () => {
  await profilesStore.fetchProfiles();

  // Use the main profile
  if (profilesStore.profile) {
    selectedProfile.value = profilesStore.profile;
    loadTransits();
  } else {
    error.value = 'Kein Profil gefunden. Bitte erstelle zuerst ein Profil.';
  }
});
</script>

<style scoped>
.transits-page {
  min-height: 100vh;
  background: #F5ECDC;
  padding: 2rem 1rem 100px;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
}

.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.transits-content {
  max-width: 1200px;
  margin: 0 auto;
}

.selected-profile-info {
  background: #D7C9B2;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.selected-profile-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.selected-profile-info p {
  margin: 0;
  color: #4D4845;
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #4D4845;
}

.transits-list h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.life-area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.life-area-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #1F1D20;
}

.life-area-icon {
  font-size: 1.25rem;
  color: #4D4845;
}

.life-area-percent {
  font-family: sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  color: #4D4845;
}

.life-area-bar-container {
  width: 100%;
  height: 16px;
  background: #F5ECDC;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #D7C9B2;
}

.life-area-bar {
  height: 100%;
  background: linear-gradient(90deg, #7B7369 0%, #4D4845 100%);
  transition: width 0.6s ease-out;
  border-radius: 6px;
}

.transit-info {
  font-family: sans-serif;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-bottom: 2px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transit-info p {
  margin: 0;
  color: #1F1D20;
  font-weight: 600;
}

.interpret-button {
  padding: 0.75rem 1.5rem;
  background: #1F1D20;
  color: #F5ECDC;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.interpret-button:hover:not(:disabled) {
  background: #4D4845;
  transform: translateY(-1px);
}

.interpret-button:disabled {
  background: #7B7369;
  cursor: not-allowed;
  opacity: 0.6;
}

.interpretation-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #D7C9B2;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.interpretation-section h3 {
  margin-top: 0;
  color: #1F1D20;
  font-size: 1.4rem;
}

.interpretation-content {
  line-height: 1.6;
  color: #333;
}

.no-transits {
  text-align: center;
  padding: 3rem;
  color: #4D4845;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2px solid #D7C9B2;
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: #7B7369;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  min-width: 70px;
}

.nav-item.active {
  color: #1F1D20;
}

.nav-item:hover {
  color: #1F1D20;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .daily-vibe-section {
    padding: 1.25rem;
  }

  .vibe-header h3 {
    font-size: 1.25rem;
  }

  .vibe-score {
    font-size: 2rem;
  }

  .vibe-bar-container {
    height: 20px;
  }

  .vibe-description {
    font-size: 0.9rem;
    margin-top: 0.875rem;
  }


  .chevron-icon {
    font-size: 1.25rem;
  }

  .alerts-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .column-icon {
    font-size: 1rem;
  }

  .column-title {
    font-size: 0.75rem;
  }

  .alert-item {
    font-size: 0.7rem;
    padding-left: 0.375rem;
  }

  .life-areas-content {
    padding: 1.25rem;
  }

  .life-area-label {
    font-size: 0.85rem;
  }

  .life-area-icon {
    font-size: 1.1rem;
  }

  .life-area-percent {
    font-size: 0.8rem;
  }

  .life-area-bar-container {
    height: 14px;
  }

}
</style>
