import prisma from '~/helpers/prisma';
import type {IChamp} from "~/types/interfaces";
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

        const league = await prisma.league.findFirst({
            where: {
                status: true,
                slug: query.league?.toString(),
            },
            include: {
                results: {
                    orderBy: {
                        stamp: 'asc',
                    },
                    include: {
                        info: {
                            select: {
                                info: true
                            }
                        },
                        home: {
                            include: {
                                team: {select: {name: true, slug: true}}
                            }
                        },
                        away: {
                            include: {
                                team: {select: {name: true, slug: true}}
                            }
                        },
                    }
                },
            },
        }) as unknown as ILeague;

        if(!league){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

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
                }
            }
        }) as unknown as IChamp;

        if(!champ){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const posts = postListTransformer(champ?.posts);

        const results= calendarTransformer(league.results!);

        return {posts, league: league.name, results};

    }catch (e) {

        console.log(e);

        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        });
    }

})