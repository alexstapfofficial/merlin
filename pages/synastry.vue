<template>
    <div class="synastry-container">
        <h1>Partnerhoroskop - Synastrie</h1>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <!-- Birth Data Input for both partners -->
        <div class="partners-input">
            <div class="partner-section">
                <h2>Person 1</h2>
                <div class="birth-form">
                    <UInput type="text" v-model="person1Name" placeholder="Name (optional)" class="mb-4" />
                    <BirthdayPicker @new-date="(n) => person1Birthdate = n" class="mb-4" />
                    <BirthTimeInput @new-time="(n) => person1Birthtime = n" class="mb-4" />
                    <LocationInput @new-coordinates="(n) => person1Coordinates = n" />
                </div>
            </div>

            <div class="partner-section">
                <h2>Person 2</h2>
                <div class="birth-form">
                    <UInput type="text" v-model="person2Name" placeholder="Name (optional)" class="mb-4" />
                    <BirthdayPicker @new-date="(n) => person2Birthdate = n" class="mb-4" />
                    <BirthTimeInput @new-time="(n) => person2Birthtime = n" class="mb-4" />
                    <LocationInput @new-coordinates="(n) => person2Coordinates = n" />
                </div>
            </div>
        </div>

        <div class="calculate-section">
            <UButton
                @click="calculateCompatibility"
                :disabled="!canCalculate || loading"
                size="lg"
            >
                {{ loading ? 'Berechne...' : 'Kompatibilität berechnen' }}
            </UButton>
        </div>

        <!-- Results Section -->
        <div v-if="synastryResult" class="results-section">
            <!-- Compatibility Score Overview -->
            <div class="score-overview">
                <div class="total-score" :style="{ borderColor: compatibilityLevel.color }">
                    <div class="score-number" :style="{ color: compatibilityLevel.color }">
                        {{ synastryResult.compatibilityScore.total }}
                    </div>
                    <div class="score-label">von 100 Punkten</div>
                    <div class="score-level" :style="{ color: compatibilityLevel.color }">
                        {{ compatibilityLevel.emoji }} {{ compatibilityLevel.level }}
                    </div>
                </div>

                <div class="score-stats">
                    <div class="stat-item">
                        <span class="stat-label">Aspekte insgesamt:</span>
                        <span class="stat-value">{{ synastryResult.compatibilityScore.aspectCount }}</span>
                    </div>
                    <div class="stat-item positive">
                        <span class="stat-label">Harmonisch:</span>
                        <span class="stat-value">{{ synastryResult.compatibilityScore.positiveAspects }}</span>
                    </div>
                    <div class="stat-item challenging">
                        <span class="stat-label">Herausfordernd:</span>
                        <span class="stat-value">{{ synastryResult.compatibilityScore.challengingAspects }}</span>
                    </div>
                </div>
            </div>

            <!-- Category Scores -->
            <div class="category-scores">
                <h3>Kompatibilität nach Bereichen</h3>
                <div class="categories-grid">
                    <div
                        v-for="(data, category) in synastryResult.compatibilityScore.categories"
                        :key="category"
                        class="category-card"
                    >
                        <div class="category-name">{{ getCategoryName(category) }}</div>
                        <div class="category-bar-container">
                            <div
                                class="category-bar"
                                :style="{ width: data.percentage + '%', backgroundColor: getCategoryColor(data.percentage) }"
                            ></div>
                        </div>
                        <div class="category-details">
                            <span class="category-percentage">{{ Math.round(data.percentage) }}%</span>
                            <span class="category-count">{{ data.count }} Aspekte</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interpretation Button -->
            <div class="interpretation-actions">
                <UButton
                    @click="interpretSynastry"
                    :disabled="interpretationLoading"
                    size="md"
                >
                    {{ interpretationLoading ? 'Interpretiere...' : 'Detaillierte Interpretation erstellen' }}
                </UButton>
            </div>

            <!-- AI Interpretation -->
            <div v-if="interpretation" class="interpretation-section">
                <h3>Detaillierte Synastrie-Interpretation</h3>
                <div class="interpretation-content" v-html="renderMarkdown(interpretation)"></div>
            </div>

            <!-- Aspects List -->
            <div class="aspects-section">
                <h3>Alle Aspekte ({{ synastryResult.synastryAspects.length }})</h3>

                <div class="aspects-grid">
                    <div
                        v-for="(aspect, index) in synastryResult.synastryAspects"
                        :key="index"
                        class="aspect-card"
                        :class="aspect.score > 0 ? 'positive' : 'challenging'"
                        :style="{ borderLeftColor: getAspectColor(aspect.aspect) }"
                    >
                        <div class="aspect-header">
                            <span class="planet-combo">
                                {{ translatePlanetName(aspect.person1Planet) }}
                                {{ getAspectSymbol(aspect.aspect) }}
                                {{ translatePlanetName(aspect.person2Planet) }}
                            </span>
                            <span class="aspect-score" :class="aspect.score > 0 ? 'positive' : 'negative'">
                                {{ aspect.score > 0 ? '+' : '' }}{{ aspect.score }}
                            </span>
                        </div>
                        <div class="aspect-details">
                            <div class="aspect-signs">
                                {{ translateZodiacName(aspect.person1PlanetSign) }}
                                {{ getAspectName(aspect.aspect) }}
                                {{ translateZodiacName(aspect.person2PlanetSign) }}
                            </div>
                            <div class="aspect-meta">
                                <span class="aspect-category">{{ getCategoryName(aspect.category) }}</span>
                                <span class="aspect-orb">Orbis: {{ aspect.orb.toFixed(2) }}°</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useBirthDataStore } from '~/stores/birthDataStore';
