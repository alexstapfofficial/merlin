<template>
  <main class="impressum">
    <h1 class="impressum__title">Impressum</h1>

    <section class="impressum__block">
      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        <!-- TODO: echte Anbieterangaben einsetzen -->
        [Name / Firma]<br />
        [Straße Nr.]<br />
        [PLZ Ort]
      </p>
    </section>

    <section class="impressum__block">
      <h2>Kontakt</h2>
      <p>E-Mail: [kontakt@example.com]</p>
    </section>

    <NuxtLink to="/" class="impressum__back">← Zurück</NuxtLink>
  </main>
</template>

<script setup>
useHead({ title: 'Impressum' });
</script>

<style scoped>
.impressum { max-width: 640px; margin: 0 auto; padding: 48px 24px; }
.impressum__title { font-size: 32px; font-weight: 700; }
.impressum__block { margin-top: 28px; }
.impressum__block h2 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.impressum__block p { line-height: 1.6; color: var(--ink-2, #5A554A); }
.impressum__back { display: inline-block; margin-top: 40px; font-size: 14px; text-decoration: underline; }
</style>
