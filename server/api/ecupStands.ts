import prisma from '~/helpers/prisma';
import {IEcupDB, IEcupStands, IPost, ISmallPost} from "~/types/interfaces";
import postListTransformer from "~/utils/transformers/postListTransformer";
import singleEcupTransformer from "~/utils/transformers/singleEcupTransformer";

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

        const ecupStands: IEcupStands = singleEcupTransformer(ecup as unknown as IEcupDB);

        return {ecup: {name: ecup.name, slug: ecup.slug, id: ecup.id}, posts, ecupStands};

    } catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})