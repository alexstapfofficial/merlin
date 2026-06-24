<template>
  <div class="daily-vibe-section">
    <button
      class="vibe-header-clickable"
      @click="lifeAreasExpanded = !lifeAreasExpanded"
    >
      <div class="vibe-header">
        <h3>Lebensbereiche</h3>
      </div>

      <!-- Two-column Layout: Challenging & Harmonious Areas -->
      <div class="areas-grid">
        <!-- Left: Most Challenging Area -->
        <div class="area-column">
          <div class="area-type-label">Herausfordernd</div>
          <UIcon :name="mostChallengingArea.icon" class="area-icon" />
          <div class="area-label">{{ mostChallengingArea.name }}</div>
        </div>

        <!-- Right: Most Harmonious Area -->
        <div class="area-column">
          <div class="area-type-label">Harmonisch</div>
          <UIcon :name="mostHarmoniousArea.icon" class="area-icon" />
          <div class="area-label">{{ mostHarmoniousArea.name }}</div>
        </div>
      </div>


      <!-- Alerts Section -->
      <div v-if="hasAlerts" class="alerts-section">
        <div class="alerts-grid">
          <!-- Left Column: Void/Mangel -->
          <div class="alerts-column void-column">
            <div class="column-header">
              <span class="column-icon">↓</span>
              <span class="column-title">Mangel</span>
            </div>
            <div class="alerts-items">
              <div
                v-for="(alert, index) in [...(elementVoidAlerts || []), ...(modalityVoidAlerts || [])]"
                :key="'void-' + index"
                class="alert-item"
              >
                {{ alert }}
              </div>
            </div>
          </div>

          <!-- Right Column: Excess/Überschuss -->
          <div class="alerts-column excess-column">
            <div class="column-header">
              <span class="column-icon">↑</span>
              <span class="column-title">Überschuss</span>
            </div>
            <div class="alerts-items">
              <div
                v-for="(alert, index) in [...(elementExcessAlerts || []), ...(modalityExcessAlerts || [])]"
                :key="'excess-' + index"
                class="alert-item"
              >
                {{ alert }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chevron-indicator">
        <UIcon
          :name="lifeAreasExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="chevron-icon"
        />
      </div>
    </button>

    <div v-show="lifeAreasExpanded" class="life-areas-content">
      <div
        v-for="area in lifeAreas"
        :key="area.key"
        class="life-area-item"
      >
        <div class="life-area-header">
          <div class="life-area-label">
            <UIcon :name="area.icon" class="life-area-icon" />
            <span>{{ area.name }}</span>
          </div>
          <span class="life-area-percent">{{ area.score }}%</span>
        </div>
        <div class="life-area-bar-container">
          <div
            class="life-area-bar"
            :style="{ width: area.score + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDailyVibe } from '~/composables/useDailyVibe';
import { useLifeAreas } from '~/composables/useLifeAreas';

const props = defineProps({
  transits: {
    type: Array,
    required: true
  },
  birthChart: {
    type: Object,
    required: true
  },
  transitChart: {
    type: Object,
    required: true
  }
});

const lifeAreasExpanded = ref(false);

// Composables
const { calculateDailyVibe, getVibeStatus } = useDailyVibe();
const { calculateLifeAreas, calculateDailyVibeFromLifeAreas } = useLifeAreas();

// Berechne Daily Vibe Daten
const dailyVibeData = computed(() => {
  if (!props.transits || !props.birthChart || !props.transitChart) {
    return null;
  }

  // 1. Berechne Lebensbereiche
  const areas = calculateLifeAreas(
    props.transits,
    props.birthChart.houses
  );

  // 2. Berechne Daily Vibe Score aus dem Durchschnitt der Lebensbereiche
  const score = calculateDailyVibeFromLifeAreas(areas);
  const status = getVibeStatus(score);

  // 3. Berechne Element- und Modalitäts-Daten für die Alerts
  const vibeData = calculateDailyVibe({
    transits: props.transits,
    transitPlanetaryPositions: props.transitChart.planetaryPositions,
    natalPlanetaryPositions: props.birthChart.planetaryPositions,
    houses: props.birthChart.houses
  });

  return {
    vibeScore: score,
    vibeStatus: status,
    elementVoidAlerts: vibeData.elementVoidAlerts,
    elementExcessAlerts: vibeData.elementExcessAlerts,
    modalityVoidAlerts: vibeData.modalityVoidAlerts,
    modalityExcessAlerts: vibeData.modalityExcessAlerts,
    lifeAreas: areas
  };
});

// Expose computed properties for template
const vibeStatus = computed(() => dailyVibeData.value?.vibeStatus || null);
const elementVoidAlerts = computed(() => dailyVibeData.value?.elementVoidAlerts || []);
const elementExcessAlerts = computed(() => dailyVibeData.value?.elementExcessAlerts || []);
const modalityVoidAlerts = computed(() => dailyVibeData.value?.modalityVoidAlerts || []);
const modalityExcessAlerts = computed(() => dailyVibeData.value?.modalityExcessAlerts || []);

// Sortiere Lebensbereiche nach Score absteigend
const lifeAreas = computed(() => {
  const areas = dailyVibeData.value?.lifeAreas || [];
  return [...areas].sort((a, b) => b.score - a.score);
});

// Most challenging area (lowest score)
const mostChallengingArea = computed(() => {
  const areas = dailyVibeData.value?.lifeAreas || [];
  if (areas.length === 0) {
    return { name: 'Keine Daten', icon: 'i-heroicons-question-mark-circle', score: 0 };
  }
  return [...areas].sort((a, b) => a.score - b.score)[0];
});

// Most harmonious area (highest score)
const mostHarmoniousArea = computed(() => {
  const areas = dailyVibeData.value?.lifeAreas || [];
  if (areas.length === 0) {
    return { name: 'Keine Daten', icon: 'i-heroicons-question-mark-circle', score: 0 };
  }
  return [...areas].sort((a, b) => b.score - a.score)[0];
});

// Check if there are any alerts to display
const hasAlerts = computed(() => {
  return (
    (elementVoidAlerts.value && elementVoidAlerts.value.length > 0) ||
    (elementExcessAlerts.value && elementExcessAlerts.value.length > 0) ||
    (modalityVoidAlerts.value && modalityVoidAlerts.value.length > 0) ||
    (modalityExcessAlerts.value && modalityExcessAlerts.value.length > 0)
  );
});
</script>

<style scoped>
/* Daily Vibe Section */
.daily-vibe-section {
  background: white;
  border: 2px solid #D7C9B2;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
}

.vibe-header-clickable {
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
  position: relative;
}

.vibe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.vibe-header h3 {
  margin: 0;
  color: #4D4845;
  font-size: 1.5rem;
  font-weight: 700;
}

.vibe-status-badge {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0;
}

.status-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #1F1D20;
  color: #F5ECDC;
  border-radius: 20px;
  font-family: sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.vibe-description {
  margin: 0.875rem 0 0 0;
  color: #4D4845;
  font-size: 1rem;
  line-height: 1.5;
  font-family: sans-serif;
  font-weight: 500;
  text-align: center;
}

/* Two-Column Areas Grid */
.areas-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0 1.5rem 0;
  padding: 0;
}

