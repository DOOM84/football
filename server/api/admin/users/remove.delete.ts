import {serverSupabaseServiceRole} from "#supabase/server";
import fs from "fs";
import setFilePath from "~/helpers/upload/setFilePath";
import prisma from "~/helpers/prisma";
export default defineEventHandler(async (event) => {

        try {
            const client = serverSupabaseServiceRole(event);

            const {id, path} = await readBody(event);

            if (fs.existsSync(setFilePath('/public' + path))) {
                fs.unlinkSync(setFilePath('/public' + path));
            }

            const { error} =  await client.auth.admin.deleteUser(id);

            if (error) throw error;


            await prisma.profile.update({
                where: {
                    user_id: id,
                },
                data: {
                    comments: {
                        deleteMany: {},
                    },
                    rates: {
                        deleteMany: {},
                    },
                }
            });

            await prisma.profile.delete({
                where: {
                    user_id: id
                },
            })

            return {
                id
            }

        } catch (e) {

            console.log(e);

            throw createError({
                    statusCode: 404,
                    message: 'Error occurred'
                })
        }
})
