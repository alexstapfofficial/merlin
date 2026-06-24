<template>
  <div class="m-screen">
    <div class="m-screen__inner" style="padding-left:0;padding-right:0">
      <div style="padding:10px 22px 4px">
        <div class="m-eyebrow">Lernen</div>
        <div class="m-display" style="font-size:34px;margin-top:6px">Wiki</div>
        <p class="wk__lede">
          Das astrologische Einmaleins – verständlich erklärt. Alle Zeichen,
          Elemente, Häuser, Aspekte und Planeten an einem Ort.
        </p>
      </div>

      <!-- categories -->
      <div class="m-eyebrow" style="padding:20px 26px 8px">Kategorien</div>
      <div class="wk__grid">
        <NuxtLink
          v-for="c in categories" :key="c.id"
          :to="`/wiki/${c.id}`" class="wk__tile"
        >
          <span
            class="wk__tile-glyph"
            :class="{ astro: c.glyphKind === 'astro' }"
            :style="{ color: c.accent, opacity: 0.16 }"
          >{{ c.glyph }}</span>
          <div class="m-eyebrow">{{ c.count }} Einträge</div>
          <div class="m-display wk__tile-title">{{ c.title }}</div>
          <div class="wk__tile-sub">{{ c.eyebrow }}</div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'app' })

import { useWiki } from '~/composables/useWiki';

const { categories } = useWiki();
</script>

<style scoped>
.wk__lede {
  font-size: 14px; line-height: 1.5; color: var(--ink-2);
  margin-top: 10px; max-width: 34ch;
}

.wk__grid { padding: 0 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.wk__tile {
  padding: 14px 14px 16px; border-radius: 16px; background: var(--card);
  border: 0.5px solid var(--line); position: relative; overflow: hidden; min-height: 116px;
  text-decoration: none; color: var(--ink); display: block;
  transition: transform 0.16s ease;
}
.wk__tile:active { transform: scale(0.98); }
.wk__tile-glyph {
  position: absolute; top: -6px; right: -2px; font-family: serif; font-size: 70px; line-height: 1;
}
.wk__tile-glyph.astro { font-family: var(--astro); }
.wk__tile-title { font-size: 20px; margin-top: 4px; position: relative; }
.wk__tile-sub { font-size: 11px; color: var(--muted); margin-top: 3px; letter-spacing: 0.2px; position: relative; }
</style>
