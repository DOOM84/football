import {defineNuxtConfig} from 'nuxt'

export default defineNuxtConfig({

    meta: {
        title: 'Новости европейского футбола',
        meta: [
            {
                name: 'keywords',
                content: 'футбол, новости футбола, результаты, матчи, команды, игроки, составы, еврокубки, Лига чемпионов, Лига Европы, Лига конференций, УЕФА'
            },
            {
                hid: 'description',
                name: 'description',
                content: 'Новости европейского футбола, чемпионаты, еврокубки, результаты, матчи, команды, игроки'
            }
        ],
        link: [
            {
                rel: 'stylesheet',
                href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css'
            },
            {rel: 'icon', type: "image/x-icon", href: '/favicon.ico'},
        ],
        /* script: [
             {
                 defer: true,
                 async: true,
                 src: 'https://platform.twitter.com/widgets.js',
             },
            /!* {
                 src: '@/node_modules/@ckeditor/ckeditor5-vue/dist/ckeditor.js',
             }*!/

         ]*/
    },

    runtimeConfig: {
        apiKey: '',
        apiHost: '',
        algoliaAppId: '',
        algoliaKey: '',
    },

    css: ["@/assets/scss/main.scss"],

    vite: {
        server: {
            hmr: {
                overlay: false
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@import "@/assets/scss/table.scss";',
                    charset: false,
                },
            },
        },
    },


    /*buildModules: [
        '~/modules/errorPage',
        // '@intlify/nuxt3'
        //'~/modules/vuei18n',
    ],*/


})
