<template>
  <div class="synastry-page">
    <!-- Profile Header -->
    <div class="profile-header">
      <div v-if="myProfile" class="profile-info">
        <!-- Name -->
        <h1 class="profile-name font-justcosmic leading-2.5 text-brown-dark">{{ myProfile.name }}</h1>

        <!-- Zodiac Signs -->
        <div v-if="myChart" class="zodiac-signs">
          <div><span class="font-astronomicon p-2">Q</span>{{ sunSign }}</div>
          <div><span class="font-astronomicon p-2">R</span>{{ moonSign }}</div>
          <div><span class="font-astronomicon p-2">`</span>{{ ascendant }}</div>
        </div>
      </div>
    </div>

    <!-- Friends Section -->
    <div class="friends-section">
      <div class="section-header">
        <h2 class="section-title">Partner Profile</h2>
        <UButton
          @click="showAddForm = !showAddForm"
          :icon="showAddForm ? 'i-heroicons-x-mark' : 'i-heroicons-plus'"
          color="black"
          variant="solid"
          size="sm"
        >
          {{ showAddForm ? 'Abbrechen' : 'Neu' }}
        </UButton>
      </div>

      <!-- Add Friend Form -->
      <div v-if="showAddForm" class="add-form-card">
        <ProfileForm
          :profile="null"
          title="Neuer Partner"
          @save="handleAddFriend"
          @cancel="showAddForm = false"
        />
      </div>

      <!-- Friends List -->
      <div v-if="friends.length > 0" class="friends-list">
        <div
          v-for="friend in friends"
          :key="friend.id"
          @click="selectFriend(friend)"
        >
          <FriendCard
            :friend="friend"
            :is-selected="selectedFriend?.id === friend.id"
            @edit="openEditModal"
            @delete="deleteFriend"
          />
        </div>
      </div>

      <div v-else-if="!showAddForm" class="empty-state">
        <p>Noch keine Partner Profile angelegt.</p>
        <p class="empty-hint">Erstelle ein Partner Profil, um die Synastrie zu berechnen.</p>
      </div>
    </div>

    <!-- Calculate Button -->
    <div v-if="selectedFriend && myProfile" class="calculate-section">
      <UButton
        @click="calculateCompatibility"
        :disabled="loading"
        size="lg"
        color="black"
        block
      >
        {{ loading ? 'Berechne...' : 'Synastrie berechnen' }}
      </UButton>
    </div>

    <!-- Results Section -->
    <div v-if="synastryResult" class="results-section">
      <!-- Compatibility Score Overview -->
      <div class="score-card">
        <div class="score-main">
          <div class="score-number" :style="{ color: compatibilityLevel.color }">
            {{ synastryResult.compatibilityScore.total }}
          </div>
          <div class="score-label">von 100 Punkten</div>
          <div class="score-level" :style="{ color: compatibilityLevel.color }">
            {{ compatibilityLevel.emoji }} {{ compatibilityLevel.level }}
          </div>
        </div>

        <div class="score-stats">
          <div class="stat-item">
            <span class="stat-label">Aspekte insgesamt</span>
            <span class="stat-value">{{ synastryResult.compatibilityScore.aspectCount }}</span>
          </div>
          <div class="stat-item positive">
            <span class="stat-label">Harmonisch</span>
            <span class="stat-value">{{ synastryResult.compatibilityScore.positiveAspects }}</span>
          </div>
          <div class="stat-item challenging">
            <span class="stat-label">Herausfordernd</span>
            <span class="stat-value">{{ synastryResult.compatibilityScore.challengingAspects }}</span>
          </div>
        </div>
      </div>

      <!-- Category Scores -->
      <div class="categories-section">
        <h3 class="subsection-title">Kompatibilität nach Bereichen</h3>
        <div class="categories-grid">
          <div
            v-for="(data, category) in synastryResult.compatibilityScore.categories"
            :key="category"
            class="category-card"
          >
            <div class="category-name">{{ getCategoryName(category) }}</div>
            <div class="category-bar-container">
              <div
                class="category-bar"
                :style="{ width: data.percentage + '%', backgroundColor: getCategoryColor(data.percentage) }"
              ></div>
            </div>
            <div class="category-details">
              <span class="category-percentage">{{ Math.round(data.percentage) }}%</span>
              <span class="category-count">{{ data.count }} Aspekte</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Interpretation Button -->
      <div class="interpretation-actions">
        <UButton
          @click="interpretSynastry"
          :disabled="interpretationLoading"
          color="black"
          variant="outline"
        >
          {{ interpretationLoading ? 'Interpretiere...' : 'Detaillierte Interpretation' }}
        </UButton>
      </div>

      <!-- AI Interpretation -->
      <div v-if="interpretation" class="interpretation-card">
        <h3 class="subsection-title">Synastrie-Interpretation</h3>
        <div class="interpretation-content" v-html="renderMarkdown(interpretation)"></div>
      </div>

      <!-- Aspects List -->
      <div class="aspects-section">
        <h3 class="subsection-title">Alle Aspekte ({{ synastryResult.synastryAspects.length }})</h3>

        <div class="aspects-list">
          <div
            v-for="(aspect, index) in synastryResult.synastryAspects"
            :key="index"
            class="aspect-card"
            :class="aspect.score > 0 ? 'positive' : 'challenging'"
          >
            <div class="aspect-header">
              <span class="planet-combo">
                {{ translatePlanetName(aspect.person1Planet) }}
                {{ getAspectSymbol(aspect.aspect) }}
                {{ translatePlanetName(aspect.person2Planet) }}
              </span>
              <span class="aspect-score" :class="aspect.score > 0 ? 'positive' : 'negative'">
                {{ aspect.score > 0 ? '+' : '' }}{{ aspect.score }}
              </span>
            </div>
            <div class="aspect-details">
              <div class="aspect-signs">
                {{ translateZodiacName(aspect.person1PlanetSign) }}
                {{ getAspectName(aspect.aspect) }}
                {{ translateZodiacName(aspect.person2PlanetSign) }}
              </div>
              <div class="aspect-meta">
                <span class="aspect-category">{{ getCategoryName(aspect.category) }}</span>
                <span class="aspect-orb">Orbis: {{ aspect.orb.toFixed(2) }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Edit Modal -->
    <FriendEditModal
      v-model="showEditModal"
      :friend="editingFriend"
      @save="handleEditFriend"
    />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import { useProfilesStore } from '~/stores/profilesStore';
import { useSynastry } from '~/composables/useSynastry';
import { useTranslateZodiac } from '~/composables/translateZodiac';
import { useBirthChart } from '~/composables/useBirthChart';

const profilesStore = useProfilesStore();
const { calculateSynastry, getCompatibilityLevel, getCategoryName } = useSynastry();
const { translatePlanetName, translateZodiacName } = useTranslateZodiac();
const { calculateBirthChart } = useBirthChart();

const myProfile = ref(null);
const myChart = ref(null);
const friends = ref([]);
const selectedFriend = ref(null);
const showAddForm = ref(false);
const showEditModal = ref(false);
const editingFriend = ref(null);
const synastryResult = ref(null);
const loading = ref(false);
const error = ref('');
const interpretation = ref('');
const interpretationLoading = ref(false);

const compatibilityLevel = computed(() => {
  if (!synastryResult.value) return { level: '', color: '#757575', emoji: '' };
  return getCompatibilityLevel(synastryResult.value.compatibilityScore.total);
});

// Calculate zodiac signs
const sunSign = computed(() => {
  if (!myChart.value?.planetaryPositions) return '-';
  const sun = myChart.value.planetaryPositions.find(p => p.name === 'Sun');
  return sun ? translateZodiacName(sun.zodiacSign) : '-';
});

const moonSign = computed(() => {
  if (!myChart.value?.planetaryPositions) return '-';
  const moon = myChart.value.planetaryPositions.find(p => p.name === 'Moon');
  return moon ? translateZodiacName(moon.zodiacSign) : '-';
});

const ascendant = computed(() => {
  if (!myChart.value?.houses?.Ascendant) return '-';
  const ascDegree = myChart.value.houses.Ascendant;
  const signs = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
    'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];
  const signIndex = Math.floor(ascDegree / 30);
  return signs[signIndex] || '-';
});

// Load profiles and birth chart
onMounted(async () => {
  await profilesStore.fetchProfiles();
  myProfile.value = profilesStore.profile;
  friends.value = profilesStore.friends || [];

  // Load birth chart for zodiac signs
  if (myProfile.value) {
    try {
      myChart.value = await calculateBirthChart(myProfile.value);
    } catch (err) {
      console.error('Fehler beim Laden des Geburtshoroskops:', err);
    }
  }
});

const handleAddFriend = async (friendData) => {
  await profilesStore.addFriend(friendData);
  friends.value = [...profilesStore.friends];
  showAddForm.value = false;
};

const openEditModal = (friend) => {
  editingFriend.value = friend;
  showEditModal.value = true;
};

const handleEditFriend = async (updatedData) => {
  await profilesStore.updateFriend(editingFriend.value.id, updatedData);
  friends.value = [...profilesStore.friends];

  // Update selected friend if it's the one being edited
  if (selectedFriend.value?.id === editingFriend.value.id) {
    selectedFriend.value = friends.value.find(f => f.id === editingFriend.value.id);
    synastryResult.value = null; // Reset results as data changed
  }
  editingFriend.value = null;
};

const deleteFriend = async (friend) => {
  if (confirm(`Möchtest du ${friend.name} wirklich löschen?`)) {
    await profilesStore.deleteFriend(friend.id);
    friends.value = [...profilesStore.friends];

    if (selectedFriend.value?.id === friend.id) {
      selectedFriend.value = null;
      synastryResult.value = null;
    }
  }
};

const selectFriend = (friend) => {
  selectedFriend.value = friend;
  synastryResult.value = null;
  interpretation.value = '';
};

const calculateCompatibility = async () => {
  if (!myProfile.value || !selectedFriend.value) {
    error.value = 'Bitte wähle ein Partner Profil aus.';
    return;
  }

  loading.value = true;
  error.value = '';
  interpretation.value = '';

  try {
    const result = await calculateSynastry(myProfile.value, selectedFriend.value);
    synastryResult.value = result;
  } catch (err) {
    console.error('Fehler beim Berechnen der Synastrie:', err);
    error.value = 'Fehler beim Berechnen der Kompatibilität. Bitte versuche es erneut.';
  } finally {
    loading.value = false;
  }
};

const interpretSynastry = async () => {
  if (!synastryResult.value) return;

  interpretationLoading.value = true;

  try {
    const response = await $fetch('/api/interpret-synastry', {
      method: 'POST',
      body: {
        aspects: synastryResult.value.synastryAspects,
        compatibilityScore: synastryResult.value.compatibilityScore
      }
    });

    interpretation.value = response.interpretation;
  } catch (err) {
    console.error('Fehler beim Interpretieren der Synastrie:', err);
    error.value = 'Fehler beim Erstellen der Interpretation. Bitte versuche es erneut.';
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

const getAspectName = (aspect) => {
  const names = {
    conjunction: 'Konjunktion',
    sextile: 'Sextil',
    square: 'Quadrat',
    trine: 'Trigon',
    opposition: 'Opposition'
  };
  return names[aspect] || aspect;
};

const getCategoryColor = (percentage) => {
  if (percentage >= 70) return '#4caf50';
  if (percentage >= 60) return '#8bc34a';
  if (percentage >= 50) return '#ffc107';
  if (percentage >= 40) return '#ff9800';
  return '#f44336';
};
</script>

<style scoped>
.synastry-page {
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

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
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

.page-header {
  position: relative;
  background: #D7C9B2;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: transparent;
  border: none;
  color: #1F1D20;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background: rgba(31, 29, 32, 0.1);
}

.back-icon {
  font-size: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1F1D20;
  margin: 0;
}


.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F1D20;
  margin-bottom: 1rem;
}

.friends-section {
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-form-card {
  background: #D7C9B2;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-item {
  cursor: pointer;
  transition: transform 0.2s;
  border: 3px solid transparent;
  border-radius: 8px;
}

.friend-item:hover {
  transform: translateY(-2px);
}

.friend-item.selected {
  border-color: #1F1D20;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #7B7369;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.calculate-section {
  padding: 1.5rem;
}

.results-section {
  padding: 1.5rem;
}

.score-card {
  background: linear-gradient(135deg, #1F1D20 0%, #4D4845 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.score-main {
  text-align: center;
  padding: 2rem;
  background: #F5ECDC;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.score-number {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 0.9rem;
  color: #7B7369;
  margin: 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-level {
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(245, 236, 220, 0.95);
  border-radius: 8px;
  border-left: 4px solid #D7C9B2;
}

.stat-item.positive {
  border-left-color: #4caf50;
}

.stat-item.challenging {
  border-left-color: #ff9800;
}

.stat-label {
  font-weight: 600;
  color: #7B7369;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1F1D20;
}

.categories-section {
  margin-bottom: 2rem;
}

.subsection-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F1D20;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.category-card {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #D7C9B2;
}

.category-name {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1F1D20;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.category-bar-container {
  height: 20px;
  background: #F5ECDC;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.category-bar {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 10px;
}

.category-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.category-percentage {
  font-weight: 700;
  color: #1F1D20;
}

.category-count {
  color: #7B7369;
}

.interpretation-actions {
  text-align: center;
  margin: 2rem 0;
}

.interpretation-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  border: 2px solid #D7C9B2;
  margin-bottom: 2rem;
}

.interpretation-content {
  line-height: 1.8;
  color: #1F1D20;
}

.aspects-section {
  margin-top: 2rem;
}

.aspects-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.aspect-card {
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #D7C9B2;
  border-left-width: 4px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.aspect-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.aspect-card.positive {
  background: #f1f8f4;
  border-left-color: #4caf50;
}

.aspect-card.challenging {
  background: #fff8f0;
  border-left-color: #ff9800;
}

.aspect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.planet-combo {
  font-weight: 600;
  font-size: 1rem;
  color: #1F1D20;
}

.aspect-score {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
}

.aspect-score.positive {
  background: #c8e6c9;
  color: #2e7d32;
}

.aspect-score.negative {
  background: #ffccbc;
  color: #d84315;
}

.aspect-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.aspect-signs {
  color: #7B7369;
  font-size: 0.875rem;
}

.aspect-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #7B7369;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.aspect-category {
  font-weight: 600;
}

.error-message {
  background: #fee;
  border: 2px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 12px;
  margin: 1.5rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .synastry-page {
    padding-bottom: 70px;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .score-card {
    padding: 1.5rem;
  }

  .score-number {
    font-size: 3rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
