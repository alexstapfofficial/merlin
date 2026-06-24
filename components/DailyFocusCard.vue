<template>
  <div v-if="dailyFocus" class="daily-focus-section">
    <div class="focus-header">
      <h3>Fokus des Tages</h3>
    </div>
    <div class="focus-content">
      <div class="focus-icon-wrapper">
        <UIcon :name="dailyFocus.icon" class="focus-icon" />
      </div>
      <div class="focus-label font-justcosmic">{{ dailyFocus.label }}</div>
    </div>
  </div>
</template>

<script setup>
import { useDailyFocus } from '~/composables/useDailyFocus';

const props = defineProps({
  transits: {
    type: Array,
    required: true
  },
  birthChart: {
    type: Object,
    required: true
  }
});

const { calculateDailyFocus } = useDailyFocus();

// Hilfsfunktion: Finde das Haus eines Planeten
const findHouseForPlanet = (planetName, houses) => {
  if (!houses || !houses.Houses) return 1;

  for (const house of houses.Houses) {
    if (house.planets && house.planets.some(p => p.name === planetName)) {
      return house.houseNumber;
    }
  }

  return 1; // Fallback
};

// Berechne Daily Focus
const dailyFocus = computed(() => {
  if (!props.transits || !props.birthChart) {
    return null;
  }

  // Konvertiere Transit-Daten in das Format für useDailyFocus
  const focusTransits = props.transits.map(t => ({
    planet: t.transitPlanet,
    natalPlanet: t.natalPlanet,
    house: findHouseForPlanet(t.natalPlanet, props.birthChart.houses),
    aspect: t.aspect,
    orb: t.orb
  }));

  // Konvertiere Hausspitzen
  const houseSpitzen = props.birthChart.houses.Houses.map(h => ({
    number: h.houseNumber,
    sign: h.zodiacSign,
    degree: h.degree
  }));

  return calculateDailyFocus(focusTransits, houseSpitzen);
});
</script>

<style scoped>
/* Daily Focus Section */
.daily-focus-section {
  background: white;
  border: 2px solid #D7C9B2;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.focus-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4D4845;
}

.focus-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.focus-intensity {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: sans-serif;
}

.focus-content {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.focus-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.focus-icon {
  font-size: 7rem;
  color: #4D4845;
}

.focus-label {
  font-size: 1.75rem;
  font-weight: 700;
  color: #4D4845;
  text-align: center;
}

.focus-action {
  font-size: 1.125rem;
  color: #1F1D20;
  font-family: sans-serif;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.focus-reasoning {
  font-size: 0.875rem;
  color: #7B7369;
  font-family: sans-serif;
  text-align: center;
  margin: 0;
  font-style: italic;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .daily-focus-section {
    padding: 1.25rem;
  }

  .focus-header h3 {
    font-size: 1.25rem;
  }

  .focus-intensity {
    font-size: 1.25rem;
  }

  .focus-icon {
    font-size: 5rem;
  }

  .focus-label {
    font-size: 1.5rem;
  }

  .focus-action {
    font-size: 1rem;
  }

  .focus-reasoning {
    font-size: 0.8rem;
  }
}
</style>
