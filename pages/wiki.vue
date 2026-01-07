<template>
  <div class="wiki-page">
    <div class="page-header">
      <h1>Astrologie Wiki</h1>
      <p>Lerne mehr über astrologische Konzepte</p>
    </div>

    <div class="wiki-content">
      <UInput
        v-model="searchQuery"
        placeholder="Suche nach Planeten, Zeichen, Aspekten..."
        size="lg"
        icon="i-heroicons-magnifying-glass"
        class="search-input"
      />

      <div class="wiki-sections">
        <!-- Planeten -->
        <div class="wiki-section">
          <h2 @click="toggleSection('planets')" class="section-header">
            <Icon :name="expandedSections.planets ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" />
            Planeten
          </h2>
          <div v-show="expandedSections.planets" class="section-content">
            <div v-for="planet in filteredPlanets" :key="planet.name" class="wiki-item">
              <h3>{{ planet.symbol }} {{ planet.name }}</h3>
              <p>{{ planet.description }}</p>
              <div class="keywords">
                <span v-for="keyword in planet.keywords" :key="keyword" class="keyword-tag">
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sternzeichen -->
        <div class="wiki-section">
          <h2 @click="toggleSection('signs')" class="section-header">
            <Icon :name="expandedSections.signs ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" />
            Sternzeichen
          </h2>
          <div v-show="expandedSections.signs" class="section-content">
            <div v-for="sign in filteredSigns" :key="sign.name" class="wiki-item">
              <h3>{{ sign.symbol }} {{ sign.name }}</h3>
              <p><strong>Element:</strong> {{ sign.element }} | <strong>Qualität:</strong> {{ sign.quality }}</p>
              <p>{{ sign.description }}</p>
            </div>
          </div>
        </div>

        <!-- Aspekte -->
        <div class="wiki-section">
          <h2 @click="toggleSection('aspects')" class="section-header">
            <Icon :name="expandedSections.aspects ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" />
            Aspekte
          </h2>
          <div v-show="expandedSections.aspects" class="section-content">
            <div v-for="aspect in filteredAspects" :key="aspect.name" class="wiki-item">
              <h3>{{ aspect.symbol }} {{ aspect.name }}</h3>
              <p><strong>Winkel:</strong> {{ aspect.angle }}° | <strong>Natur:</strong> {{ aspect.nature }}</p>
              <p>{{ aspect.description }}</p>
            </div>
          </div>
        </div>

        <!-- Häuser -->
        <div class="wiki-section">
          <h2 @click="toggleSection('houses')" class="section-header">
            <Icon :name="expandedSections.houses ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" />
            Häuser
          </h2>
          <div v-show="expandedSections.houses" class="section-content">
            <div v-for="house in filteredHouses" :key="house.number" class="wiki-item">
              <h3>{{ house.number }}. Haus</h3>
              <p><strong>Thema:</strong> {{ house.theme }}</p>
              <p>{{ house.description }}</p>
            </div>
          </div>
        </div>
      </div>
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

      <NuxtLink to="/horoscopes" class="nav-item">
        <Icon name="i-heroicons-star" class="nav-icon" />
        <span class="nav-label">Horoskope</span>
      </NuxtLink>

      <NuxtLink to="/wiki" class="nav-item active">
        <Icon name="i-heroicons-book-open" class="nav-icon" />
        <span class="nav-label">Wiki</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
const searchQuery = ref('');
const expandedSections = ref({
  planets: true,
  signs: false,
  aspects: false,
  houses: false
});

