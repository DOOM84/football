import type {User} from "@supabase/auth-js";


export default defineEventHandler(async (event) => {

    // event.context.auth = { user: 'doom' }

    const toName = event.node.req.url?.split("/") as string[];

    if(toName[2] === 'admin' && (toName[toName.length - 1] === 'add' ||
        toName[toName.length - 1] === 'edit' || toName[toName.length - 1] === 'remove'||
        toName[toName.length - 1] === 'uploader')){

        const {user} =  await $fetch<{user: User}>('/api/getUser', {
            params: {['sb-access-token']: getCookie(event, 'sb-access-token')},
        });

        if(!user?.app_metadata?.admin){
            throw createError({
                statusCode: 403,
                message: 'Not found',
            })
        }
    }

})