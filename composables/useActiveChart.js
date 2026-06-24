import { storeToRefs } from 'pinia';
import { useProfilesStore } from '~/stores/profilesStore';
import { useBirthDataStore } from '~/stores/birthDataStore';
import { useTranslateZodiac } from '~/composables/translateZodiac';

const ASPECT_DE = {
  conjunction: 'Konjunktion', opposition: 'Opposition',
  trine: 'Trigon', square: 'Quadrat', sextile: 'Sextil',
};
const ASPECT_SYM = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹',
};
const ASPECT_DEG = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 };

const HOUSE_MEANING = {
  1: 'Selbst · Auftreten', 2: 'Werte · Besitz', 3: 'Kommunikation · Lernen',
  4: 'Wurzeln · Zuhause', 5: 'Kreativität · Liebe', 6: 'Alltag · Gesundheit',
  7: 'Partnerschaft', 8: 'Wandel · Tiefe', 9: 'Philosophie · Reisen',
  10: 'Berufung · Status', 11: 'Freundschaften · Visionen', 12: 'Rückzug · Unbewusstes',
};

const MAIN_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// Zusätzliche seelische Punkte für die ausführliche Deutung.
const EXTRA_POINTS = ['NNode', 'Chiron'];

// Zeichen → Element / Qualität / Herrscher (modern). Schlüssel = englische Zeichennamen.
const SIGN_ELEMENT = {
  Aries: 'Feuer', Leo: 'Feuer', Sagittarius: 'Feuer',
  Taurus: 'Erde', Virgo: 'Erde', Capricorn: 'Erde',
  Gemini: 'Luft', Libra: 'Luft', Aquarius: 'Luft',
  Cancer: 'Wasser', Scorpio: 'Wasser', Pisces: 'Wasser',
};
const SIGN_MODALITY = {
  Aries: 'kardinal', Cancer: 'kardinal', Libra: 'kardinal', Capricorn: 'kardinal',
  Taurus: 'fix', Leo: 'fix', Scorpio: 'fix', Aquarius: 'fix',
  Gemini: 'beweglich', Virgo: 'beweglich', Sagittarius: 'beweglich', Pisces: 'beweglich',
};
const SIGN_RULER = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Pluto', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

export const aspectKind = (a) =>
  a === 'trine' || a === 'sextile' ? 'fluss' : a === 'conjunction' ? 'kraft' : 'spannung';
export const kindColor = { fluss: 'var(--gold)', spannung: 'var(--plum)', kraft: 'var(--cool)' };

// degrees-within-sign → "4°22′"
export const fmtDeg = (angle) => {
  const within = (((angle || 0) % 30) + 30) % 30;
  const d = Math.floor(within);
  let m = Math.round((within - d) * 60);
  let dd = d;
  if (m === 60) { m = 0; dd += 1; }
  return `${dd}°${String(m).padStart(2, '0')}′`;
};

/**
 * Loads the active profile's horoscope into the birthDataStore (which the
 * existing renderers — birthchart.vue, Planets.vue, aspects.vue — read from)
 * and derives screen-ready data for the Merlin design screens.
 */
