<template>
  <div class="aspect-groups">
    <div
      v-for="aspectType in orderedAspectGroups"
      :key="aspectType"
      class="aspect-group"
    >
      <button
        class="aspect-group-header"
        @click="toggleAspectGroup(aspectType)"
      >
        <div class="aspect-group-title">
          <span class="aspect-symbol-large">{{ getAspectSymbol(aspectType) }}</span>
          <span class="aspect-name">{{ getAspectName(aspectType) }}</span>
          <span class="aspect-count">({{ groupedTransits[aspectType].length }})</span>
        </div>
        <UIcon
          :name="expandedGroups[aspectType] ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="toggle-icon"
        />
      </button>

      <div v-show="expandedGroups[aspectType]" class="table-wrapper">
        <table class="transit-table">
          <thead>
            <tr>
              <th>Natal</th>
              <th>Transit</th>
              <th>Orbis</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(transit, index) in groupedTransits[aspectType]" :key="index">
              <td class="planet-cell font-sans">{{ translatePlanetName(transit.natalPlanet) }}</td>
              <td class="planet-cell font-sans">{{ translatePlanetName(transit.transitPlanet) }}</td>
              <td class="orb-cell">{{ transit.orb.toFixed(2) }}°</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTranslateZodiac } from '~/composables/translateZodiac';

const props = defineProps({
  transits: {
    type: Array,
    required: true
  }
});

const { translatePlanetName } = useTranslateZodiac();

const expandedGroups = ref({});

// Group transits by aspect type
const groupedTransits = computed(() => {
  if (!props.transits || props.transits.length === 0) {
    return {};
  }

  const groups = {};
  props.transits.forEach(transit => {
    if (!groups[transit.aspect]) {
      groups[transit.aspect] = [];
    }
    groups[transit.aspect].push(transit);
  });

  return groups;
});

// Define aspect order for display
const aspectOrder = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

const orderedAspectGroups = computed(() => {
  return aspectOrder.filter(aspect => groupedTransits.value[aspect]);
});

const toggleAspectGroup = (aspectType) => {
  expandedGroups.value[aspectType] = !expandedGroups.value[aspectType];
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
</script>

<style scoped>
/* Aspect Groups */
.aspect-groups {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.aspect-group {
  background: white;
  border: 2px solid #D7C9B2;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.aspect-group-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: sans-serif;
}

.aspect-group-header:hover {
  background: #F5ECDC;
}

.aspect-group-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.aspect-symbol-large {
  font-size: 2rem;
  color: #1F1D20;
  font-weight: 700;
}

.aspect-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F1D20;
}

.aspect-count {
  font-size: 1rem;
  color: #7B7369;
  font-weight: 500;
}

.toggle-icon {
  font-size: 1.5rem;
  color: #4D4845;
  transition: transform 0.2s;
}

.table-wrapper {
  padding: 0 1.5rem 1.5rem;
}

.transit-table {
  width: 100%;
  border-collapse: collapse;
  font-family: sans-serif;
}

.transit-table thead {
  background: #F5ECDC;
}

.transit-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 700;
  color: #1F1D20;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #D7C9B2;
}

.transit-table tbody tr {
  border-bottom: 1px solid #E8DCC8;
  transition: background-color 0.2s;
}

.transit-table tbody tr:hover {
  background: #F5ECDC;
}

.transit-table tbody tr:last-child {
  border-bottom: none;
}

.transit-table td {
  padding: 0.875rem 0.75rem;
  color: #4D4845;
}

.planet-cell {
  font-weight: 600;
  font-size: 1rem;
  color: #1F1D20;
}

.orb-cell {
  font-weight: 500;
  font-size: 0.875rem;
  color: #7B7369;
  text-align: right;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .aspect-group-header {
    padding: 1rem;
  }

  .aspect-name {
    font-size: 1.1rem;
  }

  .aspect-symbol-large {
    font-size: 1.5rem;
  }

  .aspect-count {
    font-size: 0.9rem;
  }

  .table-wrapper {
    padding: 0.75rem 1rem 1rem;
  }

  .transit-table th,
  .transit-table td {
    padding: 0.625rem 0.5rem;
  }

  .transit-table th {
    font-size: 0.75rem;
  }

  .planet-cell {
    font-size: 0.9rem;
  }

  .orb-cell {
    font-size: 0.8rem;
  }
}
</style>
