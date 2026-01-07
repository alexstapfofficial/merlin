<template>
    <div class="transits-container">
        <h1>Tageshoroskop - Transite</h1>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <!-- Profile Selection -->
        <div class="profile-selector">
            <label for="profile-select">Profil auswählen:</label>
            <USelect
                v-model="selectedProfileId"
                :options="profileOptions"
                placeholder="Wähle ein Profil"
                size="lg"
                @change="onProfileChange"
            />
            <NuxtLink to="/" v-if="profileOptions.length === 0">
                <UButton size="sm" variant="outline">Profile erstellen</UButton>
            </NuxtLink>
        </div>

        <div v-if="selectedProfile" class="transits-content">
            <div class="selected-profile-info">
                <h3>{{ selectedProfile.name }}</h3>
                <p>{{ formatBirthDate(selectedProfile.birthdate) }} um {{ formatBirthTime(selectedProfile.birthtime) }} Uhr</p>
            </div>

            <div class="date-selector">
                <label for="transit-date">Datum für Transite:</label>
                <input
                    type="date"
                    id="transit-date"
                    v-model="selectedDate"
                    @change="loadTransits"
                />
                <UButton @click="setToday" size="sm">Heute</UButton>
            </div>

            <div v-if="loading" class="loading">
                Transite werden berechnet...
            </div>

            <div v-else-if="transits && transits.length > 0" class="transits-list">
                <h2>Aktive Transite am {{ formattedDate }}</h2>

                <div class="transit-info">
                    <p>Gefunden: {{ transits.length }} Transit-Aspekte</p>
                    <UButton @click="interpretTransits" :disabled="interpretationLoading" size="sm">
                        {{ interpretationLoading ? 'Interpretiere...' : 'Transite interpretieren' }}
                    </UButton>
                </div>

                <div v-if="interpretation" class="interpretation-section">
                    <h3>Interpretation</h3>
                    <div class="interpretation-content" v-html="renderMarkdown(interpretation)"></div>
                </div>

                <div class="aspects-grid">
                    <div
                        v-for="(transit, index) in transits"
                        :key="index"
                        :class="['transit-card', `aspect-${transit.aspect}`]"
                    >
                        <div class="transit-header">
                            <span class="transit-planet">{{ translatePlanetName(transit.transitPlanet) }}</span>
                            <span class="aspect-symbol">{{ getAspectSymbol(transit.aspect) }}</span>
                            <span class="natal-planet">{{ translatePlanetName(transit.natalPlanet) }}</span>
                        </div>

                        <div class="transit-details">
                            <div class="planet-info">
                                <span>Transit {{ transit.transitPlanet }} in {{ translateZodiacName(transit.transitPlanetSign) }}</span>
                            </div>
                            <div class="aspect-name">
                                {{ getAspectName(transit.aspect) }}
                            </div>
                            <div class="planet-info">
                                <span>Natal {{ transit.natalPlanet }} in {{ translateZodiacName(transit.natalPlanetSign) }}</span>
                            </div>
                            <div class="orb-info">
                                Orbis: {{ transit.orb.toFixed(2) }}°
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="!loading && transits" class="no-transits">
                <p>Keine signifikanten Transite für den {{ formattedDate }} gefunden.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useProfilesStore } from '~/stores/profilesStore';
import { useTransits } from '~/composables/useTransits';
import { useTranslateZodiac } from '~/composables/translateZodiac';
import { useProfile } from '~/composables/useProfile';

const profilesStore = useProfilesStore();
const { calculateTransits } = useTransits();
const { translatePlanetName, translateZodiacName } = useTranslateZodiac();
const { formatBirthDate, formatBirthTime } = useProfile();

const transits = ref(null);
const loading = ref(false);
const error = ref('');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const interpretation = ref('');
const interpretationLoading = ref(false);
const selectedProfileId = ref(null);
const selectedProfile = ref(null);

// Compute profile options for the select dropdown
const profileOptions = computed(() => {
    const options = [];

    if (profilesStore.myProfile) {
        options.push({
            value: 'my-profile',
            label: `${profilesStore.myProfile.name} (Mein Profil)`
        });
    }

    profilesStore.friendProfiles.forEach(profile => {
        options.push({
            value: profile.id,
            label: profile.name
        });
    });

    return options;
});

