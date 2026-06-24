<template>
  <div class="planetlist">
    <!-- featured Moon -->
    <div v-if="moon" class="pl__feature">
      <span class="m-glyph pl__feature-glyph">R</span>
      <div class="m-eyebrow" style="color:rgba(232,201,136,0.85)">Heute betont</div>
      <div style="display:flex;align-items:baseline;gap:10px;margin-top:6px">
        <span class="m-display" style="font-size:26px;color:#F1ECDF">Mond</span>
        <span class="m-mono" style="font-size:11.5px;color:rgba(241,236,223,0.6)">in {{ moon.sign }} · {{ moon.deg }}<template v-if="moon.house"> · {{ moon.house }}. Haus</template></span>
      </div>
    </div>

    <div class="m-eyebrow" style="padding:0 26px 8px">Alle zehn</div>
    <div class="pl__list">
      <div
        v-for="(r, i) in planets" :key="r.name"
        class="pl__row" :class="{ last: i === planets.length - 1 }"
      >
        <span class="m-glyph" style="font-size:24px;width:34px;color:var(--ink)">{{ r.astro }}</span>
        <div style="flex:1;text-align:left">
          <div class="m-display" style="font-size:16px;color:var(--ink)">{{ r.de }}</div>
          <div class="m-mono pl__row-sub">{{ r.sign }} · {{ r.deg }}</div>
        </div>
        <div v-if="r.house" class="m-mono pl__row-house">{{ r.house }}. H.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useActiveChart } from '~/composables/useActiveChart';

const { planets } = useActiveChart();
const moon = computed(() => planets.value.find((p) => p.name === 'Moon'));
</script>

<style scoped>
.pl__feature {
  margin: 4px 22px 14px; padding: 18px 18px 20px; border-radius: 18px;
  background: linear-gradient(150deg, #1A1814, #2A251F); color: #F1ECDF;
  position: relative; overflow: hidden;
}
.pl__feature-glyph {
  position: absolute; right: -10px; top: -30px; font-size: 180px;
  color: rgba(232, 201, 136, 0.18); line-height: 1;
}

.pl__list {
  margin: 0 22px; background: var(--card); border: 0.5px solid var(--line);
  border-radius: 16px; overflow: hidden;
}
.pl__row {
  display: flex; align-items: center; width: 100%; padding: 12px 14px;
  border-bottom: 0.5px solid var(--line);
}
.pl__row.last { border-bottom: none; }
.pl__row-sub { font-size: 11px; color: var(--muted); letter-spacing: 0.3px; }
.pl__row-house {
  font-size: 11px; color: var(--ink-2); margin-right: 10px;
  padding: 3px 7px; background: var(--paper); border-radius: 6px;
}
</style>
