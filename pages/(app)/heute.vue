<template>
  <div class="m-screen">
    <div class="m-screen__inner today">
      <!-- header -->
      <div class="today__head">
        <div>
          <div class="m-eyebrow">{{ todayLabel }}</div>
          <div class="m-display today__greeting">{{ greeting }},<br />{{ firstName }}.</div>
        </div>
        <NuxtLink to="/onboarding" class="today__bell" aria-label="Profil">
          <UIcon name="i-heroicons-bell" style="width:20px;height:20px" />
        </NuxtLink>
      </div>

      <NoProfile v-if="error === 'no-profile'" />

      <template v-else>
        <!-- sky-now hero -->
        <div class="today__sky">
          <span
            v-for="(s, i) in stars" :key="i" class="today__star"
            :style="{ left: s.x + '%', top: s.y + '%', width: s.s + 'px', height: s.s + 'px',
                      background: s.gold ? '#E8C988' : '#F1ECDF', opacity: s.o }"
          />
          <div style="position:relative">
            <div class="m-eyebrow" style="color:rgba(232,201,136,0.95)">Der Himmel · jetzt</div>
            <div class="today__sky-body">
              <div class="today__moon" :style="moonStyle" />
              <div style="flex:1">
                <div class="m-display" style="font-size:22px;color:#F1ECDF">{{ sky.phase }}</div>
                <div class="today__sky-meta m-mono">
                  <span>{{ sky.moon }}</span>
                  <span>{{ sky.sun }}</span>
                  <span>{{ sky.asc }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- dein persönliches Tageshoroskop nach Lebensbereichen -->
        <div class="m-eyebrow" style="margin-top:24px">Dein Tageshoroskop</div>

        <div v-if="dailyLoading" class="today__loading m-mono">Merlin liest deinen Tag…</div>
        <div v-else-if="dailyError" class="today__loading m-mono">{{ dailyError }}</div>
        <template v-else>
          <p v-if="daily?.intro" class="today__intro">{{ daily.intro }}</p>
          <div class="today__areas">
            <div
              v-for="a in daily?.areas || []" :key="a.key"
              class="m-card area" :class="'area--' + a.tone"
            >
              <div class="area__head">
                <span class="area__dot" />
                <span class="m-display area__title">{{ a.title }}</span>
                <span class="area__tag">{{ toneLabel(a.tone) }}</span>
              </div>
              <p class="area__text">{{ a.text }}</p>
            </div>
          </div>
        </template>

        <!-- today's themes -->
        <div class="m-eyebrow" style="margin-top:24px">Die Konstellationen dahinter</div>
        <div v-if="loadingTransits" class="today__loading m-mono">Transite werden berechnet…</div>
        <div v-else class="today__transits">
          <div v-for="(t, i) in topTransits" :key="i" class="m-card transit">
            <div class="transit__glyphs">
              <span class="m-glyph" style="font-size:22px">{{ t.a }}</span>
              <span class="m-glyph" style="font-size:14px;opacity:.5;margin:0 4px">·</span>
              <span class="m-glyph" style="font-size:22px">{{ t.b }}</span>
            </div>
            <div style="flex:1">
              <div class="transit__title">
                <span class="m-display" style="font-size:17px">{{ t.sign }}</span>
                <span class="m-mono transit__planets">{{ t.planets }}</span>
              </div>
              <div class="transit__blurb">{{ t.blurb }}</div>
              <div class="transit__bar">
                <div :style="{ width: t.intensity * 100 + '%', background: t.color }" />
              </div>
            </div>
          </div>
          <div v-if="!topTransits.length" class="today__loading m-mono">Keine markanten Transite heute.</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import { useProfilesStore } from '~/stores/profilesStore';
import { useTransits } from '~/composables/useTransits';
import { useTranslateZodiac } from '~/composables/translateZodiac';
import { useInterpretation } from '~/composables/useInterpretation';
import { aspectKind, kindColor, fmtDeg } from '~/composables/useActiveChart';

const profilesStore = useProfilesStore();
const { calculateTransits } = useTransits();
const { fetchDaily } = useInterpretation();
const { getPlanetSymbol, translatePlanetName, translateZodiacName } = useTranslateZodiac();

const error = ref('');
const loadingTransits = ref(true);
const topTransits = ref([]);
const sky = ref({ phase: 'Der Himmel jetzt', moon: '', sun: '', asc: '' });
const moonStyle = ref({});

// personalisiertes Tageshoroskop nach Lebensbereichen (LLM, pro Profil + Tag gecacht)
const daily = ref(null); // { intro, areas: [{ key, title, tone, text }] }
const dailyLoading = ref(true);
const dailyError = ref('');

const TONE_LABEL = { harmonisch: 'Harmonisch', herausfordernd: 'Herausfordernd', ausgeglichen: 'Ausgeglichen' };
const toneLabel = (t) => TONE_LABEL[t] || 'Ausgeglichen';

const profile = computed(() => profilesStore.profile);
const firstName = computed(() => (profile.value?.name || 'Reisende:r').split(' ')[0]);

const now = new Date();
const greeting = computed(() => {
  const h = now.getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  if (h < 22) return 'Guten Abend';
  return 'Gute Nacht';
});
const todayLabel = computed(() =>
  now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
);
// stabiler Tages-Schlüssel (lokal) für den Cache: YYYY-MM-DD
const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const stars = Array.from({ length: 18 }, (_, i) => ({
  x: 5 + (i * 53) % 90, y: 8 + (i * 37) % 80,
  s: i % 3 === 0 ? 2 : 1, gold: i % 5 === 0, o: i % 4 === 0 ? 0.95 : 0.45,
}));

const ASPECT_DE = { conjunction: 'Konjunktion', opposition: 'Opposition', trine: 'Trigon', square: 'Quadrat', sextile: 'Sextil' };
const BLURB = {
  conjunction: 'Verschmelzung — zwei Kräfte werden eins.',
  trine: 'Fließende Unterstützung, fast mühelos.',
  sextile: 'Eine Tür öffnet sich, wenn du sie nutzt.',
  square: 'Spannung, die zum Handeln drängt.',
  opposition: 'Zwei Pole suchen heute ihre Balance.',
};

const moonPhase = (sunLong, moonLong) => {
  const diff = (((moonLong - sunLong) % 360) + 360) % 360;
  const names = ['Neumond', 'Zunehmende Sichel', 'Zunehmender Halbmond', 'Zunehmender Mond',
    'Vollmond', 'Abnehmender Mond', 'Abnehmender Halbmond', 'Abnehmende Sichel'];
  return { name: names[Math.floor(((diff + 22.5) % 360) / 45)], waxing: diff < 180, diff };
};

// Leitet aus einem Transit-Chart die anzeigefertigen Himmels-Texte ab.
const skyFrom = (result) => {
  const tp = result?.transitChart?.planetaryPositions || [];
  const sun = tp.find((x) => x.name === 'Sun');
  const moon = tp.find((x) => x.name === 'Moon');
  if (!sun || !moon) return null;
  const ascSign = result?.transitChart?.houses?.Houses?.[0]?.zodiacSign;
  const ph = moonPhase(sun.longitude, moon.longitude);
  return {
    phase: ph.name,
    waxing: ph.waxing,
    moon: `Mond in ${translateZodiacName(moon.zodiacSign)} · ${fmtDeg(moon.angle)}`,
    sun: `Sonne in ${translateZodiacName(sun.zodiacSign)} · ${fmtDeg(sun.angle)}`,
    asc: ascSign ? `Asz. heute ${translateZodiacName(ascSign)}` : '',
  };
};

onMounted(async () => {
  if (!profilesStore.profile) await profilesStore.fetchProfiles().catch(() => {});
  const p = profilesStore.profile;
  if (!p?.birthdate || !p?.birthtime || !p?.coordinates) {
    error.value = 'no-profile';
    loadingTransits.value = false;
    dailyLoading.value = false;
    return;
  }

  try {
    const birthData = { birthdate: p.birthdate, birthtime: p.birthtime, coordinates: p.coordinates };
    // Zwei Berechnungen parallel:
    //  • nowResult  – exakte Uhrzeit, treibt nur das „Himmel · jetzt"-Fenster
    //    (v.a. den Aszendenten, der alle ~2 h das Zeichen wechselt).
    //  • dayResult  – 12:00 als stabile Tagesreferenz: treibt Transit-Karten und
    //    das Tageshoroskop, damit dessen Cache genau einmal pro Tag greift.
    const [nowResult, dayResult] = await Promise.all([
      calculateTransits(birthData, new Date(), { exactTime: true }),
      calculateTransits(birthData, new Date()),
    ]);

    // „Der Himmel · jetzt" – aus dem exakt-zeitlichen Chart
    const nowSky = skyFrom(nowResult);
    if (nowSky) {
      sky.value = { phase: nowSky.phase, moon: nowSky.moon, sun: nowSky.sun, asc: nowSky.asc };
      // illuminate the disc from the correct side (waxing = lit on the right)
      const shadow = nowSky.waxing ? 'inset -22px -8px 0 0 #E8C988' : 'inset 22px -8px 0 0 #E8C988';
      moonStyle.value = { boxShadow: shadow };
    }

    // top 3 most-exact transit aspects (stabile Tagesreferenz)
    topTransits.value = (dayResult.transits || []).slice(0, 3).map((t) => {
      const kind = aspectKind(t.aspect);
      return {
        a: getPlanetSymbol(t.transitPlanet), b: getPlanetSymbol(t.natalPlanet),
        sign: ASPECT_DE[t.aspect] || t.aspect,
        planets: `${translatePlanetName(t.transitPlanet)} · ${translatePlanetName(t.natalPlanet)}`,
        blurb: BLURB[t.aspect] || '',
        intensity: Math.max(0.12, 1 - (t.orb ?? 0) / 8),
        color: kindColor[kind],
      };
    });

    // personalisiertes Tageshoroskop: die stärksten Transite des Tages in
    // lesbare Zeilen übersetzen und (mit dem Tages-Himmel) an die Deutung geben.
    const daySky = skyFrom(dayResult);
    const dailyTransits = (dayResult.transits || []).slice(0, 6).map((t) => {
      const aspectDe = ASPECT_DE[t.aspect] || t.aspect;
      const orb = (t.orb ?? 0).toFixed(1);
      return `${translatePlanetName(t.transitPlanet)} (heute in ${translateZodiacName(t.transitPlanetSign)}) ` +
        `${aspectDe} zu deinem ${translatePlanetName(t.natalPlanet)} (natal in ${translateZodiacName(t.natalPlanetSign)}), Orbis ${orb}°`;
    });

    try {
      daily.value = await fetchDaily(p.id, dateKey, dailyTransits, daySky ? {
        phase: daySky.phase, moon: daySky.moon, sun: daySky.sun,
      } : null);
    } catch (e) {
      console.error('Heute: Tageshoroskop failed', e);
      dailyError.value = 'Dein Tageshoroskop konnte gerade nicht geladen werden.';
    } finally {
      dailyLoading.value = false;
    }
  } catch (e) {
    console.error('Heute: transits failed', e);
    dailyError.value = 'Dein Tageshoroskop konnte gerade nicht geladen werden.';
    dailyLoading.value = false;
  } finally {
    loadingTransits.value = false;
  }
});
</script>

<style scoped>
.today__head { display: flex; justify-content: space-between; align-items: center; }
.today__greeting { font-size: 38px; margin-top: 4px; }
.today__bell {
  width: 42px; height: 42px; border-radius: 50%;
  background: var(--card); border: 0.5px solid var(--line);
  display: flex; align-items: center; justify-content: center; color: var(--ink); flex: none;
}

.today__sky {
  margin-top: 22px; padding: 20px 18px 22px; border-radius: 20px;
  background: var(--ink); color: #F1ECDF; position: relative; overflow: hidden;
}
.today__star { position: absolute; border-radius: 2px; }
.today__sky-body { display: flex; gap: 18px; align-items: flex-end; margin-top: 10px; }
.today__moon {
  width: 74px; height: 74px; border-radius: 50%; flex: none;
  background: var(--ink);
  box-shadow: inset -22px -8px 0 0 #E8C988;
  border: 0.5px solid rgba(241, 236, 223, 0.4);
}
.today__sky-meta {
  font-size: 11.5px; color: rgba(241, 236, 223, 0.65); margin-top: 6px;
  display: flex; flex-direction: column; gap: 2px; letter-spacing: 0.4px;
}

.today__loading { color: var(--muted); font-size: 12px; margin-top: 12px; }
.today__transits { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.transit { display: flex; gap: 14px; align-items: center; padding: 14px; border-radius: 16px; }
.transit__glyphs {
  display: flex; align-items: center; justify-content: center;
  width: 60px; height: 48px; border-radius: 12px; flex: none;
  background: var(--paper); color: var(--ink);
}
.transit__title { display: flex; align-items: baseline; gap: 8px; }
.transit__planets {
  font-size: 10.5px; letter-spacing: 1.2px; color: var(--muted); text-transform: uppercase;
}
.transit__blurb { font-size: 12.5px; line-height: 1.45; margin-top: 3px; color: var(--ink-2); }
.transit__bar { margin-top: 8px; height: 3px; border-radius: 3px; background: #EFE6D0; }
.transit__bar > div { height: 3px; border-radius: 3px; }

.today__intro {
  font-size: 14px; line-height: 1.5; color: var(--ink-2);
  margin-top: 10px;
}
.today__areas { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }

.area { padding: 14px 16px; border-left: 3px solid var(--line); }
.area__head { display: flex; align-items: center; gap: 9px; }
.area__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--muted); flex: none; }
.area__title { font-size: 16px; flex: 1; }
.area__tag {
  font-family: var(--mono); font-size: 9.5px; letter-spacing: 1px; text-transform: uppercase;
  font-weight: 700; padding: 4px 9px; border-radius: 100px; flex: none;
  color: var(--muted); background: var(--paper-2);
}
.area__text { font-size: 13px; line-height: 1.5; color: var(--ink-2); margin-top: 9px; }

/* Ton-Farben: harmonisch = Salbeigrün, herausfordernd = Tonrot, ausgeglichen = neutral */
.area--harmonisch { border-left-color: #6B9A78; }
.area--harmonisch .area__dot { background: #6B9A78; }
.area--harmonisch .area__tag { color: #4F7A5C; background: rgba(107, 154, 120, 0.16); }

.area--herausfordernd { border-left-color: #B5573F; }
.area--herausfordernd .area__dot { background: #B5573F; }
.area--herausfordernd .area__tag { color: #A6492F; background: rgba(181, 87, 63, 0.15); }
</style>
