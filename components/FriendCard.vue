<template>
  <div class="friend-card" :class="{ selected: isSelected }">
    <div class="card-content">
      <!-- Name -->
      <h3 class="friend-name font-justcosmic">{{ friend.name }}</h3>

      <!-- Zodiac Signs -->
      <div v-if="chart" class="zodiac-signs">
        <div class="zodiac-item">
          <span class="zodiac-icon font-astronomicon">Q</span>
          <span class="zodiac-name">{{ sunSign }}</span>
        </div>
        <div class="zodiac-item">
          <span class="zodiac-icon font-astronomicon">R</span>
          <span class="zodiac-name">{{ moonSign }}</span>
        </div>
        <div class="zodiac-item">
          <span class="zodiac-icon font-astronomicon">`</span>
          <span class="zodiac-name">{{ ascendant }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="zodiac-signs loading">
        <span class="loading-text">Lade Zeichen...</span>
      </div>

      <!-- Edit Button -->
      <div class="card-actions">
        <UButton
          @click.stop="$emit('edit', friend)"
          icon="i-heroicons-pencil-square"
          color="black"
          variant="outline"
          size="sm"
        >
          Bearbeiten
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBirthChart } from '~/composables/useBirthChart';
import { useTranslateZodiac } from '~/composables/translateZodiac';

const props = defineProps({
  friend: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit', 'delete', 'select']);

const { calculateBirthChart } = useBirthChart();
const { translateZodiacName } = useTranslateZodiac();

const chart = ref(null);

// Calculate zodiac signs
const sunSign = computed(() => {
  if (!chart.value?.planetaryPositions) return '-';
  const sun = chart.value.planetaryPositions.find(p => p.name === 'Sun');
  return sun ? translateZodiacName(sun.zodiacSign) : '-';
});

const moonSign = computed(() => {
  if (!chart.value?.planetaryPositions) return '-';
  const moon = chart.value.planetaryPositions.find(p => p.name === 'Moon');
  return moon ? translateZodiacName(moon.zodiacSign) : '-';
});

const ascendant = computed(() => {
  if (!chart.value?.houses?.Ascendant) return '-';
  const ascDegree = chart.value.houses.Ascendant;
  const signs = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
    'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];
  const signIndex = Math.floor(ascDegree / 30);
  return signs[signIndex] || '-';
});

// Load birth chart
onMounted(async () => {
  if (props.friend) {
    try {
      chart.value = await calculateBirthChart(props.friend);
    } catch (err) {
      console.error('Fehler beim Laden des Geburtshoroskops:', err);
    }
  }
});
</script>

<style scoped>
.friend-card {
  background: #F5ECDC;
  border: 3px solid transparent;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.friend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.friend-card.selected {
  border-color: #1F1D20;
  background: linear-gradient(135deg, #F5ECDC 0%, #EBD9BE 100%);
  box-shadow: 0 4px 16px rgba(31, 29, 32, 0.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F1D20;
  margin: 0;
  letter-spacing: 0.5px;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #D7C9B2;
}

.zodiac-signs {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.zodiac-signs.loading {
  justify-content: center;
  padding: 1.5rem 0;
}

.loading-text {
  color: #7B7369;
  font-size: 0.875rem;
  font-style: italic;
}

.zodiac-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.zodiac-icon {
  font-size: 2.5rem;
  color: #1F1D20;
  line-height: 1;
}

.zodiac-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4D4845;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  justify-content: center;
  padding-top: 0.75rem;
  border-top: 2px solid #D7C9B2;
}

@media (max-width: 768px) {
  .friend-card {
    padding: 1.25rem;
  }

  .friend-name {
    font-size: 1.5rem;
  }

  .zodiac-signs {
    gap: 1rem;
  }

  .zodiac-icon {
    font-size: 2rem;
  }

  .zodiac-name {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .friend-card {
    padding: 1rem;
  }

  .friend-name {
    font-size: 1.25rem;
  }

  .zodiac-signs {
    gap: 0.75rem;
  }

  .zodiac-icon {
    font-size: 1.75rem;
  }
}
</style>