.area-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
}

.area-type-label {
  font-family: sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #7B7369;
  margin-bottom: 0.75rem;
}

.area-icon {
  font-size: 3.5rem;
  color: #4D4845;
  margin-bottom: 0.75rem;
}

.area-label {
  font-family: sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: #4D4845;
  text-align: center;
  line-height: 1.3;
  max-width: 140px;
}

/* Alerts Section */
.alerts-section {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #E8DCC8;
}

.alerts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.alerts-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.column-icon {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4D4845;
}

.column-title {
  font-family: sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1F1D20;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alerts-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.alert-item {
  font-family: sans-serif;
  font-size: 0.8rem;
  color: #7B7369;
  line-height: 1.4;
  padding-left: 0.5rem;
  border-left: 2px solid #E8DCC8;
}

.chevron-indicator {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.chevron-icon {
  font-size: 1.5rem;
  color: #4D4845;
  transition: transform 0.2s;
}

/* Lebensbereiche Content */
.life-areas-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #F5ECDC;
}

.life-area-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

/* Mobile Responsive */
@media (max-width: 768px) {

  .vibe-header h3 {
    font-size: 1.25rem;
  }

  .vibe-description {
    font-size: 0.9rem;
    margin-top: 0.875rem;
  }

  .areas-grid {
    gap: 1.5rem;
    margin: 1.5rem 0 1rem 0;
  }

  .area-column {
    gap: 0.375rem;
  }

  .area-type-label {
    font-size: 0.65rem;
    letter-spacing: 0.8px;
    margin-bottom: 0.5rem;
  }

  .area-icon {
    font-size: 2.75rem;
    margin-bottom: 0.5rem;
  }

  .area-label {
    font-size: 1rem;
    font-weight: 700;
    max-width: 120px;
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