import { useSynastry } from '~/composables/useSynastry';
import { useTranslateZodiac } from '~/composables/translateZodiac';

const birthDataStore = useBirthDataStore();
const { calculateSynastry, getCompatibilityLevel, getCategoryName, getAspectColor } = useSynastry();
const { translatePlanetName, translateZodiacName } = useTranslateZodiac();

// Person 1 data
const person1Name = ref('');
const person1Birthdate = ref({});
const person1Birthtime = ref({});
const person1Coordinates = ref([]);

// Person 2 data
const person2Name = ref('');
const person2Birthdate = ref({});
const person2Birthtime = ref({});
const person2Coordinates = ref([]);

const synastryResult = ref(null);
const loading = ref(false);
const error = ref('');
const interpretation = ref('');
const interpretationLoading = ref(false);

const canCalculate = computed(() => {
    const person1Valid = person1Birthdate.value && Object.keys(person1Birthdate.value).length > 0 &&
                         person1Birthtime.value && Object.keys(person1Birthtime.value).length > 0 &&
                         person1Coordinates.value && person1Coordinates.value.length > 0;

    const person2Valid = person2Birthdate.value && Object.keys(person2Birthdate.value).length > 0 &&
                         person2Birthtime.value && Object.keys(person2Birthtime.value).length > 0 &&
                         person2Coordinates.value && person2Coordinates.value.length > 0;

    return person1Valid && person2Valid;
});

const compatibilityLevel = computed(() => {
    if (!synastryResult.value) return { level: '', color: '#757575', emoji: '' };
    return getCompatibilityLevel(synastryResult.value.compatibilityScore.total);
});

const calculateCompatibility = async () => {
    if (!canCalculate.value) {
        error.value = 'Bitte füllen Sie die Geburtsdaten für beide Partner aus.';
        return;
    }

    loading.value = true;
    error.value = '';
    interpretation.value = '';

    try {
        const person1Data = {
            birthdate: person1Birthdate.value,
            birthtime: person1Birthtime.value,
            coordinates: person1Coordinates.value
        };

        const person2Data = {
            birthdate: person2Birthdate.value,
            birthtime: person2Birthtime.value,
            coordinates: person2Coordinates.value
        };

        const result = await calculateSynastry(person1Data, person2Data);
        synastryResult.value = result;
    } catch (err) {
        console.error('Fehler beim Berechnen der Synastrie:', err);
        error.value = 'Fehler beim Berechnen der Kompatibilität. Bitte versuchen Sie es erneut.';
    } finally {
        loading.value = false;
    }
};

