<template>
  <div class="m-screen">
    <div class="m-screen__inner reading">
      <!-- header -->
      <div class="reading__head">
        <NuxtLink to="/deutungen" class="m-back-btn" aria-label="Zurück">
          <UIcon name="i-heroicons-chevron-left" style="width:18px;height:18px" />
        </NuxtLink>
        <div class="m-eyebrow">Deine Deutung</div>
        <button
          v-if="error !== 'no-profile'"
          type="button"
          class="m-pill reading__export"
          :disabled="!canExport"
          @click="exportPdf"
        >
          <UIcon
            :name="canExport ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-ellipsis-horizontal'"
            style="width:15px;height:15px"
          />
          {{ canExport ? 'Als PDF' : 'wird erstellt…' }}
        </button>
      </div>

      <NoProfile v-if="error === 'no-profile'" />

      <template v-else>
        <!-- Wortmarke nur im PDF/Druck (Deckblatt) -->
        <div class="reading__wordmark m-mono" aria-hidden="true">✦&ensp;MERLIN&ensp;✦</div>

        <h1 class="m-display reading__title">Geburts&shy;horoskop</h1>
        <div v-if="birthLine" class="m-mono reading__meta">{{ firstName }} · {{ birthLine }}</div>

        <!-- big three als dekorativer Auftakt (nur Bildschirm) -->
        <div v-if="bigThree.length" class="reading__big3">
          <div v-for="b in bigThree" :key="b.label" class="reading__chip">
            <span class="m-glyph reading__chip-glyph">{{ b.glyph }}</span>
            <div class="m-eyebrow reading__chip-label">{{ b.label }}</div>
            <div class="m-display reading__chip-sign">{{ b.sign }}</div>
          </div>
        </div>

        <!-- Geburtsdiagramm: füllt das PDF-Deckblatt (am Bildschirm verborgen) -->
        <div class="reading__cover-chart" aria-hidden="true">
          <BirthChart />
        </div>

        <!-- Fortschritt während der Erst-Generierung -->
        <div v-if="started && doneCount < CHAPTERS.length" class="reading__progress">
          <div class="reading__progress-bar">
            <div class="reading__progress-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <div class="reading__progress-label">
            <span class="m-mono">Merlin schreibt … Kapitel {{ Math.min(doneCount + 1, CHAPTERS.length) }} von {{ CHAPTERS.length }}</span>
            <span class="m-mono reading__progress-eta">{{ etaLabel }}</span>
          </div>
        </div>

        <!-- sticky Kapitel-Navigation -->
        <nav ref="kapnavEl" class="kapnav">
          <button
            v-for="(c, i) in CHAPTERS"
            :key="c.key"
            type="button"
            class="kapnav__item"
            :class="{ active: activeKey === c.key }"
            :data-key="c.key"
            @click="scrollToChapter(c.key)"
          >
            <span class="kapnav__num m-mono">{{ i + 1 }}</span>
            <span class="kapnav__label">{{ c.title }}</span>
          </button>
        </nav>

        <!-- die Kapitel -->
        <template v-for="(c, i) in CHAPTERS" :key="c.key">
          <section :id="'kap-' + c.key" class="chap">
            <div class="chap__head">
              <span class="chap__glyph m-glyph">{{ c.glyph }}</span>
              <div class="chap__head-text">
                <div class="m-eyebrow">Kapitel {{ i + 1 }}</div>
                <h2 class="m-display chap__title">{{ c.title }}</h2>
              </div>
              <!-- Dekor-Motiv nur auf dem PDF-Kapiteldeckblatt -->
              <img
                class="chap__cover-motif"
                :src="`/img/decoration/${(i % 9) + 1}.svg`"
                alt=""
                aria-hidden="true"
              />
            </div>

            <div class="m-card chap__card">
              <div
                v-if="!state[c.key].text && !state[c.key].loading && !state[c.key].error"
                class="chap__pending m-mono"
              >
                <span class="chap__pending-dot" /> wird vorbereitet…
              </div>
              <ReadingArticle
                v-else
                :markdown="state[c.key].text"
                :loading="state[c.key].loading"
                :error="state[c.key].error"
              />
            </div>
          </section>

          <!-- dekoratives Trennmotiv zwischen den Kapiteln (zyklisch über die 9 SVGs) -->
          <div v-if="i < CHAPTERS.length - 1" class="chap-divider">
            <img :src="`/img/decoration/${(i % 9) + 1}.svg`" alt="" />
          </div>
        </template>

        <div v-if="doneCount === CHAPTERS.length" class="reading__foot m-mono">
          ✦ Erstellt von Merlin · für {{ firstName }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useActiveChart } from '~/composables/useActiveChart';
import { useProfile } from '~/composables/useProfile';
import { useInterpretation } from '~/composables/useInterpretation';

