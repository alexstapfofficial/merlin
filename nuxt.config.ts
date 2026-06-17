// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/fonts', '@pinia/nuxt', '@nuxtjs/i18n'],

  ui: {
    colorMode: false
  },

  i18n: {
    vueI18n: './i18n.config.ts'
  },

  css: [
    '@/assets/css/main.css',
  ],

  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
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