import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        astronomicon: ['Astronomicon', 'serif'],
        justcosmic: ['JustCosmic', 'sans-serif'],
      },
      colors: {
        beige: {
          50: '#FDFAF5',
          100: '#F5ECDC',
          200: '#EBD9BE',
          300: '#E1C6A1',
          400: '#D7C9B2',
          500: '#C4B09C',
          600: '#A99383',
          700: '#8B7769',
          800: '#7B7369',
          900: '#4D4845',
          950: '#1F1D20',
        },
        brown: {
          DEFAULT: '#7B7369',
          dark: '#4D4845',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