const planets = [
  {
    name: 'Sonne',
    symbol: '☉',
    description: 'Repräsentiert das Selbst, Identität, Vitalität und den bewussten Willen.',
    keywords: ['Identität', 'Vitalität', 'Selbstausdruck', 'Kreativität']
  },
  {
    name: 'Mond',
    symbol: '☽',
    description: 'Steht für Emotionen, Instinkte, das Unbewusste und die Gefühlswelt.',
    keywords: ['Emotionen', 'Intuition', 'Mutter', 'Gewohnheiten']
  },
  {
    name: 'Merkur',
    symbol: '☿',
    description: 'Der Planet der Kommunikation, des Denkens und der Informationsverarbeitung.',
    keywords: ['Kommunikation', 'Denken', 'Lernen', 'Austausch']
  },
  {
    name: 'Venus',
    symbol: '♀',
    description: 'Repräsentiert Liebe, Schönheit, Harmonie und materielle Werte.',
    keywords: ['Liebe', 'Harmonie', 'Ästhetik', 'Werte']
  },
  {
    name: 'Mars',
    symbol: '♂',
    description: 'Der Krieger-Planet, steht für Energie, Durchsetzung und Handeln.',
    keywords: ['Energie', 'Aktion', 'Durchsetzung', 'Mut']
  },
  {
    name: 'Jupiter',
    symbol: '♃',
    description: 'Planet des Wachstums, der Expansion und des Glücks.',
    keywords: ['Expansion', 'Glück', 'Wachstum', 'Philosophie']
  },
  {
    name: 'Saturn',
    symbol: '♄',
    description: 'Repräsentiert Struktur, Disziplin, Grenzen und Verantwortung.',
    keywords: ['Struktur', 'Disziplin', 'Grenzen', 'Verantwortung']
  },
  {
    name: 'Uranus',
    symbol: '♅',
    description: 'Planet der Revolution, Originalität und plötzlicher Veränderungen.',
    keywords: ['Revolution', 'Originalität', 'Veränderung', 'Freiheit']
  },
  {
    name: 'Neptun',
    symbol: '♆',
    description: 'Steht für Träume, Spiritualität, Illusion und das Transzendente.',
    keywords: ['Spiritualität', 'Träume', 'Illusion', 'Mitgefühl']
  },
  {
    name: 'Pluto',
    symbol: '♇',
    description: 'Repräsentiert Transformation, Macht und tiefgreifende Wandlung.',
    keywords: ['Transformation', 'Macht', 'Erneuerung', 'Intensität']
  }
];

const signs = [
  { name: 'Widder', symbol: '♈', element: 'Feuer', quality: 'Kardinal', description: 'Pioniergeist, Mut, Durchsetzungskraft' },
  { name: 'Stier', symbol: '♉', element: 'Erde', quality: 'Fix', description: 'Stabilität, Sinnlichkeit, Beständigkeit' },
  { name: 'Zwillinge', symbol: '♊', element: 'Luft', quality: 'Veränderlich', description: 'Kommunikation, Vielseitigkeit, Neugier' },
  { name: 'Krebs', symbol: '♋', element: 'Wasser', quality: 'Kardinal', description: 'Emotionalität, Fürsorge, Sensibilität' },
  { name: 'Löwe', symbol: '♌', element: 'Feuer', quality: 'Fix', description: 'Selbstausdruck, Großzügigkeit, Kreativität' },
  { name: 'Jungfrau', symbol: '♍', element: 'Erde', quality: 'Veränderlich', description: 'Analyse, Perfektionismus, Dienst' },
  { name: 'Waage', symbol: '♎', element: 'Luft', quality: 'Kardinal', description: 'Harmonie, Partnerschaft, Ästhetik' },
  { name: 'Skorpion', symbol: '♏', element: 'Wasser', quality: 'Fix', description: 'Intensität, Transformation, Tiefe' },
  { name: 'Schütze', symbol: '♐', element: 'Feuer', quality: 'Veränderlich', description: 'Expansion, Philosophie, Optimismus' },
  { name: 'Steinbock', symbol: '♑', element: 'Erde', quality: 'Kardinal', description: 'Ambition, Struktur, Verantwortung' },
  { name: 'Wassermann', symbol: '♒', element: 'Luft', quality: 'Fix', description: 'Innovation, Freiheit, Gemeinschaft' },
  { name: 'Fische', symbol: '♓', element: 'Wasser', quality: 'Veränderlich', description: 'Spiritualität, Mitgefühl, Transzendenz' }
];