const formattedDate = computed(() => {
    const date = new Date(selectedDate.value);
    return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const onProfileChange = () => {
    if (selectedProfileId.value === 'my-profile') {
        selectedProfile.value = profilesStore.myProfile;
    } else {
        selectedProfile.value = profilesStore.friendProfiles.find(
            p => p.id === selectedProfileId.value
        );
    }

    if (selectedProfile.value) {
        loadTransits();
    }
};

const loadTransits = async () => {
    if (!selectedProfile.value) {
        error.value = 'Bitte wählen Sie ein Profil aus.';
        return;
    }

    loading.value = true;
    error.value = '';
    interpretation.value = '';

    try {
        const transitDate = new Date(selectedDate.value);
        const result = await calculateTransits({
            birthdate: selectedProfile.value.birthdate,
            birthtime: selectedProfile.value.birthtime,
            coordinates: selectedProfile.value.coordinates
        }, transitDate);

        transits.value = result.transits;
    } catch (err) {
        console.error('Fehler beim Laden der Transite:', err);
        error.value = 'Fehler beim Berechnen der Transite. Bitte versuchen Sie es erneut.';
    } finally {
        loading.value = false;
    }
};

const interpretTransits = async () => {
    if (!transits.value || transits.value.length === 0) {
        return;
    }

    interpretationLoading.value = true;

    try {
        const response = await $fetch('/api/interpret-transits', {
            method: 'POST',
            body: {
                transits: transits.value,
                date: formattedDate.value
            }
        });

        interpretation.value = response.interpretation;
    } catch (err) {
        console.error('Fehler beim Interpretieren der Transite:', err);
        error.value = 'Fehler beim Interpretieren der Transite. Bitte versuchen Sie es erneut.';
    } finally {
        interpretationLoading.value = false;
    }
};

const renderMarkdown = (markdown) => {
    if (!markdown) return '';

    // Simple markdown to HTML conversion
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
};

const setToday = () => {
    selectedDate.value = new Date().toISOString().split('T')[0];
    loadTransits();
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

// Load profiles and auto-select if available
onMounted(() => {
    profilesStore.loadFromLocalStorage();

    // Auto-select my profile if available
    if (profilesStore.myProfile) {
        selectedProfileId.value = 'my-profile';
        selectedProfile.value = profilesStore.myProfile;
        loadTransits();
    }
});
</script>

<style scoped>
.transits-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #333;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #555;
}

.error-message {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.profile-selector {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.profile-selector label {
    font-weight: 600;
    color: white;
    font-size: 1.1rem;
    min-width: fit-content;
}

.selected-profile-info {
    background-color: #f0f7ff;
    border: 2px solid #667eea;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.selected-profile-info h3 {
    margin: 0 0 0.5rem 0;
    color: #667eea;
    font-size: 1.3rem;
}

.selected-profile-info p {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
}

.date-selector {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 8px;
}

.date-selector label {
    font-weight: 500;
}

.date-selector input[type="date"] {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

.loading {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #666;
}

.transit-info {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.interpretation-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #f0f7ff;
    border: 2px solid #90caf9;
    border-radius: 8px;
}

.interpretation-section h3 {
    margin-top: 0;
    color: #1976d2;
    font-size: 1.3rem;
}

.interpretation-content {
    line-height: 1.6;
    color: #333;
}

.interpretation-content h2 {
    font-size: 1.2rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #1976d2;
}

.interpretation-content h3 {
    font-size: 1.1rem;
    margin-top: 0.8rem;
    margin-bottom: 0.4rem;
    color: #555;
}

.interpretation-content strong {
    color: #1976d2;
    font-weight: 600;
}

.aspects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.transit-card {
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background-color: white;
    transition: transform 0.2s, box-shadow 0.2s;
}

.transit-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.transit-card.aspect-conjunction {
    border-color: #ff6b6b;
}

.transit-card.aspect-sextile {
    border-color: #4ecdc4;
}

.transit-card.aspect-square {
    border-color: #ff9f43;
}

.transit-card.aspect-trine {
    border-color: #5f27cd;
}

.transit-card.aspect-opposition {
    border-color: #ee5a6f;
}

.transit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.transit-planet,
.natal-planet {
    font-weight: 600;
    font-size: 1.1rem;
}

.aspect-symbol {
    font-size: 1.5rem;
    color: #666;
}

.transit-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.planet-info {
    font-size: 0.9rem;
    color: #666;
}

.aspect-name {
    font-weight: 500;
    text-align: center;
    padding: 0.5rem;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.orb-info {
    font-size: 0.85rem;
    color: #999;
    text-align: right;
}

.no-transits {
    text-align: center;
    padding: 2rem;
    color: #666;
}
</style>
