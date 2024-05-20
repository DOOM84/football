import { serverSupabaseServiceRole } from '#supabase/server';
//import prisma from "~/helpers/prisma";
//import player from "~/server/api/player";

export default defineEventHandler(async (event) => {
    try {

        const client = serverSupabaseServiceRole(event);

        const {data: {users}, error} = await client.auth.admin.listUsers();

        if (error) throw error;

        const result = users.map(user => ( {
            id: user.id,
            email: user.email,
            login: user.user_metadata.login,
            admin: user.app_metadata.admin,
            avatar: user.user_metadata.avatar,
        }))

        return {users: result};

    }catch (e) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Error occurred'
        })
    }

})