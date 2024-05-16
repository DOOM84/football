export default defineEventHandler(async (event) => {
    try {
        const url = event.node.req.url;

        if(url!.includes('/api/admin') && !url!.includes('/api/admin/remote')){

         await $fetch('/api/auth', {
                params: {['sb-access-token']: getCookie(event, 'sb-access-token')},
            })
        }

    } catch (e) {
       // await Promise.reject(Error('No access'));
        //console.log(e);
        throw createError({
            fatal: true,
            statusCode: 403,
            message: 'Error occurred'
        })
    }
});