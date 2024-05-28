import prisma from '~/helpers/prisma';
import {IChamp} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import calendarTransformer from "~/utils/transformers/calendarTransformer";

export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query= getQuery(event);

        const champ = await prisma.champ.findFirst({
            where: {
                status: true,
                slug: query.champ?.toString(),
            },
            include: {
                posts: {
                    where: {
                        status: true,
                    },
                    include: {
                        ecup: true,
                        champ: true
                    },
                    orderBy: {
                        date: 'desc',
                    },
                    take: 10
                },

                results: {
                    orderBy: {
                        stamp: 'asc',
                    },
                    include: {
                        info: true,
                        home: {select: {slug: true, sprite: true, name: true, api_id: true}},
                        away: {select: {slug: true, sprite: true, name: true, api_id: true}},
                        champ: {select: {name: true, slug: true}}
                    }
                }
            },
        }) as unknown as IChamp;

        if(!champ){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const posts = postListTransformer(champ?.posts);

        const results  = calendarTransformer(champ.results!);

        return {posts, champ: champ.name, results};

    }catch (e) {
        console.log(e);
        throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            });
    }

})