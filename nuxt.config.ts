// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/content', '@nuxt/fonts'],
  extends: ['@nuxt/ui-pro'],
  css: [
    '@/assets/css/main.css',
  ],
  app:{
    head:{
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
  }
})