import prisma from '~/helpers/prisma';
import fs from "fs";
import setFilePath from "~/helpers/upload/setFilePath";
export default defineEventHandler(async (event) => {

        try {
            const {id, path} = await readBody(event);

            if (fs.existsSync(setFilePath('/public' + path))) {
                fs.unlinkSync(setFilePath('/public' + path));
            }

            await prisma.team.update({
                where: {
                    id,
                },
                data: {
                    posts: {
                        deleteMany: {},
                    },
                }
            });

                await prisma.team.delete({
                    where: {
                        id
                    },
                })

            return {
                id
            }

        } catch (e) {
            throw createError({
                    statusCode: 404,
                    statusMessage: 'Error occurred'
                })
        }
})
