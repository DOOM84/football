import prisma from '~/helpers/prisma';
import type {IEcup} from "~/types/interfaces";
import ecupTransformer from '~/utils/transformers/ecupTransformer';
import postListTransformer from "~/utils/transformers/postListTransformer";

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

        }) as unknown as IEcup;

        if (!ecup) {
            throw createError({
                statusCode: 404,
                message: 'Страница не найдена',
            })
        }

        const posts = postListTransformer(ecup.posts);

        const ecupStands = ecupTransformer(ecup);

        return {ecup: {name: ecup.name, slug: ecup.slug, id: ecup.id}, posts, ecupStands};

    } catch (e) {
        throw createError({
            statusCode: 404,
            message: 'Страница не найдена',
        })
    }

})