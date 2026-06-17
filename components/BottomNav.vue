<template>
  <nav class="bottom-nav">
    <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
      <UIcon name="i-heroicons-user-circle" class="nav-icon" />
      <span class="nav-label">Profil</span>
    </NuxtLink>
    <NuxtLink to="/horoscopes" class="nav-link" :class="{ active: route.path === '/horoscope' }">
      <UIcon name="i-heroicons-sparkles" class="nav-icon" />
      <span class="nav-label">Horoskop</span>
    </NuxtLink>
    <NuxtLink to="/synastry" class="nav-link" :class="{ active: route.path === '/partner' }">
      <UIcon name="i-heroicons-heart" class="nav-icon" />
      <span class="nav-label">Partner</span>
    </NuxtLink>
    <NuxtLink to="/wiki" class="nav-link" :class="{ active: route.path === '/wiki' }">
      <UIcon name="i-heroicons-book-open" class="nav-icon" />
      <span class="nav-label">Wiki</span>
    </NuxtLink>
  </nav>
</template>

<script setup>
const route = useRoute();
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1F1D20;
  border-top: 2px solid #4D4845;
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
  z-index: 100;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  min-width: 70px;
  color: #7B7369;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #F5ECDC;
  transform: translateY(-2px);
}

.nav-link.active {
  color: #F5ECDC;
}

.nav-link.active .nav-icon {
  color: #F5ECDC;
}

.nav-icon {
  font-size: 1.5rem;
  transition: all 0.2s;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .nav-icon {
    font-size: 1.35rem;
  }

  .nav-label {
    font-size: 0.65rem;
  }
}
</style>
