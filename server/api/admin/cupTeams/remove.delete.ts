import prisma from '~/helpers/prisma';
export default defineEventHandler(async (event) => {

        try {
            const {id} = await readBody(event);

                await prisma.cupTeam.delete({
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
