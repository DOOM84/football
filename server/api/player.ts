import prisma from '~/helpers/prisma';
import {IChamp, IPlayer} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singlePlayerTransformer from "~/utils/transformers/singlePlayerTransformer";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };


        const query = getQuery(event);

        const playerDb = await prisma.player.findFirst({
            where: {
                slug: query.slug?.toString(),
            },
            include: {
                country: true,
                team: {
                    include: {
                        champ: true,

                    }
                },
                posts: {
                    orderBy: {
                        assignedAt: 'desc',
                    },
                    include: {
                        post: {include: {champ: true, ecup: true}},
                    },
                    take: 10
                },
            }
        }) as unknown as IPlayer;

        if(!playerDb){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const champ = !playerDb?.team?.champ?.slug ? null :
            await prisma.champ.findFirst({
            where: {
                status: true,
                slug: playerDb?.team?.champ?.slug.toString(),
            },
            include: {
                teams: {
                    where: {
                        status: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                    include: {
                        champ: {select: {name: true, slug: true}}
                    }
                }
            },
        }) as unknown as IChamp;

        const posts  = postListTransformer(playerDb?.posts.map(post => post.post)
            .filter(post => post.status));

        const player = singlePlayerTransformer(playerDb);

        return {player, champ, posts};

    }catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})