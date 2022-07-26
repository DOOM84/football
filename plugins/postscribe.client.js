import {defineNuxtPlugin} from '#app'
import postscribe from 'postscribe';

export default defineNuxtPlugin(nuxtApp => {
    //nuxtApp.vueApp.use(postscribe);
    nuxtApp.provide('scribe', (element, html, options) => postscribe(element, html, options))

})