const aspects = [
  { name: 'Konjunktion', symbol: '☌', angle: 0, nature: 'Neutral/Intensivierend', description: 'Vereinigung von Energien, starke Betonung' },
  { name: 'Sextil', symbol: '⚹', angle: 60, nature: 'Harmonisch', description: 'Chancen, leichte Harmonie, Talente' },
  { name: 'Quadrat', symbol: '□', angle: 90, nature: 'Spannungsaspekt', description: 'Herausforderung, Spannung, Wachstum durch Konflikt' },
  { name: 'Trigon', symbol: '△', angle: 120, nature: 'Harmonisch', description: 'Natürliche Talente, Leichtigkeit, Flow' },
  { name: 'Opposition', symbol: '☍', angle: 180, nature: 'Spannungsaspekt', description: 'Polarität, Bewusstwerdung, Balance finden' }
];

const houses = [
  { number: 1, theme: 'Selbst & Persönlichkeit', description: 'Wie du dich der Welt präsentierst, deine Persönlichkeit' },
  { number: 2, theme: 'Werte & Besitz', description: 'Materielle Werte, Ressourcen, Selbstwert' },
  { number: 3, theme: 'Kommunikation & Lernen', description: 'Geschwister, kurze Reisen, alltägliche Kommunikation' },
  { number: 4, theme: 'Heim & Familie', description: 'Wurzeln, Familie, emotionale Sicherheit' },
  { number: 5, theme: 'Kreativität & Vergnügen', description: 'Selbstausdruck, Kinder, Romantik, Hobbies' },
  { number: 6, theme: 'Arbeit & Gesundheit', description: 'Alltag, Pflichten, Gesundheitsroutinen' },
  { number: 7, theme: 'Partnerschaft', description: 'Ehe, enge Beziehungen, Verträge' },
  { number: 8, theme: 'Transformation & Intimität', description: 'Gemeinsame Ressourcen, Sexualität, Wandlung' },
  { number: 9, theme: 'Philosophie & Expansion', description: 'Höhere Bildung, Reisen, Weltanschauung' },
  { number: 10, theme: 'Berufung & Status', description: 'Karriere, öffentliches Ansehen, Lebensziel' },
  { number: 11, theme: 'Freundschaft & Ideale', description: 'Gruppen, soziale Netzwerke, Hoffnungen' },
  { number: 12, theme: 'Spiritualität & Unbewusstes', description: 'Spiritualität, Rückzug, verborgene Themen' }
];

const filteredPlanets = computed(() => {
  if (!searchQuery.value) return planets;
  const query = searchQuery.value.toLowerCase();
  return planets.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.keywords.some(k => k.toLowerCase().includes(query))
  );
});

const filteredSigns = computed(() => {
  if (!searchQuery.value) return signs;
  const query = searchQuery.value.toLowerCase();
  return signs.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.element.toLowerCase().includes(query)
  );
});

const filteredAspects = computed(() => {
  if (!searchQuery.value) return aspects;
  const query = searchQuery.value.toLowerCase();
  return aspects.filter(a => a.name.toLowerCase().includes(query));
});

const filteredHouses = computed(() => {
  if (!searchQuery.value) return houses;
  const query = searchQuery.value.toLowerCase();
  return houses.filter(h =>
    h.theme.toLowerCase().includes(query) ||
    h.description.toLowerCase().includes(query)
  );
});

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};
</script>

<style scoped>
.wiki-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem 100px;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
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

.wiki-content {
  max-width: 900px;
  margin: 0 auto;
}

.search-input {
  margin-bottom: 2rem;
}

.wiki-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wiki-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.section-header:hover {
  background-color: #f9f9f9;
}

.section-content {
  padding: 0 1.5rem 1.5rem;
}

.wiki-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}

.wiki-item:last-child {
  border-bottom: none;
}

.wiki-item h3 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.wiki-item p {
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.keyword-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
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
}
</style>