const {
  horoscope, profile, error, ensureLoaded,
  bigThree, planets, houses, aspects, points, angles, chartRuler, balance,
} = useActiveChart();
const { formatBirthDate, formatBirthTime } = useProfile();
const { fetchReading } = useInterpretation();

// Kapitel-Reihenfolge + dekorative Glyphen (Astronomicon).
const CHAPTERS = [
  { key: 'himmelsbild',           title: 'Dein Himmelsbild',          glyph: 'Q' },
  { key: 'temperament',           title: 'Dein Temperament',          glyph: 'R' },
  { key: 'wesenskern',            title: 'Wesenskern',                glyph: '`' },
  { key: 'persoenliche_planeten', title: 'Denken, Lieben & Wollen',   glyph: 'T' },
  { key: 'wachstum_struktur',     title: 'Wachstum & Struktur',       glyph: 'V' },
  { key: 'tiefe_stroemungen',     title: 'Tiefere Strömungen',        glyph: 'Z' },
  { key: 'mondknoten_chiron',     title: 'Lebensaufgabe & Heilung',   glyph: 'N' },
  { key: 'berufung',              title: 'Berufung & Wurzeln',        glyph: 'W' },
  { key: 'aspekte',               title: 'Dein inneres Kräftespiel',  glyph: 'U' },
  { key: 'lebensbereiche',        title: 'Deine Lebensbereiche',      glyph: 'T' },
  { key: 'entwicklungsweg',       title: 'Dein Entwicklungsweg',      glyph: 'X' },
];

const state = reactive(
  Object.fromEntries(CHAPTERS.map((c) => [c.key, { text: '', loading: false, error: '' }]))
);
const started = ref(false);
const doneCount = computed(() => CHAPTERS.filter((c) => state[c.key].text).length);

// ─── Fortschritts- & Restzeit-Schätzung ──────────────────────────────────
const genStart = ref(0);   // Start der Generierung (ms)
const now = ref(0);        // tickt im Sekundentakt während der Generierung
let ticker = null;
const FALLBACK_PER_CHAPTER = 4; // initiale Sekunden-Schätzung (Wall-Clock) pro Kapitel

// gemessene Wall-Clock-Geschwindigkeit → berücksichtigt die parallelen Wellen
const etaSeconds = computed(() => {
  const total = CHAPTERS.length;
  if (!started.value || doneCount.value >= total) return 0;
  const elapsed = Math.max(0, (now.value - genStart.value) / 1000);
  const done = doneCount.value;
  const perChapter = done > 0 && elapsed > 0 ? elapsed / done : FALLBACK_PER_CHAPTER;
  return Math.max(1, Math.ceil((total - done) * perChapter));
});

const etaLabel = computed(() => {
  const s = etaSeconds.value;
  if (!s) return '';
  if (s >= 60) return `noch ca. ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} Min.`;
  return `noch ca. ${s} Sek.`;
});

// Balken läuft zeitbasiert flüssig weiter, springt aber nie zurück und nie auf 100 % vor Fertigstellung
const progressPct = computed(() => {
  const total = CHAPTERS.length;
  if (doneCount.value >= total) return 100;
  const byCount = (doneCount.value / total) * 100;
  const elapsed = Math.max(0, (now.value - genStart.value) / 1000);
  const eta = etaSeconds.value;
  const byTime = elapsed + eta > 0 ? (elapsed / (elapsed + eta)) * 100 : 0;
  return Math.min(96, Math.max(byCount, byTime));
});

const stopTicker = () => { if (ticker) { clearInterval(ticker); ticker = null; } };

const buildChart = () => ({
  name: profile.value.name,
  bigThree: bigThree.value,
  planets: planets.value,
  houses: houses.value,
  aspects: aspects.value,
  points: points.value,
  angles: angles.value,
  chartRuler: chartRuler.value,
  elements: balance.value.elements,
  modalities: balance.value.modalities,
});

// Kapitel in kleinen Wellen generieren → Aufdecken von oben nach unten,
// aber spürbar schneller. Server cacht jedes Kapitel; Folgeaufrufe sind sofort da.
const CONCURRENCY = 3;
const generate = async () => {
  if (started.value) return;
  started.value = true;
  genStart.value = Date.now();
  now.value = Date.now();
  ticker = setInterval(() => { now.value = Date.now(); }, 1000);
  const chart = buildChart();
  for (let i = 0; i < CHAPTERS.length; i += CONCURRENCY) {
    const batch = CHAPTERS.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (c) => {
      const s = state[c.key];
      s.loading = true;
      s.error = '';
      try {
        s.text = await fetchReading(profile.value.id, chart, c.key);
      } catch (e) {
        console.error('Kapitel fehlgeschlagen:', c.key, e);
        s.error = 'Dieses Kapitel konnte nicht geladen werden.';
      } finally {
        s.loading = false;
      }
    }));
  }
  stopTicker();
};

