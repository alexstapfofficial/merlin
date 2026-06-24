<template>
  <div class="noprofile">
    <div class="m-glyph noprofile__glyph">R</div>
    <div class="m-display noprofile__title">Noch kein Himmel</div>
    <p class="noprofile__text">Lege zuerst deine Geburtsdaten an, dann berechnen wir deinen Himmel.</p>
    <NuxtLink to="/onboarding" class="m-pill noprofile__cta">Geburtsdaten anlegen</NuxtLink>
  </div>
</template>

<script setup>
defineProps({ label: { type: String, default: '' } });
</script>

<style scoped>
.noprofile {
  margin: 24px 22px; padding: 32px 22px; text-align: center;
  background: var(--card); border: 0.5px solid var(--line); border-radius: 18px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.noprofile__glyph { font-size: 52px; color: var(--ink); }
.noprofile__title { font-size: 22px; margin-top: 6px; }
.noprofile__text { font-size: 13px; color: var(--ink-2); line-height: 1.5; margin: 4px 8px 8px; }
.noprofile__cta { margin-top: 6px; text-decoration: none; }
</style>
