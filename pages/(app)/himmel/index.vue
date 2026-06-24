<template>
  <div class="m-screen">
    <div class="m-screen__inner" style="padding-left:0;padding-right:0">
      <!-- hero header -->
      <div style="padding:12px 22px 8px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="m-eyebrow">Mein Himmel</div>
          <div style="display:flex;gap:8px;color:var(--muted)">
            <UIcon name="i-heroicons-share" style="width:20px;height:20px" />
            <UIcon name="i-heroicons-ellipsis-horizontal" style="width:20px;height:20px" />
          </div>
        </div>
        <div class="m-display" style="font-size:34px;margin-top:6px">{{ firstName }}</div>
        <div class="m-mono himmel__meta">{{ birthLine }}</div>
      </div>

      <NoProfile v-if="error === 'no-profile'" />
      <div v-else-if="loading && !horoscope?.houses" class="himmel__loading m-mono">Himmel wird berechnet…</div>

      <template v-else>
        <!-- big three -->
        <div class="himmel__big3">
          <div v-for="b in bigThree" :key="b.label" class="himmel__chip" :class="{ featured: b.featured }">
            <span class="m-glyph" style="font-size:24px">{{ b.glyph }}</span>
            <div class="m-eyebrow" :style="{ color: b.featured ? 'rgba(241,236,223,0.55)' : 'var(--muted)', marginTop: '6px' }">{{ b.label }}</div>
            <div class="m-display" style="font-size:18px;margin-top:-1px">{{ b.sign }}</div>
            <div class="m-mono" style="font-size:10px;opacity:.7">{{ b.sub }}</div>
          </div>
        </div>

        <!-- tab strip (in-page, no navigation) -->
        <div class="himmel__tabs">
          <button
            v-for="t in tabs" :key="t.key" type="button"
            class="himmel__tab" :class="{ active: activeTab === t.key }"
            @click="setTab(t.key)"
          >{{ t.label }}</button>
        </div>

        <!-- sliding tab content -->
        <div class="himmel__viewport">
          <Transition :name="'slide-' + dir" mode="out-in">
            <div :key="activeTab" class="himmel__panel">
              <!-- Häuser: birth chart wheel + house list -->
              <template v-if="activeTab === 'haeuser'">
                <div class="himmel__wheel">
                  <Birthchart />
                </div>
                <div class="himmel__houses">
                  <div v-for="h in houses" :key="h.n" class="house-item">
                    <button
                      type="button" class="house"
                      :class="{ hilite: h.n === 10, open: openHouse === h.n }"
                      :disabled="!h.bodies.length"
                      @click="toggleHouse(h.n)"
                    >
                      <div class="house__n font-astronomicon">{{ h.signGlyph }}</div>
                      <div style="flex:1;text-align:left">
                        <div class="m-display" style="font-size:16px">{{ h.sign }}</div>
                        <div class="house__desc m-mono">{{ h.desc }}</div>
                      </div>
                      <span v-if="h.bodies.length" class="house__count m-mono">{{ h.bodies.length }}</span>
                      <UIcon
                        v-if="h.bodies.length"
                        name="i-heroicons-chevron-right" class="house__chev"
                        :class="{ open: openHouse === h.n }"
                      />
                    </button>

                    <div v-if="openHouse === h.n" class="house__bodies">
                      <div v-for="b in h.bodies" :key="b.name" class="house__body">
                        <span class="m-glyph house__body-glyph">{{ b.astro }}</span>
                        <span class="m-display house__body-de">{{ b.de }}</span>
                        <span class="m-mono house__body-pos">
                          <span class="font-astronomicon">{{ b.signGlyph }}</span> {{ b.sign }} · {{ b.deg }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Planeten: matrix/table diagram + detailed list under it -->
              <div v-else-if="activeTab === 'planeten'">
                <div class="himmel__embed"><Planets /></div>
                <div class="himmel__under"><PlanetList /></div>
              </div>

              <!-- Aspekte: matrix diagram + detailed cards under it -->
              <div v-else>
                <div class="himmel__embed"><Aspects /></div>
                <div class="himmel__under"><AspectList /></div>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import Birthchart from '~/components/birthchart.vue';
import Planets from '~/components/Planets.vue';
import Aspects from '~/components/aspects.vue';
import PlanetList from '~/components/PlanetList.vue';
import AspectList from '~/components/AspectList.vue';
import { useActiveChart } from '~/composables/useActiveChart';
import { useProfile } from '~/composables/useProfile';

const { horoscope, profile, loading, error, ensureLoaded, bigThree, houses } = useActiveChart();
const { formatBirthDate, formatBirthTime } = useProfile();

// aufklappbares Haus: zeigt die darin stehenden Planeten
const openHouse = ref(null);
const toggleHouse = (n) => { openHouse.value = openHouse.value === n ? null : n; };

const firstName = computed(() => (profile.value?.name || 'Mein Himmel').split(' ')[0]);
const birthLine = computed(() => {
  const p = profile.value;
  if (!p?.birthdate) return '';
  const c = p.coordinates || [];
  const coords = c.length === 2 ? ` · ${c[1].toFixed(2)}° N · ${c[0].toFixed(2)}° E` : '';
  return `${formatBirthDate(p.birthdate)} · ${formatBirthTime(p.birthtime)}${coords}`;
});

// in-page tabs
const tabs = [
  { key: 'haeuser', label: 'Häuser' },
  { key: 'planeten', label: 'Planeten' },
  { key: 'aspekte', label: 'Aspekte' },
];
const activeTab = ref('haeuser');
const dir = ref('right');
const setTab = (key) => {
  if (key === activeTab.value) return;
  const order = tabs.map((t) => t.key);
  dir.value = order.indexOf(key) > order.indexOf(activeTab.value) ? 'right' : 'left';
  activeTab.value = key;
};

onMounted(ensureLoaded);
</script>

<style scoped>
.himmel__meta { font-size: 11.5px; color: var(--muted); margin-top: 4px; letter-spacing: 0.4px; }
.himmel__loading { text-align: center; color: var(--muted); padding: 40px 22px; font-size: 12px; }

.himmel__big3 { display: flex; gap: 8px; padding: 12px 22px 4px; }
.himmel__chip {
  flex: 1; padding: 12px 10px; border-radius: 14px;
  background: var(--card); color: var(--ink); border: 0.5px solid var(--line);
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
}
.himmel__chip.featured { background: var(--ink); color: #F1ECDF; border: none; }


.himmel__tabs {
  margin: 12px 22px 0; display: flex; gap: 0;
  background: var(--card); border: 0.5px solid var(--line); border-radius: 14px; padding: 4px;
}
.himmel__tab {
  flex: 1; text-align: center; padding: 9px 0;
  font-size: 13px; font-weight: 600; border-radius: 10px;
  color: var(--ink-2); background: transparent; border: none; cursor: pointer;
  font-family: var(--body); transition: color 0.2s;
}
.himmel__tab.active { background: var(--ink); color: #F1ECDF; }

/* sliding viewport clips the horizontal slide */
.himmel__viewport { overflow-x: hidden; }
.himmel__panel { padding-top: 8px; }

.himmel__wheel { padding: 6px 22px 6px; }
.himmel__embed { padding: 8px 16px 0; }
.himmel__under { margin-top: 18px; }

.himmel__houses {
  margin: 10px 22px 0; display: flex; flex-direction: column;
  background: var(--card); border: 0.5px solid var(--line); border-radius: 14px; overflow: hidden;
}
.house-item { border-bottom: 0.5px solid var(--line); }
.house-item:last-child { border-bottom: none; }
.house {
  display: flex; align-items: center; width: 100%;
  padding: 14px 16px; gap: 14px;
  background: transparent; border: none; cursor: pointer;
  font-family: var(--body); text-align: left;
}
.house.hilite { background: rgba(176, 122, 44, 0.06); }
.house:disabled { cursor: default; }
.house__n {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--ink); color: #F1ECDF;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex: none;
}
.house__desc { font-size: 11.5px; color: var(--muted); letter-spacing: 0.3px; margin-top: 1px; }
.house__count {
  font-size: 11px; color: var(--ink-2);
  padding: 2px 8px; background: var(--paper); border-radius: 100px; flex: none;
}
.house__chev { width: 14px; height: 14px; color: var(--muted); flex: none; transition: transform 0.2s; }
.house__chev.open { transform: rotate(90deg); }

.house__bodies {
  padding: 2px 16px 14px 62px;
  display: flex; flex-direction: column; gap: 10px;
}
.house.hilite + .house__bodies { background: rgba(176, 122, 44, 0.06); }
.house__empty { font-size: 11.5px; color: var(--muted); }
.house__body { display: flex; align-items: center; gap: 12px; }
.house__body-glyph { font-size: 20px; width: 26px; text-align: center; color: var(--ink); flex: none; }
.house__body-de { font-size: 14px; color: var(--ink); }
.house__body-pos { margin-left: auto; font-size: 11px; color: var(--muted); letter-spacing: 0.3px; }

/* tab slide transitions */
.slide-right-enter-active, .slide-right-leave-active,
.slide-left-enter-active, .slide-left-leave-active {
  transition: transform 0.26s ease, opacity 0.26s ease;
}
.slide-right-enter-from { transform: translateX(28px); opacity: 0; }
.slide-right-leave-to { transform: translateX(-28px); opacity: 0; }
.slide-left-enter-from { transform: translateX(-28px); opacity: 0; }
.slide-left-leave-to { transform: translateX(28px); opacity: 0; }
</style>
