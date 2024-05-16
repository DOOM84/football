import prisma from '~/helpers/prisma';
import {IPost, ISmallPost} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };


        const query = getQuery(event);

        const tag = await prisma.tag.findFirst({
            where: {
                slug: query.slug?.toString(),
            },
            include: {
                posts: {
                    take: 36,
                    orderBy: {
                        assignedAt: 'desc',
                    },
                    include: {
                        post: {include: {champ: true, ecup: true}},
                    }
                },
            }
        })

        if(!tag){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const posts: ISmallPost[]  = postListTransformer(tag?.posts.map(post => post.post)
            .filter(post => post.status) as unknown as IPost[])


        return {tag: {id: tag.id, name: tag.name, slug: tag.slug}, posts};

    }catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})