import { pl } from "date-fns/locale";

export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'de',
    messages: {
      de: {
        zodiacs: {
          aries: 'Widder',
          taurus: 'Stier',
          gemini: 'Zwillinge',
          cancer: 'Krebs',
          leo: 'Löwe',
          virgo: 'Jungfrau',
          libra: 'Waage',
          scorpio: 'Skorpion',
          sagittarius: 'Schütze',
          capricorn: 'Steinbock',
          aquarius: 'Wassermann',
          pisces: 'Fische'
        },
      
        planets: {
          sun: 'Sonne',
          moon: 'Mond',
          mercury: 'Merkur',
          venus: 'Venus',
          mars: 'Mars',
          jupiter: 'Jupiter',
          saturn: 'Saturn',
          uranus: 'Uranus',
          neptune: 'Neptun',
          pluto: 'Pluto'
        }
      },
      en: {
        zodiacs: {
          aries: 'Aries',
          taurus: 'Taurus',
          gemini: 'Gemini',
          cancer: 'Cancer',
          leo: 'Leo',
          virgo: 'Virgo',
          libra: 'Libra',
          scorpio: 'Scorpio',
          sagittarius: 'Sagittarius',
          capricorn: 'Capricorn',
          aquarius: 'Aquarius',
          pisces: 'Pisces'
        },

        planets: {
          sun: 'Sun',
          moon: 'Moon',
          mercury: 'Mercury',
          venus: 'Venus', 
          mars: 'Mars',
          jupiter: 'Jupiter',
          saturn: 'Saturn',
          uranus: 'Uranus',
          neptune: 'Neptune',
          pluto: 'Pluto'
      },
      fr: {
        zodiacs:{
          aries: 'Bélier',
          taurus: 'Taureau',
          gemini: 'Gémeaux',
          cancer: 'Cancer',
          leo: 'Lion',
          virgo: 'Vierge',
          libra: 'Balance',
          scorpio: 'Scorpion',
          sagittarius: 'Sagittaire',
          capricorn: 'Capricorne',
          aquarius: 'Verseau',
          pisces: 'Poissons'
        },

        planets: {
          sun: 'Soleil',
          moon: 'Lune',
          mercury: 'Mercure',
          venus: 'Vénus',
          mars: 'Mars',
          jupiter: 'Jupiter',
          saturn: 'Saturne',
          uranus: 'Uranus',
          neptune: 'Neptune',
          pluto: 'Pluton'
      }
    }
  }}}));