onUnmounted(stopTicker);

watch(
  () => horoscope.value?.houses,
  (h) => {
    if (h && profile.value && !started.value) generate();
  },
  { immediate: true }
);

// ─── Kapitel-Navigation (Scroll-Spy + Sprung) ────────────────────────────
const kapnavEl = ref(null);
const activeKey = ref(CHAPTERS[0].key);

const navOffset = () => (kapnavEl.value?.offsetHeight || 56) + 12;

const scrollToChapter = (key) => {
  const el = document.getElementById('kap-' + key);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - navOffset();
  window.scrollTo({ top: y, behavior: 'smooth' });
};

let rafId = null;
const onScroll = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    const line = navOffset() + 8;
    let current = CHAPTERS[0].key;
    for (const c of CHAPTERS) {
      const el = document.getElementById('kap-' + c.key);
      if (el && el.getBoundingClientRect().top <= line) current = c.key;
    }
    activeKey.value = current;
  });
};

// aktive Pille immer in die Sichtbarkeit der Leiste scrollen
watch(activeKey, (key) => {
  const nav = kapnavEl.value;
  if (!nav) return;
  const item = nav.querySelector(`[data-key="${key}"]`);
  if (!item) return;
  const navRect = nav.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const left = nav.scrollLeft + (itemRect.left - navRect.left) - nav.clientWidth / 2 + itemRect.width / 2;
  nav.scrollTo({ left, behavior: 'smooth' });
});

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  if (rafId) cancelAnimationFrame(rafId);
});

// ─── PDF-Export via Druckdialog ("Als PDF sichern") ──────────────────────
// Erst freigeben, wenn alle Kapitel da sind → vollständiges, sauberes PDF.
const canExport = computed(() => doneCount.value === CHAPTERS.length);

const exportPdf = async () => {
  if (!canExport.value) return;
  // Dateiname-Vorschlag des Browsers = document.title
  const prevTitle = document.title;
  document.title = `Geburtshoroskop – ${firstName.value || 'Merlin'}`;
  const restore = () => {
    document.title = prevTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  await nextTick();
  window.print();
};

const firstName = computed(() => (profile.value?.name || '').split(' ')[0]);
const birthLine = computed(() => {
  const p = profile.value;
  if (!p?.birthdate) return '';
  return `${formatBirthDate(p.birthdate)} · ${formatBirthTime(p.birthtime)}`;
});

onMounted(ensureLoaded);
</script>

<style scoped>
.reading__head { display: flex; align-items: center; gap: 12px; padding-top: 6px; }
.reading__export { margin-left: auto; flex: none; }
.reading__export:disabled { opacity: 0.5; cursor: default; }

/* Nur im Druck/PDF-Deckblatt sichtbar */
.reading__wordmark { display: none; }
.reading__cover-chart { display: none; }
.chap__cover-motif { display: none; }

.reading__title { font-size: 36px; line-height: 1.05; margin-top: 18px; hyphens: manual; }
.reading__meta { font-size: 11.5px; color: var(--muted); margin-top: 8px; letter-spacing: 0.4px; }

.reading__big3 { display: flex; gap: 8px; margin-top: 18px; }
.reading__chip {
  flex: 1; padding: 12px 10px; border-radius: 14px;
  background: var(--card); border: 0.5px solid var(--line);
  display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
}
.reading__chip-glyph { font-size: 22px; color: var(--gold); }
.reading__chip-label { margin-top: 6px; }
.reading__chip-sign { font-size: 17px; margin-top: -1px; }


/* Fortschrittsanzeige */
.reading__progress { margin-top: 22px; }
.reading__progress-bar {
  height: 4px; border-radius: 4px; background: var(--paper-2); overflow: hidden;
}
.reading__progress-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  transition: width 0.5s ease;
}
.reading__progress-label {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  margin-top: 8px; font-size: 10.5px; color: var(--muted); letter-spacing: 0.4px;
}
.reading__progress-eta { color: var(--gold); flex: none; }

