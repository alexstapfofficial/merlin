<template>
  <nav class="m-tabbar">
    <template v-for="tab in tabs" :key="tab.to">
      <!-- hervorgehobener Mittel-Tab -->
      <NuxtLink
        v-if="tab.center"
        :to="tab.to"
        class="m-tab m-tab--center"
        :class="{ active: isActive(tab) }"
        :aria-label="tab.label"
      >
        <span class="m-tab__fab">
          <UIcon :name="tab.icon" class="m-tab__fab-icon" />
        </span>
        <span class="m-tab__label m-tab__label--center">{{ tab.label }}</span>
      </NuxtLink>

      <!-- Standard-Tab -->
      <NuxtLink
        v-else
        :to="tab.to"
        class="m-tab"
        :class="{ active: isActive(tab) }"
      >
        <span v-if="isActive(tab)" class="m-tab__dot" />
        <UIcon :name="tab.icon" class="m-tab__icon" />
        <span class="m-tab__label">{{ tab.label }}</span>
      </NuxtLink>
    </template>
  </nav>
</template>

<script setup>
const route = useRoute();

const tabs = [
  { to: '/',           label: 'Heute',     icon: 'i-heroicons-home',      match: ['/'] },
  { to: '/himmel',     label: 'Himmel',    icon: 'i-heroicons-star',      match: ['/himmel'] },
  { to: '/deutungen',  label: 'Deutungen', icon: 'i-heroicons-sparkles',  match: ['/deutungen'], center: true },
  // Synastrie/Kreis vorerst aus dem Menü genommen — Seiten & Komponenten bleiben erhalten.
  { to: '/wiki',       label: 'Wiki',   icon: 'i-heroicons-book-open', match: ['/wiki'] },
  { to: '/onboarding', label: 'Profil', icon: 'i-heroicons-user',      match: ['/onboarding', '/profile'] },
];

const isActive = (tab) => {
  if (tab.to === '/') return route.path === '/';
  return tab.match.some((m) => route.path === m || route.path.startsWith(m + '/'));
};
</script>

<style scoped>
.m-tabbar {
  position: fixed;
  left: 14px;
  right: 14px;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  height: 62px;
  max-width: 452px;
  margin: 0 auto;
  border-radius: 22px;
  background: rgba(251, 246, 232, 0.92);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 0.5px solid rgba(26, 24, 20, 0.08);
  box-shadow: 0 10px 30px rgba(80, 60, 30, 0.10);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.m-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  text-decoration: none;
  color: rgba(26, 24, 20, 0.45);
  transition: color 0.2s;
}

.m-tab.active {
  color: var(--ink);
}

.m-tab__dot {
  position: absolute;
  top: -2px;
  width: 4px;
  height: 4px;
  border-radius: 4px;
  background: var(--gold);
}

.m-tab__icon {
  width: 22px;
  height: 22px;
}

.m-tab__label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
}

/* ─── hervorgehobener Mittel-Tab ──────────────────────────────────────── */
.m-tab--center {
  margin-top: -34px;
  gap: 5px;
  color: var(--ink);
}
.m-tab__fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--gold-light);
  border: 3px solid rgba(251, 246, 232, 0.92);
  box-shadow: 0 8px 20px rgba(80, 60, 30, 0.28);
  transition: transform 0.2s;
}
.m-tab--center:active .m-tab__fab { transform: scale(0.94); }
.m-tab--center.active .m-tab__fab {
  box-shadow: 0 8px 22px rgba(176, 122, 44, 0.45);
}
.m-tab__fab-icon { width: 26px; height: 26px; }
.m-tab__label--center { font-size: 10.5px; }
</style>
