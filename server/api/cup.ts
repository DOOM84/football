import prisma from '~/helpers/prisma';
import type {IChamp, ICup, IPost} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import cupResultsTransformer from "~/utils/transformers/cupResultsTransformer";

export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query = getQuery(event);

        const cup = await prisma.cup.findFirst({
            where: {
                status: true,
                slug: query.cup?.toString(),
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
                                team: true
                            }
                        },
                        away: {
                            include: {
                                team: true
                            }
                        },
                    }
                },
            },

        }) as unknown as ICup;

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

        if (!cup) {
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const posts: IPost[] = postListTransformer(champ.posts);

        const {results} =
            cupResultsTransformer(cup.results);

        return {cup: {name: cup.name, slug: cup.slug, id: cup.id}, posts, results};

    } catch (e) {
        console.log(e);


        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})