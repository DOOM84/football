import type {User} from "@supabase/auth-js";

export default defineNuxtRouteMiddleware(async (to) => {

    const {user} = await $fetch<{user: User}>('/api/getUser',
        {
            headers: useRequestHeaders(["cookie"]) as HeadersInit | undefined,
        });

    if (!(user as User)?.app_metadata?.admin) {

        return abortNavigation({
            statusCode: 404,
            statusMessage: 'not Found',
            fatal: true,
        });
    }
})