export const useActiveChart = () => {
  const profilesStore = useProfilesStore();
  const birthDataStore = useBirthDataStore();
  const { horoscope } = storeToRefs(birthDataStore);
  const { getPlanetSymbol, getZodiacSymbol, translatePlanetName, translateZodiacName } = useTranslateZodiac();

  const loading = ref(false);
  const error = ref('');
  const profile = computed(() => profilesStore.profile);

  const ensureLoaded = async () => {
    loading.value = true;
    error.value = '';
    try {
      if (!profilesStore.profile) await profilesStore.fetchProfiles();
      const p = profilesStore.profile;
      if (!p?.birthdate || !p?.birthtime || !p?.coordinates) {
        error.value = 'no-profile';
        return;
      }
      birthDataStore.setName(p.name);
      birthDataStore.setBirthdata(p.birthdate, p.birthtime, p.coordinates);
      await birthDataStore.fetchHoroscope();
    } catch (e) {
      error.value = e?.message || 'error';
    } finally {
      loading.value = false;
    }
  };

  // name → house number
  const houseOf = (name) => {
    const houses = horoscope.value?.houses?.Houses || [];
    for (const h of houses) {
      if (h.planets?.some((pl) => pl.name === name)) return h.houseNumber;
    }
    return null;
  };

  const positionOf = (name) =>
    (horoscope.value?.planetaryPositions || []).find((p) => p.name === name);

  const bigThree = computed(() => {
    const sun = positionOf('Sun');
    const moon = positionOf('Moon');
    const ascDeg = horoscope.value?.houses?.Ascendant;
    const ascSign = horoscope.value?.houses?.Houses?.[0]?.zodiacSign;
    return [
      { glyph: 'Q', label: 'Sonne', sign: sun ? translateZodiacName(sun.zodiacSign) : '–', sub: sun ? fmtDeg(sun.angle) : '' },
      { glyph: 'R', label: 'Mond', sign: moon ? translateZodiacName(moon.zodiacSign) : '–', sub: moon ? fmtDeg(moon.angle) : '', featured: true },
      { glyph: '`', label: 'Asz.', sign: ascSign ? translateZodiacName(ascSign) : '–', sub: ascDeg != null ? fmtDeg(ascDeg) : '' },
    ];
  });

  const planets = computed(() => {
    const positions = horoscope.value?.planetaryPositions || [];
    return MAIN_PLANETS
      .map((name) => positions.find((p) => p.name === name))
      .filter(Boolean)
      .map((p) => ({
        name: p.name,
        astro: getPlanetSymbol(p.name),
        de: translatePlanetName(p.name),
        sign: translateZodiacName(p.zodiacSign),
        signEn: p.zodiacSign,
        signGlyph: getZodiacSymbol(p.zodiacSign),
        deg: fmtDeg(p.angle),
        house: houseOf(p.name),
      }));
  });

  const houses = computed(() =>
    (horoscope.value?.houses?.Houses || []).map((h) => ({
      n: h.houseNumber,
      sign: translateZodiacName(h.zodiacSign),
      signGlyph: getZodiacSymbol(h.zodiacSign),
      desc: HOUSE_MEANING[h.houseNumber] || '',
      // Planeten/Punkte, die in diesem Haus stehen – jeweils mit Glyph
      bodies: (h.planets || []).map((pl) => ({
        name: pl.name,
        astro: getPlanetSymbol(pl.name),
        de: translatePlanetName(pl.name),
        sign: translateZodiacName(pl.sign),
        signGlyph: getZodiacSymbol(pl.sign),
        deg: fmtDeg(pl.degree),
      })),
    }))
  );

  // Mondknoten, Chiron – die zusätzlichen seelischen Punkte
  const points = computed(() => {
    const positions = horoscope.value?.planetaryPositions || [];
    return EXTRA_POINTS
      .map((name) => positions.find((p) => p.name === name))
      .filter(Boolean)
      .map((p) => ({
        name: p.name,
        astro: getPlanetSymbol(p.name),
        de: translatePlanetName(p.name),
        sign: translateZodiacName(p.zodiacSign),
        signGlyph: getZodiacSymbol(p.zodiacSign),
        deg: fmtDeg(p.angle),
        house: houseOf(p.name),
      }));
  });

  // Hauptachsen: Aszendent, MC (Himmelsmitte), IC (Wurzeln)
  const angles = computed(() => {
    const hs = horoscope.value?.houses?.Houses;
    if (!hs?.length) return null;
    return {
      asc: translateZodiacName(hs[0]?.zodiacSign),   // 1. Haus = Aszendent
      mc: translateZodiacName(hs[9]?.zodiacSign),     // 10. Haus = MC
      ic: translateZodiacName(hs[3]?.zodiacSign),     // 4. Haus = IC
    };
  });

  // Chart-Herrscher = Herrscher des Aszendenten-Zeichens
  const chartRuler = computed(() => {
    const ascSignEn = horoscope.value?.houses?.Houses?.[0]?.zodiacSign;
    if (!ascSignEn) return null;
    const rulerEn = SIGN_RULER[ascSignEn];
    const pos = positionOf(rulerEn);
    return {
      de: translatePlanetName(rulerEn),
      ascSign: translateZodiacName(ascSignEn),
      sign: pos ? translateZodiacName(pos.zodiacSign) : null,
      house: houseOf(rulerEn),
    };
  });

  // Element- & Qualitäts-Balance über die zehn Hauptplaneten + Aszendent
  const balance = computed(() => {
    const positions = horoscope.value?.planetaryPositions || [];
    const signs = MAIN_PLANETS.map((n) => positions.find((p) => p.name === n)?.zodiacSign).filter(Boolean);
    const ascSign = horoscope.value?.houses?.Houses?.[0]?.zodiacSign;
    if (ascSign) signs.push(ascSign);
    const elements = { Feuer: 0, Erde: 0, Luft: 0, Wasser: 0 };
    const modalities = { kardinal: 0, fix: 0, beweglich: 0 };
    for (const s of signs) {
      if (SIGN_ELEMENT[s]) elements[SIGN_ELEMENT[s]] += 1;
      if (SIGN_MODALITY[s]) modalities[SIGN_MODALITY[s]] += 1;
    }
    return { elements, modalities };
  });

  const aspects = computed(() => {
    const list = horoscope.value?.aspects || [];
    return list
      .filter((a) => ASPECT_DEG[a.aspect] != null)
      .map((a) => {
        const [p1, p2] = a.planets;
        const orb = Math.abs((a.exactAngle ?? 0) - ASPECT_DEG[a.aspect]);
        const kind = aspectKind(a.aspect);
        return {
          a: getPlanetSymbol(p1), b: getPlanetSymbol(p2),
          aDe: translatePlanetName(p1), bDe: translatePlanetName(p2),
          aEn: p1, bEn: p2, type: a.aspect,
          name: ASPECT_DE[a.aspect], sym: ASPECT_SYM[a.aspect],
          orb: `${orb.toFixed(2)}°`, orbVal: orb,
          kind, color: kindColor[kind],
        };
      })
      .sort((x, y) => x.orbVal - y.orbVal);
  });

  return {
    horoscope, profile, loading, error, ensureLoaded,
    bigThree, planets, houses, aspects,
    points, angles, chartRuler, balance,
  };
};
