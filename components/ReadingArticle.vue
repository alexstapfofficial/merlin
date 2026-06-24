<template>
  <article class="ra">
    <!-- Ladezustand: animierter Sternenhimmel -->
    <div v-if="loading" class="ra__loading">
      <div class="ra__loading-orb" />
      <div class="ra__loading-text m-mono">Merlin liest deinen Himmel…</div>
      <div class="ra__loading-sub m-mono">Das kann einen Moment dauern.</div>
    </div>

    <div v-else-if="error" class="ra__error m-mono">{{ error }}</div>

    <!-- content: unser eigenes, HTML-escaptes Markdown -->
    <div v-else-if="markdown" class="ra__prose" v-html="html" />
  </article>
</template>

<script setup>
import { renderMarkdown } from '~/composables/useMarkdown';

const props = defineProps({
  markdown: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const html = computed(() => renderMarkdown(props.markdown));
</script>

<style scoped>
.ra { color: var(--ink); }

/* ─── Ladezustand ──────────────────────────────────────────────────────── */
.ra__loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 64px 0;
}
.ra__loading-orb {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--ink);
  box-shadow: inset -16px -6px 0 0 var(--gold-light);
  animation: ra-spin 3.4s linear infinite;
}
@keyframes ra-spin { to { transform: rotate(360deg); } }
.ra__loading-text { margin-top: 18px; font-size: 12.5px; color: var(--ink-2); letter-spacing: 0.4px; }
.ra__loading-sub { margin-top: 4px; font-size: 10.5px; color: var(--muted); }

.ra__error { font-size: 12.5px; color: #b3402f; padding: 24px 0; text-align: center; }

/* ─── Langform-Prosa ───────────────────────────────────────────────────── */
.ra__prose { font-size: 15px; line-height: 1.72; color: var(--ink-2); }

/* Abschnittsüberschriften mit goldenem Sternen-Akzent + feiner Trennlinie */
.ra__prose :deep(h2) {
  font-family: var(--display);
  font-size: 22px; line-height: 1.2; color: var(--ink);
  margin: 36px 0 14px;
  padding-top: 22px;
  border-top: 0.5px solid var(--line);
  position: relative;
}
.ra__prose :deep(h2)::before {
  content: "✦";
  display: block;
  font-size: 13px; color: var(--gold);
  margin-bottom: 8px;
}
.ra__prose :deep(h2:first-child) {
  margin-top: 0; padding-top: 0; border-top: none;
}

.ra__prose :deep(h3) {
  font-family: var(--display); font-size: 17px; color: var(--ink);
  margin: 22px 0 8px;
}

.ra__prose :deep(p) { margin: 0 0 14px; }
.ra__prose :deep(p:last-child) { margin-bottom: 0; }

.ra__prose :deep(strong) { color: var(--ink); font-weight: 600; }
.ra__prose :deep(em) { font-style: italic; }

/* Kernsatz: ganze Zeile fett → goldenes Pull-Quote */
.ra__prose :deep(.md-key) {
  font-family: var(--display);
  font-size: 19px; line-height: 1.34;
  color: var(--ink);
  padding: 2px 0 2px 16px;
  margin: 20px 0;
  border-left: 2px solid var(--gold);
}

/* Reflexionsfrage („Zum Nachspüren: …") → sanfter Callout */
.ra__prose :deep(.md-reflect) {
  font-style: italic;
  color: var(--ink-2);
  background: rgba(176, 122, 44, 0.07);
  border: 0.5px solid rgba(176, 122, 44, 0.16);
  border-radius: 12px;
  padding: 12px 14px;
  margin: 20px 0 0;
  font-size: 13.5px; line-height: 1.55;
}

/* Listen: ungeordnet mit goldenem Punkt, nummeriert mit goldener Zahl */
.ra__prose :deep(ul),
.ra__prose :deep(ol) {
  margin: 4px 0 16px; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 8px;
  counter-reset: ra-item;
}
.ra__prose :deep(li) {
  position: relative; padding-left: 22px; line-height: 1.55;
}
.ra__prose :deep(ul li)::before {
  content: "";
  position: absolute; left: 4px; top: 9px;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--gold);
}
.ra__prose :deep(ol li) { counter-increment: ra-item; }
.ra__prose :deep(ol li)::before {
  content: counter(ra-item) ".";
  position: absolute; left: 0; top: 1px;
  font-family: var(--mono); font-size: 12px; font-weight: 600;
  color: var(--gold);
}

/* ─── Druck/PDF: dichter & kompakter setzen (übersteuert die Schirm-Werte
   oben – gleiche scoped-Spezifität, später in der Quelle = gewinnt) ─────── */
@media print {
  /* größere, gut lesbare Grundschrift */
  .ra__prose { font-size: 13.5pt; line-height: 1.6; color: var(--ink-2); }
  .ra__prose :deep(p) { margin: 0 0 12px; }

  /* Überschriften deutlich abgesetzt: größer, dunkler, mehr Luft davor */
  .ra__prose :deep(h2) {
    font-size: 19pt; line-height: 1.15; color: var(--ink);
    margin: 26px 0 13px; padding-top: 15px;
  }
  .ra__prose :deep(h2:first-child) { margin-top: 0; padding-top: 0; }
  .ra__prose :deep(h2)::before { font-size: 12pt; margin-bottom: 6px; }
  .ra__prose :deep(h3) {
    font-size: 15.5pt; color: var(--ink); margin: 18px 0 6px;
  }

  .ra__prose :deep(.md-key) { font-size: 16pt; line-height: 1.32; margin: 14px 0; }

  /* Callout ohne Hintergrundfarbe → nur feiner Rahmen */
  .ra__prose :deep(.md-reflect) {
    background: transparent !important;
    margin-top: 12px; padding: 10px 12px; font-size: 12.5pt;
  }
  .ra__prose :deep(ul),
  .ra__prose :deep(ol) { gap: 7px; margin: 4px 0 11px; }
}
</style>
