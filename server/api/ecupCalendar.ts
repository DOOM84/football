import prisma from '~/helpers/prisma';
import {IPost, IScore, ISmallPost} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";

export default defineEventHandler(async (event) => {

    // await new Promise(resolve => setTimeout(resolve, 5000));
    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const query = getQuery(event);

        const ecup = await prisma.ecup.findFirst({
            where: {
                status: true,
                slug: query.ecup?.toString(),
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
                        ecup: {
                            select: {slug: true}
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
                posts: {
                    where: {
                        status: true,
                    },
                    include: {
                        ecup: true,
                    },
                    orderBy: {
                        date: 'desc',
                    },
                    take: 15
                },
            },

        })

        if (!ecup) {
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const posts: ISmallPost[] = postListTransformer(ecup?.posts as unknown as IPost[]);

        const {groupResults, poResults} =
            singleEcupResultsTransformer(ecup.results as unknown as IScore[]);

        return {ecup: {name: ecup.name, slug: ecup.slug, id: ecup.id}, posts, groupResults, poResults};

    } catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})