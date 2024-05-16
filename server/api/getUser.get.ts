import {serverSupabaseServiceRole} from "#supabase/server";

export default defineEventHandler(async (event) => {
    try {

        const client = serverSupabaseServiceRole(event);

        const token = getCookie(event, 'sb-access-token') || getQuery(event)['sb-access-token'] as string;

        const { data, error }  = await client.auth.getUser(token);

        return {user: data?.user || null}

    }catch (e) {
        console.log(e);
    }

})