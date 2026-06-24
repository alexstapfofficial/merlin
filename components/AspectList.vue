<template>
  <div class="aspectlist">
    <!-- filters -->
    <div class="as__filters">
      <span
        v-for="f in filters" :key="f.key" class="as__filter"
        :class="{ on: activeFilter === f.key }" @click="activeFilter = f.key"
      >{{ f.label }}</span>
    </div>

    <div class="as__list">
      <div
        v-for="x in filtered" :key="keyOf(x)"
        class="as__card" :style="{ borderLeft: `3px solid ${x.color}` }"
      >
        <div class="as__head">
          <span class="m-glyph" style="font-size:22px">{{ x.a }}</span>
          <span :style="{ fontSize: '18px', color: x.color }">{{ x.sym }}</span>
          <span class="m-glyph" style="font-size:22px">{{ x.b }}</span>
          <span class="m-display as__title">{{ x.aDe }} {{ x.name.toLowerCase() }} {{ x.bDe }}</span>
          <span class="m-mono as__orbis">{{ x.orb }}</span>
        </div>
      </div>
      <div v-if="!filtered.length" class="as__empty m-mono">Keine Aspekte in dieser Auswahl.</div>
    </div>
  </div>
</template>

<script setup>
import { useActiveChart } from '~/composables/useActiveChart';

const { aspects } = useActiveChart();

const filters = [
  { key: 'all', label: 'Alle' },
  { key: 'fluss', label: 'Harmonisch' },
  { key: 'spannung', label: 'Spannung' },
  { key: 'exact', label: 'Exakt' },
];
const activeFilter = ref('all');

const filtered = computed(() => {
  if (activeFilter.value === 'all') return aspects.value;
  if (activeFilter.value === 'exact') return aspects.value.filter((a) => a.orbVal <= 1);
  return aspects.value.filter((a) => a.kind === activeFilter.value);
});

const keyOf = (x) => `aspect:${x.aEn}:${x.bEn}:${x.type}`;
</script>

<style scoped>
.as__filters { padding: 0 22px; display: flex; gap: 6px; flex-wrap: wrap; }
.as__filter {
  padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600;
  color: var(--ink-2); border: 0.5px solid var(--hair); cursor: pointer;
}
.as__filter.on { background: var(--ink); color: #F1ECDF; border: none; }

.as__list { padding: 14px 22px 0; display: flex; flex-direction: column; gap: 8px; }
.as__card {
  display: block; width: 100%; text-align: left;
  position: relative; padding: 12px 14px 14px; border-radius: 14px;
  background: var(--card); border: 0.5px solid var(--line);
}
.as__head { display: flex; align-items: center; gap: 8px; }
.as__title { font-size: 15.5px; margin-left: 6px; }
.as__orbis { margin-left: auto; font-size: 10.5px; color: var(--muted); letter-spacing: 0.4px; }
.as__empty { text-align: center; color: var(--muted); font-size: 12px; padding: 20px; }
</style>
