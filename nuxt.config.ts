// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/fonts', '@pinia/nuxt', '@nuxtjs/i18n'],

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
          content: 'width=device-width, initial-scale=1.0, user-scalable=no'
        }
      ],
      title: "CosmicPath",
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