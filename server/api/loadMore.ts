import prisma from '~/helpers/prisma';
import type {IPlayer, IPost, ITag} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";

export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query = getQuery(event);

        const offset = parseInt(<string>query.offset) as number;
        const limit = parseInt(<string>query.limit) as number;

        const champ = query.champId ? parseInt(<string>query.champId) as number : undefined;
        const ecup = query.ecupId ? parseInt(<string>query.ecupId) as number : undefined;
        const tag = query.tagId ? parseInt(<string>query.tagId) as number : undefined;
        const player = query.playerId ? parseInt(<string>query.playerId) as number : undefined;

        if (!Number.isInteger(offset) || !Number.isInteger(limit)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID should be an integer',
            })
        }

        if (Number.isInteger(tag)) {
            const tagDb = await prisma.tag.findFirst({
                where: {
                    id: tag,
                },
                include: {
                    posts: {
                        orderBy: {
                            assignedAt: 'desc',
                        },
                        take: limit,
                        skip: offset,
                        include: {
                            post: {
                                include: {champ: true, ecup: true}
                            },
                        },

                    },
                }
            }) as unknown as ITag;

            return postListTransformer(tagDb?.posts.map(post => post.post)
                .filter(post => post.status));

        } else if (Number.isInteger(player)) {

            const playerDb = await prisma.player.findFirst({
                where: {
                    id: player,
                },
                include: {
                    posts: {
                        orderBy: {
                            assignedAt: 'desc',
                        },
                        take: limit,
                        skip: offset,
                        include: {
                            post: {
                                include: {champ: true, ecup: true}
                            },
                        },

                    },
                }
            }) as unknown as IPlayer;

            return postListTransformer(playerDb?.posts.map(post => post.post)
                .filter(post => post.status));

        } else {
            const postsDb = await prisma.post.findMany({
                where: {
                    status: true,
                    champ_id: champ,
                    ecup_id: ecup,
                },
                orderBy: {
                    date: 'desc',
                },
                include: {
                    ecup: true,
                    champ: true
                },
                take: limit,
                skip: offset
            }) as unknown as IPost[]

            return postListTransformer(postsDb);
        }


    } catch (e) {
        console.log(e);
        /*throw createError({
            statusCode: 400,
            statusMessage: 'ID should be an integer',
        })*/
    }

})