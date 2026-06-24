<template>
  <div class="m-screen m-screen--plum">
    <div class="m-screen__inner" style="padding-left:0;padding-right:0">
      <div class="sy__back">
        <NuxtLink to="/kreis" class="m-back-btn">
          <UIcon name="i-heroicons-chevron-left" style="width:16px;height:16px" />
        </NuxtLink>
        <span class="m-eyebrow">Synastrie</span>
      </div>

      <div v-if="state === 'error'" class="sy__msg m-mono">{{ message }}</div>
      <div v-else-if="state === 'loading'" class="sy__msg m-mono">Synastrie wird berechnet…</div>

      <template v-else>
        <!-- couple ring -->
        <div class="sy__couple">
          <div class="sy__av sy__av--me">{{ meInit }}</div>
          <div class="sy__av sy__av--them">{{ themInit }}</div>
        </div>

        <div style="text-align:center;margin-top:10px">
          <div class="m-display" style="font-size:26px">{{ meFirst }} &amp; {{ themFirst }}</div>
          <div class="m-mono sy__sub">{{ signLine }} · {{ data.aspectCount }} gemeinsame Aspekte</div>
        </div>

        <!-- total score -->
        <div style="display:flex;justify-content:center;margin-top:20px">
          <div class="sy__score">
            <svg width="160" height="160" viewBox="0 0 160 160" style="transform:rotate(-90deg)">
              <circle cx="80" cy="80" r="72" fill="none" stroke="#E3DBC8" stroke-width="6" />
              <circle
                cx="80" cy="80" r="72" fill="none" stroke="url(#syg)" stroke-width="6"
                :stroke-dasharray="`${(data.total / 100) * 452} 452`" stroke-linecap="round"
              />
              <defs>
                <linearGradient id="syg" x1="0" x2="1">
                  <stop offset="0" stop-color="#B07A2C" />
                  <stop offset="1" stop-color="#A36296" />
                </linearGradient>
              </defs>
            </svg>
            <div class="sy__score-inner">
              <div class="m-display" style="font-size:56px;line-height:1">{{ data.total }}</div>
              <div class="m-mono" style="font-size:10px;letter-spacing:1.6px;color:var(--muted)">VON 100</div>
              <div class="m-display" style="font-size:14px;color:var(--gold);margin-top:6px">{{ data.level }}</div>
            </div>
          </div>
        </div>

        <!-- category bars -->
        <div class="sy__cats">
          <div v-for="c in data.cats" :key="c.name">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <span style="font-size:13px">{{ c.name }}</span>
              <span class="m-mono" style="font-size:11px;color:var(--muted)">{{ c.v }}%</span>
            </div>
            <div class="sy__bar">
              <div :style="{ width: c.v + '%', background: c.color }" />
            </div>
          </div>
        </div>

        <!-- core aspect -->
        <div v-if="data.core" class="m-card sy__core">
          <div class="m-eyebrow">Kern-Aspekt</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
            <span class="m-glyph" style="font-size:24px">{{ data.core.a }}</span>
            <span :style="{ color: data.core.color, fontSize: '20px' }">{{ data.core.sym }}</span>
            <span class="m-glyph" style="font-size:24px">{{ data.core.b }}</span>
            <span class="m-display" style="font-size:16px;margin-left:6px">{{ data.core.title }}</span>
          </div>
          <div class="sy__core-text">{{ data.core.text }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import { useProfilesStore } from '~/stores/profilesStore';
import { useSynastry } from '~/composables/useSynastry';
import { useTranslateZodiac } from '~/composables/translateZodiac';
import { aspectKind, kindColor } from '~/composables/useActiveChart';

const route = useRoute();
const profilesStore = useProfilesStore();
const { calculateSynastry, getCompatibilityLevel } = useSynastry();
const { getPlanetSymbol, translatePlanetName, translateZodiacName } = useTranslateZodiac();

const ASPECT_DE = { conjunction: 'Konjunktion', opposition: 'Opposition', trine: 'Trigon', square: 'Quadrat', sextile: 'Sextil' };
const ASPECT_SYM = { conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹' };
const CORE_TEXT = {
  conjunction: 'Eine intensive Verschmelzung — ihr verstärkt euch gegenseitig.',
  trine: 'Eine seltene Leichtigkeit. Ihr versteht euch, ohne erklären zu müssen.',
  sextile: 'Ein einladender Aspekt — Nähe entsteht, wenn ihr sie zulasst.',
  square: 'Reibung, die euch beide wachsen lässt.',
  opposition: 'Anziehung der Gegensätze — Spannung und Faszination zugleich.',
};
// design category label → API category key
const CAT_MAP = [
  ['Liebe & Anziehung', 'romance'],
  ['Kommunikation', 'communication'],
  ['Werte & Lebensziel', 'growth'],
  ['Konflikt-Dynamik', 'stability'],
  ['Geistig & Spirituell', 'emotional'],
];

const state = ref('loading');
const message = ref('');
const data = ref({});

const meInit = ref(''); const themInit = ref('');
const meFirst = ref(''); const themFirst = ref('');
const signLine = ref('');

const initials = (n) => (n || '').split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
const first = (n) => (n || '').split(' ')[0];
const catColor = (v) => (v >= 70 ? 'var(--gold)' : v >= 50 ? '#A89370' : 'var(--plum)');

onMounted(async () => {
  if (!profilesStore.profile) await profilesStore.fetchProfiles().catch(() => {});
  const owner = profilesStore.profile;
  const friend = (profilesStore.friends || []).find((f) => f.id === route.query.friend)
    || (profilesStore.friends || [])[0];

  if (!owner?.birthdate || !owner?.birthtime || !owner?.coordinates) {
    state.value = 'error'; message.value = 'Lege zuerst dein eigenes Profil an.'; return;
  }
  if (!friend) { state.value = 'error'; message.value = 'Keine Person im Kreis gefunden.'; return; }
  if (!friend.birthdate || !friend.birthtime || !friend.coordinates) {
    state.value = 'error'; message.value = `${first(friend.name)} fehlen Geburtsdaten.`; return;
  }

  meInit.value = initials(owner.name); themInit.value = initials(friend.name);
  meFirst.value = first(owner.name); themFirst.value = first(friend.name);

  try {
    const res = await calculateSynastry(owner, friend);
    const cs = res.compatibilityScore || {};
    const ownerSun = res.person1Chart?.planetaryPositions?.find((x) => x.name === 'Sun');
    const friendSun = res.person2Chart?.planetaryPositions?.find((x) => x.name === 'Sun');
    signLine.value = `${ownerSun ? translateZodiacName(ownerSun.zodiacSign) : '?'} ☉ ↔ ${friendSun ? translateZodiacName(friendSun.zodiacSign) : '?'} ☉`;

    const cats = CAT_MAP.map(([name, key]) => {
      const v = Math.round(cs.categories?.[key]?.percentage ?? 0);
      return { name, v, color: catColor(v) };
    });

    const top = (res.synastryAspects || [])[0];
    const core = top ? {
      a: getPlanetSymbol(top.person1Planet), b: getPlanetSymbol(top.person2Planet),
      sym: ASPECT_SYM[top.aspect], color: kindColor[aspectKind(top.aspect)],
      title: `${translatePlanetName(top.person1Planet)} ${ASPECT_DE[top.aspect]} ${translatePlanetName(top.person2Planet)}`,
      text: CORE_TEXT[top.aspect] || '',
    } : null;

    data.value = {
      total: cs.total ?? 0,
      level: getCompatibilityLevel(cs.total ?? 0).level,
      aspectCount: cs.aspectCount ?? 0,
      cats, core,
    };
    state.value = 'ready';
  } catch (e) {
    console.error('Synastry detail failed', e);
    state.value = 'error'; message.value = 'Berechnung fehlgeschlagen.';
  }
});
</script>

<style scoped>
.sy__back { display: flex; align-items: center; gap: 10px; padding: 10px 22px 0; color: var(--ink-2); }
.sy__msg { text-align: center; color: var(--muted); padding: 50px 22px; font-size: 12.5px; }

.sy__couple { display: flex; justify-content: center; margin-top: 14px; position: relative; }
.sy__av {
  width: 78px; height: 78px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-size: 24px;
}
.sy__av--me { background: var(--card); color: var(--ink); border: 1px solid var(--gold); margin-right: -14px; z-index: 2; }
.sy__av--them { background: var(--ink); color: #F1ECDF; border: 1px solid var(--plum); }

.sy__sub { font-size: 11px; color: var(--muted); margin-top: 4px; letter-spacing: 0.4px; }

.sy__score { position: relative; width: 160px; height: 160px; }
.sy__score-inner {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}

.sy__cats { margin: 18px 22px 0; display: flex; flex-direction: column; gap: 12px; }
.sy__bar { height: 4px; background: var(--line); border-radius: 4px; margin-top: 6px; }
.sy__bar > div { height: 4px; border-radius: 4px; }

.sy__core { margin: 22px 22px 0; padding: 16px 18px; }
.sy__core-text { font-size: 12.5px; color: var(--ink-2); margin-top: 8px; line-height: 1.5; }
</style>
