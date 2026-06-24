<template>
  <div class="elements-section">
    <div class="elements-header">
      <h3>Tagesempfehlungen</h3>
      <p class="header-subtitle">{{ interpretation.summary }}</p>
    </div>

    <!-- Two-column Layout: To-Do & Don't Do -->
    <div class="recommendations-grid">
      <!-- Left: To-Do -->
      <div class="recommendation-column todo-column">
        <div class="column-header">
          <UIcon name="i-heroicons-check-circle" class="column-icon todo-icon" />
          <h4>To-Do</h4>
        </div>
        <ul class="recommendation-list">
          <li v-for="(item, index) in todoRecommendations" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- Right: Don't Do -->
      <div class="recommendation-column dont-column">
        <div class="column-header">
          <UIcon name="i-heroicons-x-circle" class="column-icon dont-icon" />
          <h4>Don't Do</h4>
        </div>
        <ul class="recommendation-list">
          <li v-for="(item, index) in dontRecommendations" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useElements } from '~/composables/useElements';

const props = defineProps({
  transitChart: {
    type: Object,
    required: true
  },
  birthChart: {
    type: Object,
    required: true
  }
});

const {
  calculateCombinedElementDistribution,
  calculatePercentages,
  generateInterpretation
} = useElements();

// Berechne die kombinierte Element-Verteilung (Geburt + Transit)
const elementDistribution = computed(() => {
  if (
    !props.birthChart || !props.birthChart.planetaryPositions ||
    !props.transitChart || !props.transitChart.planetaryPositions
  ) {
    return {
      fire: { points: 0, planets: [] },
      earth: { points: 0, planets: [] },
      air: { points: 0, planets: [] },
      water: { points: 0, planets: [] }
    };
  }
  return calculateCombinedElementDistribution(
    props.birthChart.planetaryPositions,
    props.transitChart.planetaryPositions
  );
});

const percentages = computed(() => {
  return calculatePercentages(elementDistribution.value);
});

// Generiere Interpretation
const interpretation = computed(() => {
  return generateInterpretation(percentages.value);
});

// Extrahiere To-Do Empfehlungen (Stärken nutzen)
const todoRecommendations = computed(() => {
  const interp = interpretation.value;
  const todos = [];

  // Nehme die ersten 3 Empfehlungen als To-Dos
  if (interp.recommendations.length > 0) {
    const positiveRecs = interp.recommendations.filter(rec =>
      !rec.toLowerCase().includes('achte darauf') &&
      !rec.toLowerCase().includes('vermeide')
    );
    todos.push(...positiveRecs.slice(0, 3));
  }

  // Füge Stärken als To-Dos hinzu
  if (todos.length < 3 && interp.strengths.length > 0) {
    todos.push(...interp.strengths.slice(0, 3 - todos.length));
  }

  return todos.length > 0 ? todos : ['Folge deiner Intuition', 'Bleibe im Moment präsent', 'Sei offen für Neues'];
});

// Extrahiere Don't Do Empfehlungen (Warnungen)
const dontRecommendations = computed(() => {
  const interp = interpretation.value;
  const donts = [];

  // Dominantes Element - was man vermeiden sollte
  const dominant = interp.dominant.toLowerCase();

  if (dominant === 'feuer') {
    donts.push('Überstürze keine wichtigen Entscheidungen');
    donts.push('Vermeide unnötige Konflikte oder Streit');
    donts.push('Überfordere dich nicht mit zu vielen Projekten');
  } else if (dominant === 'erde') {
    donts.push('Sei nicht zu starr oder unflexibel');
    donts.push('Vermeide es, nur auf Sicherheit zu fokussieren');
    donts.push('Ignoriere nicht deine emotionalen Bedürfnisse');
  } else if (dominant === 'luft') {
    donts.push('Verzettle dich nicht in zu vielen Gedanken');
    donts.push('Vermeide oberflächliche Gespräche ohne Tiefe');
    donts.push('Bleibe nicht nur im Kopf, handle auch');
  } else if (dominant === 'wasser') {
    donts.push('Lass dich nicht von Emotionen überwältigen');
    donts.push('Vermeide es, dich zu isolieren');
    donts.push('Setze klare emotionale Grenzen');
  }

  // Falls ausgeglichen
  if (donts.length === 0) {
    donts.push('Vermeide Überforderung durch zu viele Aktivitäten');
    donts.push('Vernachlässige nicht deine persönlichen Grenzen');
    donts.push('Lass dich nicht von anderen zu sehr beeinflussen');
  }

  return donts.slice(0, 3);
});
</script>

<style scoped>
.elements-section {
  background: white;
  border: 2px solid #D7C9B2;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.elements-header {
  margin-bottom: 1.5rem;
}

.elements-header h3 {
  margin: 0;
  color: #4D4845;
  font-size: 1.5rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #7B7369;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Two-Column Recommendations */
.recommendations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.recommendation-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-header h4 {
  margin: 0;
  font-family: sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #1F1D20;
}

.column-icon {
  font-size: 1.5rem;
}

.todo-icon {
  color: #8FA882;
}

.dont-icon {
  color: #C97064;
}

.recommendation-list {
  list-style: disc;
  padding-left: 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-list li {
  font-family: sans-serif;
  font-size: 0.875rem;
  color: #4D4845;
  line-height: 1.5;
  padding-left: 0.25rem;
}

.recommendation-list li::marker {
  color: #7B7369;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .elements-section {
    padding: 1.25rem;
  }

  .elements-header h3 {
    font-size: 1.25rem;
  }

  .header-subtitle {
    font-size: 0.85rem;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .column-header h4 {
    font-size: 0.9rem;
  }

  .column-icon {
    font-size: 1.25rem;
  }

  .recommendation-list {
    gap: 0.625rem;
  }

  .recommendation-list li {
    font-size: 0.8rem;
  }
}
</style>
