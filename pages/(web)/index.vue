<template>
  <main class="landing">
    <section class="landing__hero">
      <p class="landing__eyebrow">Dein persönliches Horoskop</p>
      <h1 class="landing__title">
        Der Himmel,<br />für dich gelesen.
      </h1>
      <p class="landing__lead">
        Tagesimpulse, dein Geburtshoroskop und tiefe Deutungen –
        psychologisch fundiert, jeden Tag neu. Verfügbar als App.
      </p>

      <div class="landing__cta">
        <UButton size="xl" color="primary" disabled>
          Bald im App Store
        </UButton>
        <NuxtLink to="/impressum" class="landing__link">Impressum</NuxtLink>
      </div>
    </section>
  </main>
</template>

<script setup>
useHead({ title: 'Horoskop – Der Himmel, für dich gelesen' });
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.landing__hero { max-width: 640px; text-align: center; }
.landing__eyebrow {
  font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted, #8F8978);
}
.landing__title {
  font-size: clamp(36px, 7vw, 64px);
  line-height: 1.05; margin-top: 12px; font-weight: 700;
}
.landing__lead {
  font-size: 17px; line-height: 1.6; margin-top: 18px;
  color: var(--ink-2, #5A554A);
}
.landing__cta {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  margin-top: 32px;
}
.landing__link { font-size: 13px; color: var(--muted, #8F8978); text-decoration: underline; }
</style>
