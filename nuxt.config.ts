// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {enabled: false},
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" }
      ],
      meta: [
        {
          name: "title",
          content: "Новости европейского футбола"
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1"
        },
        {
          "charset": "utf-8"
        },
        {
          name: 'keywords',
          content: 'футбол, новости футбола, результаты, матчи, команды, игроки, составы, еврокубки, Лига чемпионов, Лига Европы, Лига конференций, УЕФА'
        },
        {
          name: 'description',
          content: 'Новости европейского футбола, чемпионаты, еврокубки, результаты, матчи, команды, игроки'
        }
      ],
    },
  },
  supabase: {
    redirect: false
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase',  'nuxt-icon'],
  runtimeConfig: {
    apiKey: '',
    apiHost: '',
    algoliaAppId: '',
    algoliaKey: '',
  },
})
