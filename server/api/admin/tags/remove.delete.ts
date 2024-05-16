import prisma from '~/helpers/prisma';

export default defineEventHandler(async (event) => {

    try {
        const {id} = await readBody(event);

         await prisma.tag.update({
             where: {
                 id,
             },
             data: {
                 posts: {
                     deleteMany: {},
                 },
             }
         });

         await prisma.tag.delete({
             where: {
                 id
             },
         })

        return {
            id
        }

    } catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            statusMessage: 'Error occurred'
        })
    }
})
