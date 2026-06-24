// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

// Build-Target-Steuerung: BUILD_TARGET=app → reines SPA-Bundle für Capacitor/iOS.
// Ohne Flag = Web (SSR) — das führt Vercel aus.
const isApp = process.env.BUILD_TARGET === 'app'

export default defineNuxtConfig({
  // App-Target = SPA (nuxt generate), Web-Target = SSR.
  ssr: !isApp,

  runtimeConfig: {
    public: {
      // Web: same-origin (''). App: remote Vercel-API (per ENV überschreibbar).
      apiBase: isApp
        ? (process.env.NUXT_PUBLIC_API_BASE || 'https://horoskop.vercel.app')
        : '',
      // Supabase (anon key ist public-safe). NIEMALS service_role hier ablegen.
      // ENV: SUPABASE_URL / SUPABASE_ANON_KEY (bzw. NUXT_PUBLIC_* zur Laufzeit).
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  // Klammer-Gruppen physisch aus dem jeweils anderen Build entfernen
  // (kein Redirect, keine Route vorhanden → 404). Windows-Pfade normalisieren.
  hooks: {
    'pages:extend'(pages) {
      const exclude = isApp ? '/(web)/' : '/(app)/'
      const removeMatching = (list) => {
        for (let i = list.length - 1; i >= 0; i--) {
          const file = (list[i].file || '').replace(/\\/g, '/')
          if (file.includes(exclude)) {
            list.splice(i, 1)
            continue
          }
          if (list[i].children?.length) removeMatching(list[i].children)
        }
      }
      removeMatching(pages)

      // Beide Gruppen haben ein index.vue für '/'. Nuxts Scanner dedupliziert
      // gleiche Pfade und behält genau eines (die (app)-Variante) — nach dem
      // Filtern kann das '/' des Web-Targets daher fehlen. Deshalb '/' explizit
      // auf das index.vue des aktiven Targets setzen bzw. neu einhängen.
      const indexFile = fileURLToPath(
        new URL(`./pages/${isApp ? '(app)' : '(web)'}/index.vue`, import.meta.url),
      )
      const root = pages.find((p) => p.path === '/')
      if (root) root.file = indexFile
      else pages.push({ name: 'index', path: '/', file: indexFile })
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/fonts', '@pinia/nuxt'],

  ui: {
    colorMode: false
  },

  css: [
    '@/assets/css/main.css',
  ],

  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          // viewport-fit=cover ist nötig, damit env(safe-area-inset-*) auf iOS
          // (Notch/Home-Indicator) überhaupt Werte liefert.
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes'
        },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent'
        },
        {
          name: 'format-detection',
          content: 'telephone=no'
        }
      ],
      title: "CosmicPath",
      htmlAttrs: {
        lang: 'de'
      },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ],
      script: [
        {
          src: "https://github.com/Kibo/AstrologyChart2/tree/master/dist#:~:text=8%20months%20ago-,astrochart2.min.js,-v0.7.3",
          type: "text/javascript",
        },
      ],
    }
  },

  compatibilityDate: '2024-11-01'
})