export default defineNuxtRouteMiddleware(async (to, from) => {

    /*const nuxtApp = useNuxtApp()
    if (process.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return*/

    try {

        /*await $fetch<{access: boolean }>('/api/auth', {
            headers: useRequestHeaders(["cookie"]) as HeadersInit | undefined,
        });*/

    } catch (e) {
        return navigateTo('/error')
        /*throw createError({
            //  fatal: true,
            statusCode: 404,
            message: 'Страница не найдена'
        })*/
        /*return abortNavigation(
            createError({
                statusCode: 404,
                message: 'The route could not be found :(',
            })
        );*/
     //   return navigateTo('/error');
        /*throw createError({
          //  fatal: true,
            statusCode: 404,
            message: 'Страница не найдена'
        })*/
    }
});