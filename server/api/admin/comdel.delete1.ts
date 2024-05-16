import prisma from '~/helpers/prisma';
export default defineEventHandler(async (event) => {

        try {
            const {id} = await readBody(event);

                await prisma.comment.delete({
                    where: {
                        id
                    },
                })

            return {
                toDel: id
            }

        } catch (e) {
            throw createError({
                    statusCode: 404,
                    statusMessage: 'Error occurred'
                })
        }
})
