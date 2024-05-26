import prisma from '~/helpers/prisma';
import {IEcup, IPost} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleEcupResultsTransformer from "~/utils/transformers/singleEcupResultsTransformer";
import ecupTransformer from "~/utils/transformers/ecupTransformer";

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
                                info:true
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
                    take: +query.count!
                },
                stands: {
                    orderBy: {
                        order: 'asc',
                    },
                    include: {
                        ecupTeam: {
                            include: {
                                team: true
                            }
                        }
                    }
                }
            },

        }) as unknown as IEcup;

        if(!ecup){
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const headLinesDb = await prisma.post.findMany({
            where: {
                status: true,
                is_headline: true,
                ecup_id: ecup?.id,
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                ecup: true,
            },
            take: 4
        }) as unknown as IPost[];

        const posts = postListTransformer(ecup?.posts);

        const headLines = postListTransformer(headLinesDb);

        const ecupStands = ecupTransformer(ecup);

        const {groupResults, poResults} =
            singleEcupResultsTransformer(ecup.results);

        return {ecup: {name: ecup.name, slug: ecup.slug, id: ecup.id}, posts, headLines, ecupStands, groupResults, poResults};

    } catch (e) {
        console.log(e);
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})