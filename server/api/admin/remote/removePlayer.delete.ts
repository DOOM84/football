import prisma from '~/helpers/prisma';
export default defineEventHandler(async (event) => {

        try {
            const {apiId} = await readBody(event);

            await prisma.player.update({
                where: {
                    api_id: apiId
                },
                data: {
                    posts: {
                        deleteMany: {},
                    },
                    scorer:{
                        delete: {}
                    }
                }
            })

                await prisma.player.delete({
                    where: {
                        api_id: apiId
                    }
                })

            return {
                id: apiId
            }

        } catch (e) {
            console.log(e);
            throw createError({
                    statusCode: 404,
                    statusMessage: 'Error occurred'
                })
        }
})