/* sticky Kapitel-Navigation */
.kapnav {
  position: sticky; top: 0; z-index: 20;
  display: flex; gap: 8px; overflow-x: auto;
  margin: 22px -22px 6px; padding: 11px 22px;
  background: rgba(239, 233, 216, 0.85);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  border-bottom: 0.5px solid var(--line);
  scrollbar-width: none;
  touch-action: pan-x;
}
.kapnav::-webkit-scrollbar { display: none; }
.kapnav__item {
  flex: none; display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 13px; border-radius: 100px;
  background: var(--card); border: 0.5px solid var(--line);
  color: var(--ink-2); font-family: var(--body); font-size: 12.5px; font-weight: 600;
  white-space: nowrap; cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.kapnav__item.active { background: var(--ink); color: #F1ECDF; border-color: var(--ink); }
.kapnav__num { font-size: 10.5px; opacity: 0.55; }
.kapnav__item.active .kapnav__num { color: var(--gold-light); opacity: 0.9; }

/* Kapitel */
.chap { margin-top: 30px; scroll-margin-top: 72px; }
.chap__head { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.chap__glyph {
  font-size: 22px; width: 42px; height: 42px; flex: none;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  background: var(--ink); color: var(--gold-light);
}
.chap__title { font-size: 21px; line-height: 1.1; margin-top: 1px; }
.chap__card { padding: 20px 18px; }

/* dekoratives Trennmotiv zwischen den Kapiteln */
.chap-divider { display: flex; justify-content: center; margin: 30px 0 0; }
.chap-divider img {
  height: 96px; width: auto; max-width: 52%;
  opacity: 0.85;
}

.chap__pending {
  display: flex; align-items: center; gap: 8px;
  font-size: 11.5px; color: var(--muted); padding: 8px 0;
}
.chap__pending-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--hair);
}

.reading__foot {
  text-align: center; margin-top: 26px;
  font-size: 10.5px; letter-spacing: 0.6px; color: var(--muted);
}

/* ─── Druck-Layout (PDF) ──────────────────────────────────────────────────
   Seite 1 = Haupt-Deckblatt (Wortmarke · Titel · Geburtsdaten · Diagramm).
   Danach bekommt JEDES Kapitel ein eigenes, vollseitiges Deckblatt
   (Medaillon-Glyphe · Kapitelnummer · Titel · Dekor-Motiv, vertikal zentriert);
   der Kapiteltext folgt jeweils auf der nächsten Seite und läuft dort dicht.
*/
@media print {
  .m-back-btn,
  .reading__export,
  .kapnav,
  .reading__progress,
  .chap-divider,
  .chap__pending,
  .reading__foot,
  .reading__big3 { display: none !important; }

  /* ── Deckblatt (Seite 1): Wortmarke · Titel · Daten · Geburtsdiagramm ── */
  .reading__head { display: block; padding-top: 0; }
  .reading__head .m-eyebrow { display: none; }

  .reading__wordmark {
    display: block;
    text-align: center;
    font-size: 10px;
    letter-spacing: 4px;
    color: var(--gold);
    margin-top: 6mm;
  }
  .reading__title {
    text-align: center;
    font-size: 46px;
    line-height: 1.05;
    margin-top: 12px;
    hyphens: none;
  }
  .reading__meta {
    text-align: center;
    font-size: 13px;
    margin-top: 12px;
  }
  .reading__cover-chart {
    display: block;
    width: 100%;
    max-width: 155mm;
    margin: 12mm auto 0;
  }
  .reading__cover-chart :deep(#paper) { width: 100%; height: auto; }
  .reading__cover-chart :deep(svg) {
    width: 100%; height: auto; display: block;
    background: transparent !important;
  }

  /* ── Pro Kapitel: eigenes, vollseitiges Deckblatt ── */
  .chap {
    break-before: page;     /* jedes Kapitel beginnt auf neuer Seite */
    break-inside: auto;
    margin: 0;
    padding: 0;
  }

  /* Kapiteldeckblatt: vertikal zentrierte, dekorative Titelseite.
     min-height knapp unter der A4-Satzspiegel-Höhe (≈263mm) → füllt die
     Seite, ohne eine leere Folgeseite zu erzwingen. */
  .chap__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 240mm;
    margin: 0;
    gap: 0;
    break-inside: avoid;
  }

  /* Medaillon-Glyphe als Hero */
  .chap__glyph {
    order: 1;
    width: 38mm; height: 38mm;
    border-radius: 50%;
    border: 0.75px solid var(--hair);
    background: transparent !important;
    color: var(--gold) !important;
    font-size: 64px;
    margin: 0 0 12mm;
  }
  .chap__head-text { order: 2; }
  .chap__head .m-eyebrow {
    font-size: 11px; letter-spacing: 3px; color: var(--gold);
    margin-bottom: 10px;
  }
  .chap__title {
    font-size: 40px; line-height: 1.08; color: var(--ink);
    margin: 0; hyphens: none;
  }
  /* dezentes Dekor-Motiv unter dem Titel */
  .chap__cover-motif {
    order: 3; display: block;
    height: 26mm; width: auto; margin-top: 14mm;
    opacity: 0.7;
  }

  /* Kapiteltext beginnt auf der Seite NACH dem Deckblatt */
  .chap__card {
    break-before: page;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
}
</style>