const interpretSynastry = async () => {
    if (!synastryResult.value) return;

    interpretationLoading.value = true;

    try {
        const response = await $fetch('/api/interpret-synastry', {
            method: 'POST',
            body: {
                aspects: synastryResult.value.synastryAspects,
                compatibilityScore: synastryResult.value.compatibilityScore
            }
        });

        interpretation.value = response.interpretation;
    } catch (err) {
        console.error('Fehler beim Interpretieren der Synastrie:', err);
        error.value = 'Fehler beim Erstellen der Interpretation. Bitte versuchen Sie es erneut.';
    } finally {
        interpretationLoading.value = false;
    }
};

const renderMarkdown = (markdown) => {
    if (!markdown) return '';

    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
};

const getAspectSymbol = (aspect) => {
    const symbols = {
        conjunction: '☌',
        sextile: '⚹',
        square: '□',
        trine: '△',
        opposition: '☍'
    };
    return symbols[aspect] || aspect;
};

const getAspectName = (aspect) => {
    const names = {
        conjunction: 'Konjunktion',
        sextile: 'Sextil',
        square: 'Quadrat',
        trine: 'Trigon',
        opposition: 'Opposition'
    };
    return names[aspect] || aspect;
};

const getCategoryColor = (percentage) => {
    if (percentage >= 70) return '#4caf50';
    if (percentage >= 60) return '#8bc34a';
    if (percentage >= 50) return '#ffc107';
    if (percentage >= 40) return '#ff9800';
    return '#f44336';
};
</script>

<style scoped>
.synastry-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #555;
}

h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #666;
}

.error-message {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.partners-input {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

@media (max-width: 768px) {
    .partners-input {
        grid-template-columns: 1fr;
    }
}

.partner-section {
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
}

.calculate-section {
    text-align: center;
    margin: 2rem 0;
}

.results-section {
    margin-top: 3rem;
}

.score-overview {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
}

.total-score {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 12px;
    border: 4px solid;
    min-width: 200px;
}

.score-number {
    font-size: 4rem;
    font-weight: bold;
    line-height: 1;
}

.score-label {
    font-size: 0.9rem;
    color: #666;
    margin: 0.5rem 0;
}

.score-level {
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 1rem;
}

.score-stats {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
}

.stat-item.positive {
    border-left: 4px solid #4caf50;
}

.stat-item.challenging {
    border-left: 4px solid #ff9800;
}

.stat-label {
    font-weight: 500;
    color: #666;
}

.stat-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #333;
}

.category-scores {
    margin-bottom: 3rem;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.category-card {
    padding: 1.5rem;
    background-color: white;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
}

.category-name {
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
}

.category-bar-container {
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.category-bar {
    height: 100%;
    transition: width 0.5s ease;
    border-radius: 10px;
}

.category-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
}

.category-percentage {
    font-weight: 600;
    color: #333;
}

.category-count {
    color: #666;
}

.interpretation-actions {
    text-align: center;
    margin: 2rem 0;
}

.interpretation-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background-color: #f0f7ff;
    border: 2px solid #90caf9;
    border-radius: 8px;
}

.interpretation-content {
    line-height: 1.8;
    color: #333;
}

.interpretation-content h2 {
    color: #1976d2;
    margin-top: 1.5rem;
}

.interpretation-content strong {
    color: #1976d2;
}

.aspects-section {
    margin-top: 3rem;
}

.aspects-grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

.aspect-card {
    padding: 1rem;
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    border-left: 4px solid;
    transition: transform 0.2s, box-shadow 0.2s;
}

.aspect-card:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.aspect-card.positive {
    background-color: #f1f8f4;
}

.aspect-card.challenging {
    background-color: #fff8f0;
}

.aspect-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.planet-combo {
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
}

.aspect-score {
    font-size: 1.2rem;
    font-weight: bold;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
}

.aspect-score.positive {
    background-color: #c8e6c9;
    color: #2e7d32;
}

.aspect-score.negative {
    background-color: #ffccbc;
    color: #d84315;
}

.aspect-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.aspect-signs {
    color: #666;
    font-size: 0.95rem;
}

.aspect-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #999;
}

.aspect-category {
    font-weight: 500;
    color: #666;
}

.aspect-orb {
    color: #999;
}
</style>
