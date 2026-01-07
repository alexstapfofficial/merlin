<template>
  <div class="horoscopes-page">
    <div class="page-header">
      <h1>Horoskope</h1>
      <p>Wähle eine Horoskop-Art aus</p>
    </div>

    <div class="horoscope-cards">
      <NuxtLink to="/horoscope" class="horoscope-card">
        <div class="card-icon">🌟</div>
        <h3>Geburtshoroskop</h3>
        <p>Dein persönliches Radix-Horoskop</p>
      </NuxtLink>

      <NuxtLink to="/transits" class="horoscope-card">
        <div class="card-icon">📅</div>
        <h3>Tageshoroskop</h3>
        <p>Aktuelle planetare Transite</p>
      </NuxtLink>

      <NuxtLink to="/synastry" class="horoscope-card">
        <div class="card-icon">💕</div>
        <h3>Partnerhoroskop</h3>
        <p>Synastrie und Kompatibilität</p>
      </NuxtLink>

      <NuxtLink to="/personality" class="horoscope-card">
        <div class="card-icon">👤</div>
        <h3>Persönlichkeit</h3>
        <p>Astrologische Deutung</p>
      </NuxtLink>

      <NuxtLink to="/overview" class="horoscope-card">
        <div class="card-icon">📊</div>
        <h3>Übersicht</h3>
        <p>Vollständige Analyse</p>
      </NuxtLink>
    </div>

    <!-- App-Style Bottom Navigation -->
    <nav class="bottom-nav">
      <NuxtLink to="/" class="nav-item">
        <Icon name="i-heroicons-home" class="nav-icon" />
        <span class="nav-label">Home</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item">
        <Icon name="i-heroicons-user-circle" class="nav-icon" />
        <span class="nav-label">Profil</span>
      </NuxtLink>

      <NuxtLink to="/horoscopes" class="nav-item active">
        <Icon name="i-heroicons-star" class="nav-icon" />
        <span class="nav-label">Horoskope</span>
      </NuxtLink>

      <NuxtLink to="/wiki" class="nav-item">
        <Icon name="i-heroicons-book-open" class="nav-icon" />
        <span class="nav-label">Wiki</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
</script>

<style scoped>
.horoscopes-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem 100px;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.horoscope-cards {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.horoscope-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.horoscope-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.horoscope-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.horoscope-card p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: #666;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  min-width: 70px;
}

.nav-item.active {
  color: #667eea;
}

.nav-item:hover {
  color: #667eea;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .horoscope-cards {
    grid-template-columns: 1fr;
  }
}
</style>
