import VueScrollTo from 'vue-scrollto'

export default defineNuxtPlugin((nuxtApp) => {
    /*nuxtApp.vueApp.use(VueScrollTo, {
        container: "body",
        duration: 500,
        easing: "ease",
        offset: 0,
        force: true,
        cancelable: true,
        onStart: false,
        onDone: false,
        onCancel: false,
        x: false,
        y: true
    });*/

    return {
        provide: {
            scrollTo: (element: any, duration: any, options: any)  => VueScrollTo.scrollTo(element, duration, options)
        }
    }

  //  nuxtApp.provide('scrollTo', (element: any, duration: any, options: any) => VueScrollTo.scrollTo(element, duration, options))
});